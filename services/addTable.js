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
    const { partnerId, noOfTables, seatingCapacity } = req.body;
    console.log(noOfTables, seatingCapacity);
    const status = "Available";
    // Prepare the SQL query and parameters for batch execution
    const sqlValues = [];
    const params = [];
    for (let i = 0; i < noOfTables; i++) {
      sqlValues.push(`(?,?,?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`);
      params.push(partnerId, seatingCapacity, status);
    }

    const sqlQuery = `
      INSERT INTO tables
      (partnerId, seatingCapacity, status, createdAt, updatedAt)
      VALUES ${sqlValues.join(", ")}`;

    const data = await queryD1(sqlQuery, params);
    if (data) {
      resUtil(res, 200, "tables have been created");
    }
  } catch (error) {
    console.log("Error creating tables:", error);
    resUtil(
      res,
      500,
      `Request could not be processed. Error: ${error.message || error}`
    );
  }
};

module.exports = allowCors(handler);
