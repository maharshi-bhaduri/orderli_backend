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

const handler = async (req, res) => {
  try {
    const {
      partnerHandle,
      consumerName,
      consumerEmail,
      consumerPhone,
      rating,
      feedbackComments,
    } = req.body;
    const sqlQueryForPartner = `SELECT partnerId from partner_details where partnerHandle = ?`;
    const partner = await queryD1(sqlQueryForPartner, [partnerHandle]);
    if (!partner || partner.length === 0) {
      return resUtil(res, 400, "Unauthorized.");
    }

    const partnerId = partner.result[0].results[0].partnerId;
    const sqlQuery = `INSERT INTO feedback 
    (partnerId, consumerName, consumerEmail, consumerPhone, rating,feedbackComments, createdAt, updatedAt)
    VALUES (?,?,?,?,?,?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`;
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
