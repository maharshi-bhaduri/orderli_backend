import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Serverless function to create a new menu item
export default async (req, res) => {
    try {
        const { providerId, itemName, description, price } = req.body;

        const menuItem = await prisma.menu.create({
            data: {
                provider_id: providerId,
                item_name: itemName,
                description,
                price,
            },
        });

        res.status(201).json(menuItem);
    } catch (error) {
        console.error('Error creating menu item:', error);
        res.status(500).json({ error: 'An error occurred' });
    }
}
