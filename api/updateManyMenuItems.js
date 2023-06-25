import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function main(req, res) {
  try {
    let updateMenuItem;
    const { providerId, menuItems, updated_at } = req.body;
    console.log(providerId, menuItems);

    for (let i = 0; i < menuItems.length; i++) {
      updateMenuItem = await prisma.menu.updateMany({
        where: {
          provider_id: { equals: parseInt(providerId) },
          menu_id: { equals: parseInt(menuItems[i].menuId) },
        },
        data: {
          provider_id: parseInt(providerId),
          item_name: menuItems[i].itemName,
          description: menuItems[i].description,
          price: parseInt(menuItems[i].price),
          updated_at,
        },
      });
    }
    // const updateMenuItems = await prisma.menu.updateMany({
    //   where: {
    //     provider_id: { equals: parseInt(providerId) },
    //     menu_id: { equals: parseInt(menuId) },
    //   },
    //   data: {
    //     provider_id: parseInt(providerId),
    //     item_name: itemName,
    //     description,
    //     price: parseInt(price),
    //     updated_at,
    //   },
    // });
    res.status(200).json(updateMenuItem);
  } catch (error) {
    console.error("Error udpating menu:", error);
    res
      .status(500)
      .json({ error: "An error occured while updating menu items" });
  }
}
