const redis = require("redis");
const axios = require("axios");

console.log("REDIS_URI: ", process.env.REDIS_URI);

const redisClient = redis.createClient({
  url: process.env.REDIS_URI,
});

redisClient.connect().catch(console.error);

// Register contributor IP
const registerIP = async (req, res) => {
  // Get the IP address from the request
  console.log("Request body: ", req.body);
  const { url } = req.body;

  // Store the IP in Redis
  await redisClient.sAdd("contributors", url);
  res.status(200).json({ message: "url registered successfully", ip });
};

// Notify contributors when a WhatsApp message is received
const notifyContributors = async (req, res) => {
  try {
    const contributors = await redisClient.sMembers("contributors");
    console.log({ contributors });
    contributors.forEach((url) => {
      console.log({ url });
      axios
        .post(`${url}/webhook`, req.body)
        .then(() => console.log(`Message sent to ${url}`))
        .catch((error) =>
          console.error(`Error sending message to ${url}:`, error)
        );
    });

    res.status(200).json({ message: "Contributors notified" });
  } catch (e) {
    console.error(e);
    res.sendStatus(500);
  }
};

module.exports = { registerIP, notifyContributors };
