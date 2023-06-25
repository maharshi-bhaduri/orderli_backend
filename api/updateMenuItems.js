import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function main(req, res) {
  try {
    const {
      menuId,
      providerId,
      itemName,
      description,
      price,
      created_at,
      updated_at,
    } = req.body;

    const updateMenuItem = await prisma.menu.updateMany({
      where: {
        provider_id: { equals: parseInt(providerId) },
        menu_id: { equals: parseInt(menuId) },
      },
      data: {
        item_name: itemName,
        description,
        price,
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
