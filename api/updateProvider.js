import { PrismaClient } from "@prisma/client";
import { allowCors, resUtil, verifyAuth } from "../utils/utils";
const prisma = new PrismaClient();

const handler = async (req, res) => {
  try {
    const {
      provider_id,
      provider_name,
      provider_type,
      provider_handle,
      address,
      city,
      state,
      country,
      postal_code,
      contact_no,
      owner,
      about,
      website,
    } = req.body;
    const updateProvider = await prisma.provider_details.update({
      where: {
        provider_id: parseInt(provider_id),
      },
      data: {
        provider_name,
        provider_handle,
        postal_code,
        provider_type,
        address,
        city,
        state,
        country,
        owner,
        contact_no,
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