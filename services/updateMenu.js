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

    const updateMenu = await prisma.$transaction(
      [
        prisma.menu.deleteMany({ where: { menuId: { in: deleteMenuIds } } }),
        prisma.resource.createMany({
          data: {
            provider: {
              connect: {
                providerHandle: providerHandle,
              },
            },
            itemName,
            description,
            price: parseInt(price),
          }
        }),
      ],
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable, // optional, default defined by database configuration
      }
    )

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