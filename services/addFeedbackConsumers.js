import { allowCors, resUtil } from "../utils/utils";

// Define your Cloudflare D1 credentials and endpoint
const D1_API_URL = process.env.D1_API_URL;
const D1_API_KEY = process.env.D1_API_KEY;

async function queryD1(sqlQuery, params = []) {
  // Replace placeholders with actual values for debugging
  // const finalQuery = sqlQuery.replace(/\?/g, () => `'${params.shift()}'`);
  // console.log("Final Query:", finalQuery);
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

const handler = async (req, res) => {
  let partnerId;

  try {
    const {
      partnerHandle,
      consumerName,
      consumerEmail,
      consumerPhone,
      rating,
      feedbackComments,
    } = req.body;
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
    const sqlQuery = `INSERT INTO feedback 
    (partnerId, consumerName, consumerEmail, consumerPhone, rating,feedbackComments, createdAt, updatedAt, isApproved)
    VALUES (?,?,?,?,?,?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP,0)`;
    const params = [
      partnerId,
      consumerName,
      consumerEmail,
      consumerPhone,
      parseFloat(rating),
      feedbackComments,
    ];

    const data = await queryD1(sqlQuery, params);
    if (data) {
      resUtil(res, 200, "feedback has been added");
    } else {
      console.log("Error in D1 Api response");
    }
  } catch (error) {
    console.log("Error adding feedback:", error);
    resUtil(
      res,
      500,
      `Request could not be processed. Error: ${error.message || error}`
    );
  }
};

module.exports = allowCors(handler);
