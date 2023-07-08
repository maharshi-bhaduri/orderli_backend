import { PrismaClient } from '@prisma/client';
import { allowCors, resUtil, verifyAuth } from "../utils/utils";

const prisma = new PrismaClient();

// Serverless function to get provider details
const handler = async (req, res) => {
    try {
        const providers = await prisma.provider_details.findMany({
            where: {
                provider_handle: {
                    equals: req.query.providerHandle
                }
            }
        });

        res.status(200).json(providers);
    } catch (error) {
        console.error('Error fetching providers:', error);
        res.status(500).json({ error: 'An error occurred' });
    }
}

module.exports = allowCors(verifyAuth(handler));