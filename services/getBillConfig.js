import { allowCors, resUtil, verifyAuth } from "../utils/utils";

const D1_API_URL = process.env.D1_API_URL;
const D1_API_KEY = process.env.D1_API_KEY;

// Helper to fetch from Cloudflare D1
async function fetchFromD1(sqlQuery, params = []) {
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
        throw new Error(`Error querying D1: ${data.errors || response.statusText}`);
    }

    return data;
}

// New handler to fetch Billing Config
const handler = async (req, res) => {
    try {
        const userId = req.headers.decodedUser;
        const partnerHandle = req.query.partnerHandle;

        if (!partnerHandle) {
            return res.status(400).json({ error: "partnerHandle is required" });
        }

        // SQL to fetch billing config for the given partner
        const sqlQuery = `
            SELECT bc.partnerId, bc.currency, bc.gstin, bc.upiId, bc.footerMessage, bc.charges, bc.discounts
            FROM billing_details AS bc
            JOIN partner_details AS p ON bc.partnerId = p.partnerId
            WHERE p.partnerHandle = ? AND p.owner = ?
            `;

        const data = await fetchFromD1(sqlQuery, [partnerHandle, userId]);

        if (data.success && data.result?.[0]?.success) {
            const results = data.result[0].results;

            if (results.length === 0) {
                return resUtil(res, 404, "No billing config found for this partner.");
            }

            // Note: charges and discounts are likely stored as JSON strings → parse them
            const billingConfig = {
                ...results[0],
                charges: results[0].charges ? JSON.parse(results[0].charges) : [],
                discounts: results[0].discounts ? JSON.parse(results[0].discounts) : [],
            };

            return resUtil(res, 200, "Billing config fetched successfully.", billingConfig);
        } else {
            console.error("Error in D1 API response:", data.errors);
            throw new Error("D1 API query failed");
        }
    } catch (error) {
        console.error("Error fetching billing config:", error);
        resUtil(
            res,
            500,
            `Request could not be processed. Error: ${error.message || error}`
        );
    }
};

module.exports = allowCors(verifyAuth(handler));
