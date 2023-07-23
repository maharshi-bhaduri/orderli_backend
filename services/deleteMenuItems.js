import { PrismaClient } from "@prisma/client";
import { allowCors, resUtil, verifyAuth } from "../utils/utils";

const prisma = new PrismaClient();

const handler = async (req, res) => {
  try {
    const { providerHandle, menuId } = req.body;
    const deleteMenuItems = await prisma.menu.deleteMany({
      where: {
        provider: {
          providerHandle: providerHandle,
          owner: req.headers.uid
        },
        menuId: { equals: parseInt(menuId) },
      },
    });
    console.log("deleteMenuItems ", deleteMenuItems)
    res.status(200).json(deleteMenuItems);
  } catch (error) {
    console.error("Error deleting provider", error);
    res.status(500).json({ error: "an error occured" });
  }
}

module.exports = allowCors(verifyAuth(handler));