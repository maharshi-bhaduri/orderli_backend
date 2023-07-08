import { PrismaClient } from "@prisma/client";
import { allowCors, resUtil, verifyAuth } from "../utils/utils";

const prisma = new PrismaClient();

const handler = async (req, res) => {
  try {
    const {
      menu_id,
      providerId,
      provider_handle,
      itemName,
      description,
      price,
      created_at,
      updated_at,
    } = req.body;

    const updateMenuItem = await prisma.menu.updateMany({
      where: {
        provider_handle: { equals: provider_handle },
        menu_id: { equals: parseInt(menu_id) },
      },
      data: {
        item_name: itemName,
        description,
        price: parseFloat(price),
        updated_at,
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