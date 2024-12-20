import { allowCors, resUtil, verifyAuth } from "../utils/utils";

// Define your Cloudflare D1 credentials and endpoint
const D1_API_URL = process.env.D1_API_URL;
const D1_API_KEY = process.env.D1_API_KEY;

// Function to query Cloudflare D1 REST API
async function fetchFromD1(sqlQuery, params = []) {
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
    throw new Error(`Error querying D1: ${data.errors || response.statusText}`);
  }

  return data;
}

// Serverless function to get all partners (previously called providers)
const handler = async (req, res) => {
  try {
    const userId = req.headers.decodedUser;
    const partnerHandle = req.query.partnerHandle;
    if (!partnerHandle) {
      return res.status(400).json({ Error: "partnerHandle is required" });
    }

    // Construct SQL query for fetching tables based on partnerHandle and userId
    const sqlQuery = `
            SELECT 
            t.partnerId, t.tableId, t.seatingCapacity, t.status,t.createdAt, t.updatedAt 
            FROM
              tables AS t
            JOIN 
              partner_details AS p ON t.partnerId=p.partnerId where p.partnerHandle = ? AND p.owner= ?
              `;

    // Fetch data from Cloudflare D1
    const data = await fetchFromD1(sqlQuery, [partnerHandle, userId]);

    if (data.success && data.result?.[0]?.success) {
      res.status(200).json(data.result[0].results);
    } else {
      console.error("Error in D1 API response:", data.errors);
      throw new Error("D1 API query failed");
    }
  } catch (error) {
    console.error("Error fetching partners:", error);
    res.status(500).json({ Error: "Request could not be processed." });
  }
};

module.exports = allowCors(verifyAuth(handler));
