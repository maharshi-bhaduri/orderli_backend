import { allowCors, resUtil } from "../utils/utils";

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

//serverless function to get all feedback for the particular partner handle
const handler = async function (req, res) {
  try {
    const partnerHandle = req.query.partnerHandle;
    if (!partnerHandle) {
      return res.status(400).json({ Error: "partner handle is required" });
    }
    // Construct SQL query for fetching feedback based on partnerHandle
    const sqlQuery = `
            SELECT 
            f.partnerId, f.feedbackId, f.consumerName, f.consumerEmail, f.consumerPhone, f.rating, f.feedbackComments, 
            f.createdAt, f.updatedAt 
            FROM
              feedback AS f 
            JOIN 
              partner_details AS p ON f.partnerId=p.partnerId where p.partnerHandle = ? 
              `;
    // Fetch data from Cloudflare D1
    const data = await fetchFromD1(sqlQuery, [partnerHandle]);
    if (data.success && data.result?.[0]?.success) {
      res.status(200).json(data.result[0].results);
    } else {
      console.error("Error in D1 API response:", data.errors);
      throw new Error("D1 API query failed");
    }
  } catch (err) {
    console.error("Error fetching partners:", err);
    res.status(500).json({ Error: "Request could not be processed." });
  }
};

module.exports = allowCors(handler);
