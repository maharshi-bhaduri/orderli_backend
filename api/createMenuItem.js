import { PrismaClient } from '@prisma/client';
import { allowCors, resUtil, verifyAuth } from "../utils/utils";

const prisma = new PrismaClient();

// Serverless function to create a new menu item
const handler = async (req, res) => {
    try {
        const { providerHandle, itemName, description, price } = req.body;

        const provider = await prisma.provider_details.findMany({
            where: {
                AND: [
                    {
                        providerHandle: {
                            equals: req.query.providerHandle,
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

        if (provider.length) {

            const menuItem = await prisma.menu.create({
                data: {
                    provider: {
                        connect: {
                            providerHandle: providerHandle,
                        },
                    },
                    itemName,
                    description,
                    price: parseInt(price),
                },
            });

            res.status(201).json(menuItem);
        }
        else {
            res.status(403).json({ message: "Unauthorized" });
        }
    } catch (error) {
        console.error('Error creating menu item:', error);
        res.status(500).json({ error: 'An error occurred' });
    }
}

module.exports = allowCors(verifyAuth(handler));