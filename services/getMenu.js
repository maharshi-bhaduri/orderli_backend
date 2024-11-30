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

// Function to decode Base62 to Base10
function fromBase62(base62) {
  const characters = "~123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  let num = 0;
  for (const char of base62) {
    num = num * 62 + characters.indexOf(char);
  }
  return num;
}

// Serverless function to get all menu items
const handler = async (req, res) => {
  try {
    const { partnerHandle } = req.query;

    let partnerId;

    if (partnerHandle.startsWith("~")) {
      // Assume it's a table ID
      const base62Id = partnerHandle.slice(1); // Remove '~'
      const tableId = fromBase62(base62Id); // Decode Base62 to Base10
      const tableQuery = `
        SELECT partnerId FROM tables
        WHERE tableId = ?;
      `;
      const tableResult = await queryD1(tableQuery, [tableId]);
      if (!tableResult.result[0]?.results?.length) {
        return resUtil(res, 404, "Table not found");
      }
      partnerId = tableResult.result[0].results[0].partnerId;
    } else {
      // Assume it's a partner handle
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

    // Query menu using partnerId
    const menuQuery = `
      SELECT * FROM menu
      WHERE partnerId = ?;
    `;
    const menuItems = await queryD1(menuQuery, [partnerId]);

    resUtil(res, 200, null, menuItems.result[0].results);
  } catch (error) {
    console.error("Error fetching menu items:", error);
    resUtil(res, 500, "An error occurred while fetching menu items");
  }
};

module.exports = allowCors(handler);
