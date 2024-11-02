import { allowCors, resUtil, verifyAuth } from "../utils/utils";

// Function to query Cloudflare D1 REST API
async function fetchFromD1(sqlQuery, params = []) {
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
        throw new Error(`Error querying D1: ${data.errors || response.statusText}`);
    }

    return data;
}

// Serverless function to get all menu items for a specific partner
const handler = async (req, res) => {
    try {
        const { partnerHandle } = req.query;
        const ownerUid = req.headers.uid;

        // SQL query to join menu and partner_details and filter by partnerHandle and owner
        const sqlQuery = `
            SELECT m.*
            FROM menu m
            JOIN partner_details p ON m.partnerId = p.partnerId
            WHERE p.partnerHandle = ? AND p.owner = ?
        `;

        // Fetch data from Cloudflare D1
        const data = await fetchFromD1(sqlQuery, [partnerHandle, ownerUid]);

        if (data.success && data.result?.[0]?.success) {
            res.status(200).json(data.result[0].results);
        } else {
            res.status(404).json({ message: "No menu items found or unauthorized access." });
        }
    } catch (error) {
        console.error('Error fetching menu items:', error);
        res.status(500).json({ error: 'An error occurred' });
    }
}

module.exports = allowCors(verifyAuth(handler));
