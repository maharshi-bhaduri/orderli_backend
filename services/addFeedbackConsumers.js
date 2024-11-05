import { PrismaClient } from "@prisma/client";
import { allowCors, resUtil } from "../utils/utils";

const prisma = new PrismaClient();
const handler = async (req, res) => {
  try {
    const {
      providerHandle,
      consumerName,
      consumerEmail,
      consumerPhone,
      rating,
      feedbackComments,
    } = req.body;

    const addedFeedback = await prisma.feedback.create({
      data: {
        provider: { connect: { providerHandle: providerHandle } },
        consumerName,
        consumerEmail,
        consumerPhone,
        rating: parseInt(rating),
        feedbackComments,
      },
    });
    res.status(201).json(addedFeedback);
  } catch (error) {
    console.log("Error adding feedback:", error);
    res.status(500).json({ error: "An error occured" });
  }
};

module.exports = allowCors(handler);
