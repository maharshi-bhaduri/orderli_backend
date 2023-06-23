import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Serverless function to create a new provider
export async function createProvider(req, res) {
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

// Serverless function to create a new menu item
export async function createMenuItem(req, res) {
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

// Serverless function to get all providers
export async function getProviders(req, res) {
    try {
        const providers = await prisma.providerDetails.findMany();

        res.status(200).json(providers);
    } catch (error) {
        console.error('Error fetching providers:', error);
        res.status(500).json({ error: 'An error occurred' });
    }
}

// Serverless function to get all menu items
export async function getMenuItems(req, res) {
    try {
        const menuItems = await prisma.menu.findMany();

        res.status(200).json(menuItems);
    } catch (error) {
        console.error('Error fetching menu items:', error);
        res.status(500).json({ error: 'An error occurred' });
    }
}
