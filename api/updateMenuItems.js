import { PrismaClient } from "@prisma/client";
import { allowCors, resUtil, verifyAuth } from "../utils/utils";

const prisma = new PrismaClient();

const handler = async (req, res) => {
  try {
    const {
      menuId,
      providerHandle,
      itemName,
      description,
      price,
      updatedAt,
    } = req.body;

    const updateMenuItem = await prisma.menu.updateMany({
      where: {
        provider: {
          providerHandle: providerHandle,
          owner: req.headers.uid,
        },
        menuId: { equals: parseInt(menuId) },
      },
      data: {
        itemName,
        description,
        price: parseFloat(price),
        updatedAt,
      },
    });
    res.status(200).json(updateMenuItem);
  } catch (error) {
    console.error("Error udpating menu:", error);
    res
      .status(500)
      .json({ error: "An error occured while updating menu items" });
  }
}

module.exports = allowCors(verifyAuth(handler));