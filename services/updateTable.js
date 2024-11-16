import { allowCors, resUtil } from "../utils/utils";

// Define your Cloudflare D1 credentials and endpoint
const D1_API_URL = process.env.D1_API_URL;
const D1_API_KEY = process.env.D1_API_KEY;

async function queryD1(sqlQuery, params = []) {
  const response = await fetch(D1_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${D1_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sql: sqlQuery,
      params,
    }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(
      `Error querying D1: ${JSON.stringify(data.errors || data)}`
    );
  }
  return data;
}

const handler = async (req, res) => {
  try {
    // Extract the required data from the request body
    const { partnerId, tableId, status } = req.body;

    // Ensure all required fields are available
    if (!partnerId || !tableId || !status) {
      resUtil(
        res,
        400,
        "Missing required fields: partnerId, tableId, or status111"
      );
      return;
    }

    // SQL query to update the status of the table for the given partnerId and tableId
    const sqlQuery = `
      UPDATE tables
      SET status = ?
      WHERE partnerId = ? AND tableId = ?;
    `;

    // Parameters for the SQL query
    const params = [status, partnerId, tableId];

    // Execute the query
    const data = await queryD1(sqlQuery, params);

    if (data) {
      console.log(
        `Table status updated for partnerId: ${partnerId}, tableId: ${tableId}`
      );
      resUtil(res, 200, "Table status has been updated successfully.");
    }
  } catch (error) {
    console.log("Error updating table status:", error);
    resUtil(
      res,
      500,
      `Request could not be processed. Error: ${error.message || error}`
    );
  }
};

module.exports = allowCors(handler);
