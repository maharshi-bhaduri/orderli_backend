import { PrismaClient } from "@prisma/client";
import { allowCors, resUtil, verifyAuth } from "../utils/utils";
const prisma = new PrismaClient();

const handler = async (req, res) => {
  try {
    const {
      providerId,
      providerName,
      providerType,
      providerHandle,
      address,
      city,
      state,
      country,
      postalCode,
      contactNo,
      owner,
      about,
      website,
    } = req.body;
    const updateProvider = await prisma.provider_details.update({
      where: {
        providerId: parseInt(providerId),
      },
      data: {
        providerName,
        providerHandle,
        postalCode,
        providerType,
        address,
        city,
        state,
        country,
        owner,
        contactNo,
        about,
        website,
      },
    });
    res.status(200).json(updateProvider);
  } catch (error) {
    console.error("Error udpating provider:", error);
    res.status(500).json({ error: "An error occured occured." });
  }
}

module.exports = allowCors(verifyAuth(handler));