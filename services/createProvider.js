import { allowCors, resUtil, verifyAuth } from "../utils/utils";
import qrcode from "qrcode";

// Define your Cloudflare D1 credentials and endpoint
const D1_API_URL = process.env.D1_API_URL;
const D1_API_KEY = process.env.D1_API_KEY;

// Function to query Cloudflare D1 REST API
async function insertIntoD1(sqlQuery, params = []) {
  const response = await fetch(D1_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${D1_API_KEY}`,
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
      partnerName = '',
      partnerType = '',
      partnerHandle = '',
      about = '',
      address = '',
      city = '',
      state = '',
      country = '',
      postalCode = '',
      website = '',
      social1 = '',
      social2 = '',
      social3 = '',
      contactNo = '',
      rating = '',
    } = req.body;


    // Generate the QR code as a data URL
    const qrCodeDataURL = await qrcode.toDataURL(
      `${process.env.BASE_URL}${partnerHandle}`,
      {
        color: {
          dark: "#f15800", // Primary Colour
          light: "#0000"  // Transparent background
        }
      }
    );

    // Construct SQL query and parameters for insertion
    const sqlQuery = `
            INSERT INTO partner_details (
                partnerName,
                partnerType,
                partnerHandle,
                about,
                address,
                city,
                state,
                country,
                postalCode,
                owner,
                website,
                social1,
                social2,
                social3,
                contactNo,
                rating,
                qrData
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        `;

    const params = [
      partnerName,
      partnerType,
      partnerHandle,
      about,
      address,
      city,
      state,
      country,
      postalCode,
      req.headers.decodedUser,  // Owner ID from headers
      website,
      social1,
      social2,
      social3,
      contactNo,
      rating,
      qrCodeDataURL
    ];

    // Insert data into Cloudflare D1
    const data = await insertIntoD1(sqlQuery, params);

    if (data.success) {
      resUtil(res, 200, "Provider was successfully registered.", {
        qrCodeDataURL: qrCodeDataURL,
      });
    } else {
      console.error("Error in D1 API response:", data.errors);
      throw new Error("D1 API query failed");
    }
  } catch (error) {
    console.error("Error creating provider:", error);
    resUtil(res, 500, "Request could not be processed. Error: ", error);
  }
};

module.exports = allowCors(verifyAuth(handler));
