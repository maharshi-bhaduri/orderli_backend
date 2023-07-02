import { PrismaClient } from '@prisma/client';
import { allowCors, resUtil, verifyAuth } from "../utils/utils";

const prisma = new PrismaClient();

// Serverless function to get all providers
const handler = async (req, res) => {
    try {
        const providers = await prisma.provider_details.findMany({
            where: {
                owner: {
                    equals: req.headers.uid
                }
            }
        });

        res.status(200).json(providers);
    } catch (error) {
        console.error('Error fetching providers:', error);
        res.status(500).json({ Error: 'Request could not be processed.' });
    }
}

module.exports = allowCors(verifyAuth(handler));