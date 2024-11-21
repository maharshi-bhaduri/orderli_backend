import { allowCors, resUtil } from "../utils/utils";
import supabaseClient from "../utils/supabaseClient";

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

    // Extract the array of items from the request body
    const items = req.body;

    // Validate the payload
    if (!Array.isArray(items) || items.length === 0) {
      resUtil(res, 400, "Invalid payload: Expected a non-empty array of items");
      return;
    }

    // Prepare the SQL query for D1
    const sqlQuery = `
      SELECT itemName, price as itemPrice
      FROM menu
      WHERE menuId = ? AND partnerId = ?;
    `;

    // Create an array to store item details for batch insert
    const itemDetailsList = [];

    // Query D1 for each item
    for (const { menuId, partnerId, quantity, tableId } of items) {
      if (!menuId || !partnerId || !quantity || !tableId) {
        resUtil(
          res,
          400,
          `Missing required fields for one or more items: menuId or partnerId or quantity or tableId`
        );
        return;
      }

      const params = [menuId, partnerId];
      const menuData = await queryD1(sqlQuery, params);

      if (!(menuData.success && menuData.result?.[0]?.success)) {
        console.error("Error in D1 API response:", menuData.errors);
        throw new Error("D1 API query failed");
      }

      const menuDetails = menuData.result[0].results;

      // Ensure item details exist
      if (!menuDetails || menuDetails.length === 0) {
        resUtil(
          res,
          404,
          `Menu item not found for menuId: ${menuId} and partnerId: ${partnerId}`
        );
        return;
      }

      // Add item details to the list
      const { itemName, itemPrice } = menuDetails[0];
      itemDetailsList.push({
        partnerId,
        menuId,
        itemName,
        itemPrice,
        quantity,
        tableId,
      });
    }

    // Insert all items into the Supabase database
    const { data, error } = await supabaseClient
      .from("order_items_live")
      .insert(itemDetailsList);

    // Handle Supabase errors
    if (error) {
      throw new Error(`Supabase insert error: ${error.message}`);
    }

    // Respond with success
    resUtil(res, 200, {
      message: "Orders created successfully.",
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
