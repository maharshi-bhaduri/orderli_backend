// Serverless function to create a new provider

import { PrismaClient } from "@prisma/client";
import { allowCors, resUtil } from "../utils/utils";
import qrcode from "qrcode";
import * as admin from "firebase-admin";
import credentials from "../credentials.json";
import { getAuth, verifyIdToken } from "firebase/auth";

const adminapp = admin.initializeApp({
  credential: admin.credential.cert(credentials),
});

const prisma = new PrismaClient();

const handler = async (req, res) => {
  try {
    const {
      providerName,
      providerType,
      providerHandle,
      about,
      address,
      city,
      state,
      country,
      postalCode,
      owner,
      website,
    } = req.body;
    const { authorization, uid } = req.headers;

    try {
      admin
        .auth()
        .verifyIdToken(authorization)
        .then((decodedToken) => {
          console.log(decodedToken);
        })
        .catch((error) => {
          console.error(error);
          return resUtil(res, 401, "bad response");
        });
    } catch (err) {
      console.error(err);
    }

    await prisma.provider_details.create({
      data: {
        provider_name: providerName,
        provider_type: providerType,
        provider_handle: providerHandle,
        about,
        address,
        city,
        state,
        country,
        postal_code: postalCode,
        owner,
        website,
      },
    });

    // Generate the QR code as a data URL
    const qrCodeDataURL = await qrcode.toDataURL(
      process.env.BASE_URL + providerHandle,
      {
        color: {
          dark: "#f15800", // Primary Colour
          light: "#0000", // Transparent background
        },
      }
    );

    resUtil(res, 200, "Provider was successfully registered.", {
      qrCodeDataURL: qrCodeDataURL,
    });
  } catch (error) {
    console.error("Error creating provider:", error);
    resUtil(res, 500, "An error occurred.");
  }
};

module.exports = allowCors(handler);
