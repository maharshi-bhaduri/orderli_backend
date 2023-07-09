import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function main(req, res) {
  try {
    let updateMenuItem;
    const { providerId, menuItems, updatedAt } = req.body;
    console.log(providerId, menuItems);

    for (let i = 0; i < menuItems.length; i++) {
      updateMenuItem = await prisma.menu.updateMany({
        where: {
          providerId: { equals: parseInt(providerId) },
          menuId: { equals: parseInt(menuItems[i].menuId) },
        },
        data: {
          providerId: parseInt(providerId),
          itemName: menuItems[i].itemName,
          description: menuItems[i].description,
          price: parseInt(menuItems[i].price),
          updatedAt,
        },
      });
    }
    // const updateMenuItems = await prisma.menu.updateMany({
    //   where: {
    //     providerId: { equals: parseInt(providerId) },
    //     menuId: { equals: parseInt(menuId) },
    //   },
    //   data: {
    //     providerId: parseInt(providerId),
    //     itemName: itemName,
    //     description,
    //     price: parseInt(price),
    //     updatedAt,
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
