import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Serverless function to create a new provider
export default async (req, res) => {
    try {
        const { providerName, providerType, address, city, state, country, postalCode, owner, website } = req.body;

        const provider = await prisma.providerDetails.create({
            data: {
                provider_name: providerName,
                provider_type: providerType,
                address,
                city,
                state,
                country,
                postal_code: postalCode,
                owner,
                website,
            },
        });

        res.status(201).json(provider);
    } catch (error) {
        console.error('Error creating provider:', error);
        res.status(500).json({ error: 'An error occurred' });
    }
}