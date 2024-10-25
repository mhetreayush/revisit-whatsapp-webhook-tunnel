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
  const ip =
    req.body.ip ??
    req.headers["x-forwarded-for"] ??
    req.connection.remoteAddress;

  if (!ip) {
    return res.status(400).json({ error: "Unable to retrieve IP address" });
  }

  // Store the IP in Redis
  await redisClient.sAdd("contributors", ip);
  res.status(200).json({ message: "IP registered successfully", ip });
};

// Notify contributors when a WhatsApp message is received
const notifyContributors = async (req, res) => {
  try {
    const contributors = await redisClient.sMembers("contributors");
    console.log({ contributors });
    contributors.forEach((ip) => {
      console.log({ ip });
      axios
        .post(`http://${ip}:3000/webhook`, req.body)
        .then(() => console.log(`Message sent to ${ip}`))
        .catch((error) =>
          console.error(`Error sending message to ${ip}:`, error)
        );
    });

    res.status(200).json({ message: "Contributors notified" });
  } catch (e) {
    console.error(e);
    res.sendStatus(500);
  }
};

module.exports = { registerIP, notifyContributors };
