import { PrismaClient } from '@prisma/client';
import { allowCors, resUtil, verifyAuth } from "../utils/utils";

const prisma = new PrismaClient();

// Serverless function to create a new menu item
const handler = async (req, res) => {
    try {
        const { provider_id, provider_handle, item_name, description, price } = req.body;
        console.log("req ", req.body)

        const menuItem = await prisma.menu.create({
            data: {
                provider_id,
                provider_handle,
                item_name,
                description,
                price: parseInt(price),
            },
        });

        res.status(201).json(menuItem);
    } catch (error) {
        console.error('Error creating menu item:', error);
        res.status(500).json({ error: 'An error occurred' });
    }
}

module.exports = allowCors(verifyAuth(handler));