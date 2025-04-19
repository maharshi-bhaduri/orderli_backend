import { allowCors, resUtil } from "../utils/utils";
// Function to query Cloudflare D1 REST API

const D1_API_URL = process.env.D1_API_URL;
const D1_API_KEY = process.env.D1_API_KEY;

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
  return data;
}

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendOtpViaSms(phoneNumber, otp) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const client = require("twilio")(accountSid, authToken);

  const message = await client.messages.create({
    body: `Your OTP for Snaqr is ${otp}`,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: phoneNumber,
  });

  return message.sid;
}

const handler = async (req, res) => {
  if (req.method !== "POST") {
    return resUtil(res, 405, "Method Not Allowed");
  }

  try {
    const { phoneNumber, partnerId, tableId } = req.body;

    if (!phoneNumber || !partnerId || !tableId) {
      return resUtil(res, 400, "Missing required fields");
    }

    const otp = generateOtp();
    const messageSid = await sendOtpViaSms(phoneNumber, otp);

    if (messageSid) {
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 mins from now
      const sqlQuery = `
        INSERT INTO otps (phoneNumber, otp, partnerId, tableId, expiresAt)
        VALUES (?, ?, ?, ?, ?);
      `;
      await queryD1(sqlQuery, [
        phoneNumber,
        otp,
        partnerId,
        tableId,
        expiresAt,
      ]);
    }

    return resUtil(res, 200, "OTP sent successfully", {
      otpSentTo: phoneNumber,
      messageSid,
    });
  } catch (error) {
    console.error("OTP send error:", error);
    return resUtil(res, 500, "Failed to send OTP");
  }
};
module.exports = allowCors(handler);
