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

// Serverless function to get partner details
const handler = async (req, res) => {
    try {
        const { partnerHandle } = req.query;
        const ownerUid = req.headers.decodedUser;

        // SQL query to get partner details by handle and owner
        const sqlQuery = `
            SELECT * FROM partner_details
            WHERE partnerHandle = ? AND owner = ?
        `;
        console.log('ownerUid', ownerUid)
        console.log('partnerHandle', partnerHandle)

        // Fetch data from Cloudflare D1
        const data = await fetchFromD1(sqlQuery, [partnerHandle, ownerUid]);
        console.log('data', data)

        if (data.success && data.result?.[0]?.success) {
            res.status(200).json(data.result[0].results);
        } else {
            res.status(403).json({ message: "Unauthorized" });
        }
    } catch (error) {
        console.error('Error fetching partner details:', error);
        res.status(500).json({ error: 'An error occurred' });
    }
}

module.exports = allowCors(verifyAuth(handler));
