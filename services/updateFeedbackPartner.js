import { allowCors, resUtil, verifyAuth } from "../utils/utils";

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
  console.log("update");
  try {
    // Extract the required data from the request body
    const { approveList, deleteList } = req.body;

    // Ensure all required fields are available
    if (!approveList && !deleteList) {
      resUtil(res, 400, "Missing approveList and deleteList");
      return;
    }

    if (approveList && approveList.length > 0) {
      const sqlQuery = `UPDATE feedback SET isApproved=1 WHERE feedbackId IN (${approveList
        .map(() => "?")
        .join(",")})`;
      await queryD1(sqlQuery, approveList);
    }

    if (deleteList && deleteList.length > 0) {
      const sqlQuery = `DELETE FROM feedback WHERE feedbackId IN (${deleteList
        .map(() => "?")
        .join(",")})`;
      await queryD1(sqlQuery, deleteList);
    }
    // respond with success

    resUtil(res, 200, "Feedbacks updated successfully");
  } catch (error) {
    console.log("Error processing feedback entries :", error);
    resUtil(
      res,
      500,
      `Request could not be processed. Error: ${error.message || error}`
    );
  }
};

module.exports = allowCors(verifyAuth(handler));
