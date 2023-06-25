import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function main(req, res) {
  try {
    const { providerId, menuId } = req.body;
    const deleteMenuItems = await prisma.menu.deleteMany({
      where: {
        provider_id: { equals: parseInt(providerId) },
        menu_id: { equals: parseInt(menuId) },
      },
    });

    res.status(200).json(deleteMenuItems);
  } catch (error) {
    console.error("Error deleting provider", error);
    res.status(500).json({ error: "an error occured" });
  }
}
