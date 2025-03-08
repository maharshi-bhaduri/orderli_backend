import { allowCors, resUtil, verifyAuth } from "../utils/utils";

// Function to query Cloudflare D1 REST API
async function queryD1(sqlQuery, params = []) {
  const response = await fetch(process.env.D1_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.D1_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sql: sqlQuery,
      params,
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    console.error(response);
    throw new Error(`Error querying D1: ${data.errors || response.statusText}`);
  }
  return data;
}

const handler = async (req, res) => {
  try {
    const { partnerHandle, currency } = req.body;
    if (!partnerHandle || !currency) {
      console.log("partnerhandl", partnerHandle);
      console.log("currency", currency);
      console.error("Missing required fields: partnerHandle or currency");

      resUtil(res, 400, "Missing required fields: partnerHandle or currency");
      return;
    }

    const sqlQuery = `UPDATE partner_details SET currency =? where partnerHandle=?`;
    const params = [currency, partnerHandle];
    const result = await queryD1(sqlQuery, params);

    if (result.success) {
      resUtil(res, 200, "Currency updated successfully", result);
    } else {
      console.error("Error in D1 API response:", result.errors);
      throw new Error("D1 API query failed");
    }
  } catch (err) {
    console.error("Error updating partner:", error);
    result(res, 500, "Request could not be processed. Error", error);
  }
};

module.exports = allowCors(verifyAuth(handler));
