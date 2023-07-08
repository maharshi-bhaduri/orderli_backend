// Serverless function to create a new provider
const handler = async (req, res) => {
  try {
    res.status(201).json({ hello: "world" });
  } catch (error) {
    console.error("Error test:", error);
    res.status(500).json({ error: "An error occurred" });
  }
}

module.exports = handler;