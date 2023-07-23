import { PrismaClient } from "@prisma/client";
import { allowCors, resUtil, verifyAuth } from "../utils/utils";

const prisma = new PrismaClient();

const handler = async (req, res) => {
  try {
    const { providerId } = req.body;

    // Deleting provider's menu
    await prisma.menu.deleteMany({
      where: {
        providerId: providerId,
      },
    });

    // Deleting provider
    const deleteProvider = await prisma.provider_details.deleteMany({
      where: {
        providerId: {
          equals: parseInt(providerId),
        },
        owner: {
          equals: req.headers.uid,
        },
      },
    });
    console.log("deleteProvider ", deleteProvider) //{ count: 1 }
    res.status(200).json(deleteProvider);
  } catch (error) {
    console.error("Error deleting provider", error);
    res.status(500).json({ error: "an error occured" });
  }
}

module.exports = allowCors(verifyAuth(handler));