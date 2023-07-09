// Serverless function to create a new provider

import { PrismaClient } from "@prisma/client";
import { allowCors, resUtil, verifyAuth } from "../utils/utils";
import qrcode from "qrcode";

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
      website,
    } = req.body;

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

    await prisma.provider_details.create({
      data: {
        providerName,
        providerType,
        providerHandle,
        about,
        address,
        city,
        state,
        country,
        postalCode,
        owner: req.headers.uid,
        website,
        qrData: qrCodeDataURL
      },
    });

    resUtil(res, 200, "Provider was successfully registered.", {
      qrCodeDataURL: qrCodeDataURL,
    });
  } catch (error) {
    console.error("Error creating provider:", error);
    resUtil(res, 500, "Error: 'Request could not be processed.");
  }
};

module.exports = allowCors(verifyAuth(handler));
