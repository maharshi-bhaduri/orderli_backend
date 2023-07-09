import { PrismaClient } from '@prisma/client';
import { allowCors, resUtil, verifyAuth } from "../utils/utils";

const prisma = new PrismaClient();

// Serverless function to get provider details
const handler = async (req, res) => {
    try {
        const providers = await prisma.provider_details.findMany({
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
            }
        });

        if (providers.length) {
            res.status(200).json(providers);
        }
        else {
            res.status(403).json({ message: "Unauthorized" });
        }
    } catch (error) {
        console.error('Error fetching providers:', error);
        res.status(500).json({ error: 'An error occurred' });
    }
}

module.exports = allowCors(verifyAuth(handler));