import { allowCors, resUtil, verifyAuth } from "../utils/utils";

// Function to query Cloudflare D1 REST API
async function queryD1(sqlQuery, params = []) {
  const response = await fetch(process.env.D1_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.D1_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      sql: sqlQuery,
      params
    })
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
    const {
      partnerId = '',
      partnerName = '',
      partnerType = '',
      partnerHandle = '',
      address = '',
      city = '',
      state = '',
      country = '',
      postalCode = '',
      contactNo = '',
      owner = '',
      about = '',
      website = ''
    } = req.body;

    const decodedUser = req.headers.decodedUser;
    const sqlQuery = `
      UPDATE partner_details
      SET
        partnerName = ?,
        partnerHandle = ?,
        postalCode = ?,
        partnerType = ?,
        address = ?,
        city = ?,
        state = ?,
        country = ?,
        owner = ?,
        contactNo = ?,
        about = ?,
        website = ?,
        updatedAt = CURRENT_TIMESTAMP
      WHERE
        owner = ?
        and partnerId = ?;
    `;

    const params = [
      partnerName,
      partnerHandle,
      postalCode,
      partnerType,
      address,
      city,
      state,
      country,
      owner,
      contactNo,
      about,
      website,
      decodedUser,
      partnerId
    ];

    const result = await queryD1(sqlQuery, params);

    if (result.success) {
      resUtil(res, 200, "Partner details updated successfully.", result);
    } else {
      console.error("Error in D1 API response:", result.errors);
      throw new Error("D1 API query failed");
    }
  } catch (error) {
    console.error("Error updating partner:", error);
    resUtil(res, 500, "Request could not be processed. Error: ", error);
  }
};

module.exports = allowCors(verifyAuth(handler));
