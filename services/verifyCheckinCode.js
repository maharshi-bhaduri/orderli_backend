import { allowCors, resUtil } from "../utils/utils";
import supabaseClient from "../utils/supabaseClient";

// Function to decode Base62 to Base10
function fromBase62(base62) {
  const characters =
    "~123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
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
  return data.result[0].results; // Return results array
}

// Serverless function to get partner and table details
const handler = async (req, res) => {
  try {
    const { partnerHandle, code } = req.query;

    if (!partnerHandle) {
      return resUtil(res, 400, "partnerHandle is required");
    }

    let verifiedData = { verified: false };
    let supabaseData = null;

    if (partnerHandle.startsWith("~")) {
      const base62Id = partnerHandle.substring(1);
      const tableId = fromBase62(base62Id);

      // Fetch code from D1
      const codeQuery = `
        SELECT checkinCode
        FROM tables
        WHERE tableId = ?;
      `;
      const codeData = await queryD1(codeQuery, [tableId]);

      if (!codeData || codeData.length === 0) {
        return resUtil(res, 404, "Code not found");
      }

      // Check if code matches
      if (codeData[0].checkinCode === code) {
        verifiedData = { verified: true, tableId };
      }

      // Write to Supabase only if verified
      if (verifiedData.verified) {
        // Check if alert already exists
        const { data: existingAlert, error: checkError } = await supabaseClient
          .from("table_alerts_live")
          .select("id")
          .eq("tableId", tableId)
          .eq("alertType", "table_occupied")
          .maybeSingle();

        if (checkError) {
          throw new Error(
            `Error checking existing alert: ${checkError.message}`
          );
        }

        if (existingAlert) {
          supabaseData = {
            message: "Table is already occupied.",
            alreadyExists: true,
          };
        } else {
          // Insert new alert
          const { data: insertData, error: supabaseError } =
            await supabaseClient
              .from("table_alerts_live")
              .insert([{ tableId, alertType: "table_occupied" }])
              .select()
              .maybeSingle();

          if (supabaseError) {
            throw new Error(`Supabase insert error: ${supabaseError.message}`);
          }

          supabaseData = {
            message: "Alert inserted successfully.",
            insertedAlert: insertData,
          };
        }
      }
    }

    // Send both parts of the response
    return resUtil(res, 200, null, { verifiedData, supabaseData });
  } catch (error) {
    console.error("Error fetching code details:", error);
    return resUtil(res, 500, "An error occurred while fetching code details");
  }
};

module.exports = allowCors(handler);
