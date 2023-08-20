import { PrismaClient } from "@prisma/client";
import { allowCors, resUtil, verifyAuth } from "../utils/utils";

const prisma = new PrismaClient();

const handler = async (req, res) => {
  try {
    const {
      addMenuItems,
      updateMenuItems,
      deleteMenuItems,
      providerHandle
    } = req.body;

    const provider = await prisma.provider_details.findMany({
      where: {
        AND: [
          {
            providerHandle: {
              equals: providerHandle,
            },
          },
          {
            owner: {
              equals: req.headers.uid,
            },
          },
        ]
      },
    });

    if (!provider) {
      res.status(400).json({ message: "Unauthorized." });
    }

    const deleteMenuIds = deleteMenuItems.map((item) => item.menuId);

    const transaction = await prisma.$transaction([
      prisma.menu.createMany({
        data: addMenuItems.map((item) => ({
          providerId: provider[0].providerId,
          ...item,
          price: parseFloat(item.price)
        })),
      }),
      ...updateMenuItems.map((item) =>
        prisma.menu.updateMany({
          where: {
            menuId: item.menuId,
          },
          data: {
            itemName: item.itemName,
            description: item.description,
            category: item.category,
            serves: parseInt(item.serves ? item.serves : 1),
            price: parseFloat(item.price ? item.price : 0),
            dietCategory: parseFloat(item.dietCategory ? item.dietCategory : 1),
            activeFlag: parseInt(item.activeFlag),
            updatedAt: item.updatedAt
          },
        })
      ),
      prisma.menu.deleteMany({ where: { menuId: { in: deleteMenuIds } } }),
    ]);

    res.status(200).json(transaction);
  } catch (error) {
    console.error("Error udpating menu:", error);
    res
      .status(500)
      .json({ error: "An error occured while updating menu items" });
  }
}

module.exports = allowCors(verifyAuth(handler));