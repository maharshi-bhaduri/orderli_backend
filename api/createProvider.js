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
      owner,
      website,
    } = req.body;

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

    resUtil(res, 200, 200, "Provider was successfully registered.", {
      qrCodeDataURL: qrCodeDataURL,
    });
  } catch (error) {
    console.error("Error creating provider:", error);
    if (error?.code == 'P2002') {
      resUtil(res, 400, 201, "Unique key constraint failed.");
    }
    resUtil(res, 400, 400, "An error occurred.");
  }
};

module.exports = allowCors(verifyAuth(handler));
