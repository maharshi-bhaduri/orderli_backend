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
    const { partnerId, currency, gstin, upiId, footerMessage, charges, discounts } = req.body;

    if (!partnerId || !currency) {
      console.error("Missing required fields: partnerId or currency");
      resUtil(res, 400, "Missing required fields: partnerId or currency");
      return;
    }

    // STEP 1: SELECT if partner exists
    const selectQuery = `SELECT partnerId FROM billing_details WHERE partnerId = ?;`;
    const selectParams = [partnerId];

    const selectResult = await queryD1(selectQuery, selectParams);

    let operationType = "";

    if (selectResult?.result?.[0]?.results?.[0]?.partnerId) {
      // STEP 2A: Partner exists -> UPDATE
      const updateQuery = `
        UPDATE billing_details
        SET
          currency = ?,
          gstin = ?,
          upiId = ?,
          footerMessage = ?,
          charges = ?,
          discounts = ?,
          updatedAt = CURRENT_TIMESTAMP
        WHERE partnerId = ?;
      `;

      const updateParams = [
        currency,
        gstin,
        upiId,
        footerMessage,
        JSON.stringify(charges),
        JSON.stringify(discounts),
        partnerId,
      ];

      const updateResult = await queryD1(updateQuery, updateParams);
      operationType = "updated";
    } else {
      // STEP 2B: Partner does not exist -> INSERT
      const insertQuery = `
        INSERT INTO billing_details (
          partnerId, currency, gstin, upiId, footerMessage, charges, discounts, createdAt, updatedAt
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
      `;

      const insertParams = [
        partnerId,
        currency,
        gstin,
        upiId,
        footerMessage,
        JSON.stringify(charges),
        JSON.stringify(discounts),
      ];

      const insertResult = await queryD1(insertQuery, insertParams);
      operationType = "inserted";
    }

    resUtil(res, 200, `Billing details ${operationType} successfully`, { operation: operationType });
  } catch (error) {
    console.error("Error saving billing details:", error);
    resUtil(res, 500, "Request could not be processed. Error", error);
  }
};

module.exports = allowCors(verifyAuth(handler));
