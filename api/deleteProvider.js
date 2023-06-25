import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function main(req, res) {
  try {
    const { providerId } = req.body;
    const deleteProvider = await prisma.provider_details.delete({
      where: {
        provider_id: parseInt(providerId),
      },
      select: {
        provider_id: true,

        provider_handle: true,
      },
    });

    res.status(200).json(deleteProvider);
  } catch (error) {
    console.error("Error deleting provider", error);
    res.status(500).json({ error: "an error occured" });
  }
}
