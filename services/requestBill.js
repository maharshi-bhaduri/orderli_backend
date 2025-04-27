import { allowCors, resUtil, verifyAuth } from "../utils/utils";
import supabaseClient from "../utils/supabaseClient";

// Cloudflare D1 Credentials
const D1_API_URL = process.env.D1_API_URL;
const D1_API_KEY = process.env.D1_API_KEY;

// Function to query Cloudflare D1
async function queryD1(sqlQuery, params = []) {
  const response = await fetch(D1_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${D1_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ sql: sqlQuery, params }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(`Error querying D1: ${JSON.stringify(data.errors || data)}`);
  }
  return data;
}

// Handler for "Request Bill" API
const handler = async (req, res) => {
  try {
    if (req.method !== "POST") {
      resUtil(res, 405, "Method Not Allowed");
      return;
    }

    const { tableId, feedback } = req.body;
    if (!tableId || !feedback || typeof feedback !== "object") {
      resUtil(res, 400, "Invalid payload: tableId and feedback object required.");
      return;
    }

    // Check for existing alert
    const { data: existingAlert, error: checkError } = await supabaseClient
      .from("table_alerts_live")
      .select("id")
      .eq("tableId", tableId)
      .eq("alertType", "bill_requested")
      .maybeSingle();

    if (checkError) {
      throw new Error(`Error checking existing alert: ${checkError.message}`);
    }

    if (!existingAlert) {
      // Insert bill_requested alert
      const { error: supabaseError } = await supabaseClient
        .from("table_alerts_live")
        .insert([{ tableId, alertType: "bill_requested" }]);

      if (supabaseError) {
        throw new Error(`Supabase insert error: ${supabaseError.message}`);
      }
    }

    // ✅ Fetch order items
    const { data: orderItems, error: orderError } = await supabaseClient
      .from("order_items_live")
      .select("menuId, itemName, quantity, itemPrice, partnerId")
      .eq("tableId", tableId);

    if (orderError) {
      throw new Error(`Error fetching order items: ${orderError.message}`);
    }
    if (!orderItems || orderItems.length === 0) {
      throw new Error(`No active order items found for tableId ${tableId}`);
    }

    const partnerId = orderItems[0].partnerId; // assume all from same partner

    // ✅ Calculate subtotal
    let subTotal = 0;
    orderItems.forEach(item => {
      subTotal += (item.itemPrice || 0) * (item.quantity || 1);
    });

    // ✅ Fetch billing details
    const billingQuery = `SELECT * FROM billing_details WHERE partnerId = ? LIMIT 1`;
    const billingDetails = await queryD1(billingQuery, [partnerId]);
    const billingInfo = billingDetails?.result?.[0]?.results?.[0] || {};

    let totalCharges = 0;
    let totalDiscounts = 0;
    let chargeBreakdown = [];
    let discountBreakdown = [];
    console.log("billingDetails", billingDetails?.result?.[0]?.results?.[0])


    // ✅ Handle charges
    if (billingInfo.charges) {
      console.log("charges present");
      try {
        const charges = JSON.parse(billingInfo.charges);
        charges.forEach(charge => {
          const value = parseFloat(charge.value || 0);
          let amount = 0;
          if (charge.type === "%") {
            amount = (subTotal * value) / 100;
          } else {
            amount = value;
          }
          console.log('charges :', totalCharges)
          totalCharges += amount;
          chargeBreakdown.push({ label: charge.label, amount, optional: charge.optional });
        });
      } catch (err) {
        console.error("Error parsing charges JSON:", err);
      }
    }

    // ✅ Handle discounts
    if (billingInfo.discounts) {
      try {
        const discounts = JSON.parse(billingInfo.discounts);
        discounts.forEach(discount => {
          const value = parseFloat(discount.value || 0);
          let amount = 0;
          if (discount.type === "%") {
            amount = (subTotal * value) / 100;
          } else {
            amount = value;
          }
          totalDiscounts += amount;
          discountBreakdown.push({ label: discount.label, amount });
        });
      } catch (err) {
        console.error("Error parsing discounts JSON:", err);
      }
    }

    const grandTotal = subTotal + totalCharges - totalDiscounts;

    // ✅ Prepare final bill object
    const billData = {
      items: orderItems.map(item => ({
        itemName: item.itemName,
        quantity: item.quantity,
        itemPrice: item.itemPrice,
      })),
      subTotal,
      charges: chargeBreakdown,      // [{ label: 'Service Charge', amount: 90 }, { label: 'GST', amount: 45 }]
      discounts: discountBreakdown,  // [{ label: 'Promo10', amount: 100 }]
      grandTotal,
    };

    // ✅ Respond back with bill JSON
    resUtil(res, 200, { message: "Bill request submitted successfully.", bill: billData });

  } catch (error) {
    console.error("Error processing request:", error);
    resUtil(res, 500, `Request could not be processed. Error: ${error.message || error}`);
  }
};

// Export API with CORS and authentication
module.exports = allowCors(handler);
