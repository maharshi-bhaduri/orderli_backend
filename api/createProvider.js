import { PrismaClient } from '@prisma/client';
import qrcode from 'qrcode';

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

        // Generate the QR code as a data URL
        const qrCodeDataURL = await qrcode.toDataURL(process.env.BASE_URL + providerHandle,
            {
                color: {
                    dark: '#f15800', // Primary Colour
                    light: '#0000' // Transparent background
                }
            });

        const response = {
            qrCodeURL: qrCodeDataURL,
            operationStatus: {
                status: '201',
                description: 'Provider was successfully registered.'
            }
        }

        // Set the appropriate headers
        res.setHeader('Content-Type', 'application/json');

        // Send the response as JSON
        res.status(201).json(response);
    } catch (error) {
        console.error('Error creating provider:', error);
        res.status(500).json({ error: 'An error occurred' });
    }
}