import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Serverless function to get all menu items
export default async (req, res) => {
    try {
        const tables = await prisma.$queryRaw('SHOW TABLES');
        console.log('Tables:', tables);
    } catch (error) {
        console.error('Error logging tables:', error);
    } finally {
        await prisma.$disconnect();
    }
    try {
        await prisma.$connect();
        console.log('Connected to the database');
        const menuItems = await prisma.menu.findMany();

        res.status(200).json(menuItems);
    } catch (error) {
        console.error('Error fetching menu items:', error);
        res.status(500).json({ error: 'An error occurred' });
    }
}