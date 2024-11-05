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

// Serverless function to get partner details
const handler = async (req, res) => {
    try {
        const { partnerHandle } = req.query;

        // SQL query to fetch partner details based on partnerHandle
        const sqlQuery = `
      SELECT partnerId, partnerName, about, social1, social3, social3
      FROM partner_details
      WHERE partnerHandle = ?;
    `;

        const partnerDetails = await queryD1(sqlQuery, [partnerHandle]);

        // Ensure data is returned, otherwise respond with a 404 error
        if (partnerDetails.result[0].results.length === 0) {
            return resUtil(res, 404, "Partner not found");
        }

        resUtil(res, 200, null, partnerDetails.result[0].results[0]);
    } catch (error) {
        console.error("Error fetching partner details:", error);
        resUtil(res, 500, "An error occurred while fetching partner details");
    }
};

module.exports = allowCors(handler);
