require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const redis = require("redis");
const { notifyContributors, registerIP } = require("./controller");

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

// Endpoint for contributors to register their IPs
app.post("/register-url", registerIP);

// Webhook endpoint for WhatsApp messages
app.post("/webhook", notifyContributors);

console.log("Secret: ", process.env.WHATSAPP_SECRET);

app.get("/webhook", (req, res) => {
  try {
    console.log("Query: ", req.query);
    if (
      req.query["hub.mode"] == "subscribe" &&
      req.query["hub.verify_token"] == process.env.WHATSAPP_SECRET
    ) {
      res.send(req.query["hub.challenge"]);
    } else {
      res.sendStatus(400);
    }
  } catch (e) {
    console.error(e);
    res.sendStatus(500);
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
