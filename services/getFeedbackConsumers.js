import { allowCors, resUtil } from "../utils/utils";

const D1_API_URL = process.env.D1_API_URL;
const D1_API_KEY = process.env.D1_API_KEY;
// Function to query Cloudflare D1 REST API
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
    throw new Error(`Error querying D1: ${data.errors || response.statusText}`);
  }

  return data;
}
// Function to decode Base62 to Base10
function fromBase62(base62) {
  const characters =
    "~123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  let num = 0;
  for (const char of base62) {
    num = num * 62 + characters.indexOf(char);
  }
  return num;
}

//serverless function to get all feedback for the particular partner handle
const handler = async function (req, res) {
  let partnerId;
  let orderFlag = false; // Initialize orderFlag to false

  //console.log("inside get feedback for consumer");
  try {
    const partnerHandle = req.query.partnerHandle;
    if (!partnerHandle) {
      return res.status(400).json({ Error: "partner handle is required" });
    }
    if (partnerHandle.startsWith("~")) {
      // Assume it's a table ID
      const base62Id = partnerHandle.slice(1); // Remove '~'
      const tableId = fromBase62(base62Id); // Decode Base62 to Base10
      const tableQuery = `
            SELECT partnerId FROM tables
            WHERE tableId = ?;
          `;
      const tableResult = await queryD1(tableQuery, [tableId]);
      if (tableResult.result[0]?.results?.length) {
        partnerId = tableResult.result[0].results[0].partnerId;
        orderFlag = true; // Set orderFlag to true as table ID was found
      }
    }

    if (!partnerId) {
      // If partnerId is not set from the table lookup, check for partner handle
      const partnerQuery = `
            SELECT partnerId FROM partner_details
            WHERE partnerHandle = ?;
          `;
      const partnerResult = await queryD1(partnerQuery, [partnerHandle]);
      if (!partnerResult.result[0]?.results?.length) {
        return resUtil(res, 404, "Partner not found");
      }
      partnerId = partnerResult.result[0].results[0].partnerId;
    }

    // Construct SQL query for fetching feedback based on partnerHandle
    const sqlQuery = `
            SELECT 
            f.partnerId, f.feedbackId, f.consumerName, f.consumerEmail, f.consumerPhone, f.rating, f.feedbackComments, 
            f.createdAt, f.updatedAt, f.isApproved
            FROM
              feedback AS f 
            WHERE f.partnerId = ? AND f.isApproved==1 
              `;
    // Fetch data from Cloudflare D1
    const data = await queryD1(sqlQuery, [partnerId]);
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
