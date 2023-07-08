import { PrismaClient } from "@prisma/client";
import { allowCors, resUtil, verifyAuth } from "../utils/utils";

const prisma = new PrismaClient();

const handler = async (req, res) => {
  try {
    const { provider_handle, menu_id } = req.body;
    const deleteMenuItems = await prisma.menu.deleteMany({
      where: {
        provider_handle: { equals: provider_handle },
        menu_id: { equals: parseInt(menu_id) },
      },
    });

    res.status(200).json(deleteMenuItems);
  } catch (error) {
    console.error("Error deleting provider", error);
    res.status(500).json({ error: "an error occured" });
  }
}

module.exports = allowCors(verifyAuth(handler));