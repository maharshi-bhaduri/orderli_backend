import { PrismaClient } from "@prisma/client";
import { allowCors, resUtil } from "../utils/utils";

const prisma = new PrismaClient();

//serverless function to get the menu items with provider Id as parameter

const handler = async function (req, res) {
  try {
    const feedbackList = await prisma.feedback.findMany({
      where: {
        provider: {
          providerHandle: req.query.providerHandle
            ? req.query.providerHandle
            : null,
        },
      },
    });
    res.status(200).json(feedbackList);
  } catch (error) {
    console.error("Error fetching feedback list:", error);
    res.status(500).json({ error: "An error occurred" });
  }
};

module.exports = allowCors(handler);
