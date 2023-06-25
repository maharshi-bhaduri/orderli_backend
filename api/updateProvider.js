import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export default async function main(req, res) {
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
      owner,
      website,
    } = req.body;
    const updateProvider = await prisma.provider_details.update({
      where: {
        provider_id: parseInt(providerId),
      },
      data: {
        provider_name: providerName,
        provider_handle: providerHandle,
        postal_code: postalCode,
        provider_type: providerType,
        address,
        city,
        state,
        country,
        owner,
        website,
      },
    });
    res.status(200).json(updateProvider);
  } catch (error) {
    console.error("Error udpating provider:", error);
    res.status(500).json({ error: "An error occured" });
  }
}
