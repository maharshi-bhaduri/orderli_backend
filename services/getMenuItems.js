import { PrismaClient } from '@prisma/client';
import { allowCors, resUtil, verifyAuth } from "../utils/utils";

const prisma = new PrismaClient();

// Serverless function to get all menu items
const handler = async (req, res) => {
    try {
        const menuItems = await prisma.menu.findMany({
            where: {
                provider: {
                    providerHandle: req.query.providerHandle ? req.query.providerHandle : null,
                    owner: {
                        equals: req.headers.uid
                    }
                },
            }
        });

        res.status(200).json(menuItems);
    } catch (error) {
        console.error('Error fetching menu items:', error);
        res.status(500).json({ error: 'An error occurred' });
    }
}

module.exports = allowCors(verifyAuth(handler));