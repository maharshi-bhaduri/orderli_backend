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
      addMenuItems = [],
      updateMenuItems = [],
      deleteMenuItems = [],
      partnerHandle
    } = req.body;

    // Retrieve the partner's information based on the partnerHandle and owner (decoded user ID)
    const sqlQueryForPartner = `
      SELECT * FROM partner_details
      WHERE partnerHandle = ? AND owner = ?;
    `;
    const partner = await queryD1(sqlQueryForPartner, [partnerHandle, req.headers.uid]);

    if (!partner || partner.length === 0) {
      return resUtil(res, 400, "Unauthorized.");
    }

    const partnerId = partner.result[0].results[0].partnerId;
    const deleteMenuIds = deleteMenuItems.map((item) => item.menuId);

    // Prepare and execute D1 transactions for creating, updating, and deleting menu items
    const sqlQueries = [];

    // Insert new menu items
    if (addMenuItems.length > 0) {
      const addMenuQueries = addMenuItems.map(item => ({
        sql: `
          INSERT INTO menu (
            partnerId, itemName, description, category, serves, price,
            dietCategory, activeFlag, createdAt, updatedAt, image, subcategory1, subcategory2, subcategory3
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, ?, ?, ?, ?);
        `,
        params: [
          partnerId,
          item.itemName,
          item.description,
          item.category,
          parseInt(item.serves || 1),
          parseFloat(item.price || 0),
          parseInt(item.dietCategory || 1),
          parseInt(item.activeFlag),
          item.image || '',
          item.subcategory1 || '',
          item.subcategory2 || '',
          item.subcategory3 || ''
        ]
      }));
      sqlQueries.push(...addMenuQueries);
    }

    // Update existing menu items
    const updateMenuQueries = updateMenuItems.map(item => ({
      sql: `
        UPDATE menu
        SET itemName = ?, description = ?, category = ?, serves = ?, price = ?,
            dietCategory = ?, activeFlag = ?, updatedAt = CURRENT_TIMESTAMP, image = ?, subcategory1 = ?, subcategory2 = ?, subcategory3 = ?
        WHERE menuId = ? AND partnerId = ?;
      `,
      params: [
        item.itemName,
        item.description,
        item.category,
        parseInt(item.serves || 1),
        parseFloat(item.price || 0),
        parseInt(item.dietCategory || 1),
        parseInt(item.activeFlag),
        item.image || '',
        item.subcategory1 || '',
        item.subcategory2 || '',
        item.subcategory3 || '',
        item.menuId,
        partnerId
      ]
    }));
    sqlQueries.push(...updateMenuQueries);

    // Delete menu items: dynamically format placeholders for each menuId
    if (deleteMenuIds.length > 0) {
      const placeholders = deleteMenuIds.map(() => '?').join(', ');
      const deleteQuery = {
        sql: `DELETE FROM menu WHERE menuId IN (${placeholders}) AND partnerId = ?;`,
        params: [...deleteMenuIds, partnerId]
      };
      sqlQueries.push(deleteQuery);
    }

    // Execute each query in sequence (assuming Cloudflare D1 does not support native transaction)
    const transactionResults = [];
    for (const query of sqlQueries) {
      const result = await queryD1(query.sql, query.params);
      transactionResults.push(result);
    }

    resUtil(res, 200, "Menu items updated successfully.", transactionResults);
  } catch (error) {
    console.error("Error updating menu:", error);
    resUtil(res, 500, "An error occurred while updating menu items", error);
  }
};

module.exports = allowCors(verifyAuth(handler));
