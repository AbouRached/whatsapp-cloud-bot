const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.json());

const token = 'YOUR_ACCESS_TOKEN';
const phoneNumberId = 'YOUR_PHONE_NUMBER_ID';

app.post('/webhook', async (req, res) => {
    const entry = req.body.entry?.[0];
    const changes = entry?.changes?.[0];
    const message = changes?.value?.messages?.[0];

    if (message) {
        const from = message.from;
        const text = message.text?.body || 'Received';

        await axios.post(`https://graph.facebook.com/v19.0/${phoneNumberId}/messages`, {
            messaging_product: "whatsapp",
            to: from,
            text: { body: `You said: ${text}` }
        }, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
    }

    res.sendStatus(200);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Webhook running on port ${PORT}`));
