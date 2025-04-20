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
    // Validate HTTP method
    if (req.method !== "POST") {
      resUtil(res, 405, "Method Not Allowed");
      return;
    }

    // Extract required fields from request body
    const { tableId, feedback } = req.body;

    // Validate payload
    if (!tableId || !feedback || typeof feedback !== "object") {
      resUtil(res, 400, "Invalid payload: tableId and feedback object required.");
      return;
    }

    // ✅ Check if a "bill_requested" alert already exists for this table
    const { data: existingAlert, error: checkError } = await supabaseClient
      .from("table_alerts_live")
      .select("id")
      .eq("tableId", tableId)
      .eq("alertType", "bill_requested")
      .maybeSingle();

    if (checkError) {
      throw new Error(`Error checking existing alert: ${checkError.message}`);
    }

    // 🔁 If alert already exists, skip feedback and respond
    if (existingAlert) {
      resUtil(res, 200, { message: "Bill request submitted successfully." });
      return;
    }

    // 1️⃣ Insert into Supabase `table_alerts_live`
    const { error: supabaseError } = await supabaseClient
      .from("table_alerts_live")
      .insert([{ tableId, alertType: "bill_requested" }]);

    if (supabaseError) {
      throw new Error(`Supabase insert error: ${supabaseError.message}`);
    }

    // 2️⃣ Group menuIds by upvotes and downvotes
    const upvoteIds = [];
    const downvoteIds = [];

    for (const [menuId, vote] of Object.entries(feedback)) {
      if (vote === 1) upvoteIds.push(menuId);
      if (vote === 0) downvoteIds.push(menuId);
    }

    // 3️⃣ Update upvotes in a single query if applicable
    if (upvoteIds.length > 0) {
      const placeholders = upvoteIds.map(() => "?").join(", ");
      const sqlQuery = `UPDATE menu SET upvotes = COALESCE(upvotes, 0) + 1 WHERE menuId IN (${placeholders})`;
      await queryD1(sqlQuery, upvoteIds);
    }

    // 4️⃣ Update downvotes in a single query if applicable
    if (downvoteIds.length > 0) {
      const placeholders = downvoteIds.map(() => "?").join(", ");
      const sqlQuery = `UPDATE menu SET downvotes = COALESCE(downvotes, 0) + 1 WHERE menuId IN (${placeholders})`;
      await queryD1(sqlQuery, downvoteIds);
    }

    // ✅ Final response
    resUtil(res, 200, { message: "Bill request submitted successfully." });

  } catch (error) {
    console.error("Error processing request:", error);
    resUtil(res, 500, `Request could not be processed. Error: ${error.message || error}`);
  }
};

// Export API with CORS and authentication
module.exports = allowCors(handler);
