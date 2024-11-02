import { allowCors, resUtil } from "../utils/utils";

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
    console.error("Error querying D1:", data);
    throw new Error(data.errors || response.statusText);
  }
  return data;
}

// Serverless function to get all menu items
const handler = async (req, res) => {
  try {
    const { partnerHandle } = req.query;

    // SQL query to fetch menu items based on partnerHandle
    const sqlQuery = `
      SELECT * FROM menu
      WHERE partnerId = (
        SELECT partnerId FROM partner_details WHERE partnerHandle = ?
      );
    `;

    const menuItems = await queryD1(sqlQuery, [partnerHandle]);

    resUtil(res, 200, null, menuItems.result[0].results);
  } catch (error) {
    console.error("Error fetching menu items:", error);
    resUtil(res, 500, "An error occurred while fetching menu items");
  }
};

module.exports = allowCors(handler);
