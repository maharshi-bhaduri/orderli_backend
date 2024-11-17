import { allowCors, resUtil } from "../utils/utils";
import supabaseClient from "../utils/supabaseClient"

// Define Cloudflare D1 credentials
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
  console.log('data', data)

  if (!response.ok) {
    throw new Error(
      `Error querying D1: ${JSON.stringify(data.errors || data)}`
    );
  }
  return data;
}

// Handler for the API endpoint
const handler = async (req, res) => {
  try {
    // Validate the HTTP method
    if (req.method !== "POST") {
      resUtil(res, 405, "Method Not Allowed");
      return;
    }

    // Extract the required data from the request body
    const { menuId, partnerId } = req.body;

    // Ensure all required fields are provided
    if (!menuId || !partnerId) {
      resUtil(res, 400, "Missing required fields: menuId or partnerId");
      return;
    }

    // SQL query to get item details from D1
    const sqlQuery = `
      SELECT itemName, price as itemPrice
      FROM menu
      WHERE menuId = ? AND partnerId = ?;
    `;
    const params = [menuId, partnerId];

    // Query D1 for menu details
    const menuData = await queryD1(sqlQuery, params);
    if (!(menuData.success && menuData.result?.[0]?.success)) {
      console.error('Error in D1 API response:', data.errors);
      throw new Error('D1 API query failed');
    }
    const menuDetails = menuData.result[0].results
    console.log('menuDetails', menuDetails)

    // Ensure item details exist
    if (!menuDetails || menuDetails.length === 0) {
      resUtil(res, 404, "Menu item not found for the given menuId and partnerId");
      return;
    }

    // Extract item details
    const { itemName, itemPrice } = menuDetails[0];

    // Insert the details into the Supabase database
    const { data, error } = await supabaseClient
      .from("order_items_live")
      .insert([
        {
          partnerId,
          menuId,
          itemName,
          itemPrice,
        },
      ]);

    // Handle Supabase errors
    if (error) {
      throw new Error(`Supabase insert error: ${error.message}`);
    }

    // Respond with success
    resUtil(res, 200, {
      message: "Order created successfully.",
      data,
    });
  } catch (error) {
    console.error("Error processing request:", error);
    resUtil(
      res,
      500,
      `Request could not be processed. Error: ${error.message || error}`
    );
  }
};

module.exports = allowCors(handler);
