import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Serverless function to create a new provider
export default async (req, res) => {
    try {
        const { providerName, providerType, providerHandle, address, city, state, country, postalCode, owner, website } = req.body;

        const provider = await prisma.provider_details.create({
            data: {
                provider_name: providerName,
                provider_type: providerType,
                provider_handle: providerHandle,
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