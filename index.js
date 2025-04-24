const express = require("express");
const axios = require("axios");
require("dotenv").config();

const app = express();
app.use(express.json());

const token = process.env.WHATSAPP_TOKEN;
const phoneNumberId = process.env.PHONE_NUMBER_ID;

app.post("/webhook", async (req, res) => {
  const entry = req.body.entry?.[0];
  const changes = entry?.changes?.[0];
  const message = changes?.value?.messages?.[0];

  if (message && message.text) {
    const text = message.text.body.trim();
    const lines = text.split("\n").map(line => line.trim());

    if (lines.length >= 5 && lines[0].startsWith("+")) {
      const destinationNumber = lines[0].replace(/\D/g, ""); // Extract digits only
      const [ , name, grade, subject, typeOfCall, duration = "N/A" ] = lines;

      const formattedMessage = `Name: ${name}\nGrade: ${grade}\nSubject: ${subject}\nType of Call: ${typeOfCall}\nDuration: ${duration}`;

      try {
        await axios.post(
          `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`,
          {
            messaging_product: "whatsapp",
            to: destinationNumber,
            type: "text",
            text: { body: formattedMessage }
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json"
            }
          }
        );
        console.log(`✅ Forwarded to ${destinationNumber}`);
      } catch (err) {
        console.error(`❌ Error forwarding: ${err.message}`);
      }
    } else {
      console.log("⚠️ Invalid message format");
    }
  }

  res.sendStatus(200);
});

app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === process.env.VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }
  res.sendStatus(403);
});

app.listen(10000, () => {
  console.log("✅ Server is running on port 10000");
});
