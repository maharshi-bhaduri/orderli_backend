import { allowCors, resUtil } from "../utils/utils";

// Function to decode Base62 to Base10
function fromBase62(base62) {
    const characters = "~123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    let num = 0;
    for (const char of base62) {
        num = num * 62 + characters.indexOf(char);
    }
    return num;
}

// Function to query Cloudflare D1 REST API
async function queryD1(sqlQuery, params = []) {
    const response = await fetch(process.env.D1_API_URL, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${process.env.D1_API_KEY}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            sql: sqlQuery,
            params,
        }),
    });

    const data = await response.json();
    if (!response.ok) {
        console.error("Error querying D1:", data);
        throw new Error(data.errors || response.statusText);
    }
    return data.result[0].results; // Directly return the results array
}

// Serverless function to get partner and table details
const handler = async (req, res) => {
    try {
        const { partnerHandle } = req.query;

        // Validate input
        if (!partnerHandle) {
            return resUtil(res, 400, "partnerHandle is required");
        }

        let partnerDetails;
        let tableDetails = null; // Default to null unless fetching table details

        if (partnerHandle.startsWith("~")) {
            // Handle as a globalTableId (Base62 format)
            const base62Id = partnerHandle.substring(1); // Remove the leading char
            const tableId = fromBase62(base62Id); // Decode Base62 to Base10

            // Fetch table details using tableId
            const tableQuery = `
                    SELECT tableId, seatingCapacity, partnerId, localTableId, status, updatedAt
                    FROM tables
                    WHERE tableId = ?;
                `;
            const tableData = await queryD1(tableQuery, [tableId]);

            if (tableData.length === 0) {
                return resUtil(res, 404, "Table not found");
            }

            tableDetails = tableData[0];

            // Fetch partner details using partnerId from table details
            const partnerQuery = `
        SELECT partnerId, partnerName, about, social1, social2, social3
        FROM partner_details
        WHERE partnerId = ?;
      `;
            const partnerData = await queryD1(partnerQuery, [tableDetails.partnerId]);

            if (partnerData.length === 0) {
                return resUtil(res, 404, "Partner not found");
            }

            partnerDetails = partnerData[0];
        } else {
            // Handle as a partnerHandle
            const partnerQuery = `
        SELECT partnerId, partnerName, about, social1, social2, social3
        FROM partner_details
        WHERE partnerHandle = ?;
      `;
            const partnerData = await queryD1(partnerQuery, [partnerHandle]);

            if (partnerData.length === 0) {
                return resUtil(res, 404, "Partner not found");
            }

            partnerDetails = partnerData[0];
        }

        // Construct the response
        const response = {
            partnerDetails,
        };

        if (tableDetails) {
            response.tableDetails = tableDetails;
        }

        return resUtil(res, 200, null, response);
    } catch (error) {
        console.error("Error fetching details:", error);
        return resUtil(res, 500, "An error occurred while fetching details");
    }
};

module.exports = allowCors(handler);