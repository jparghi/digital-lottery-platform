import express from "express";
import amqp from "amqplib";

const app = express();
const PORT = 8081;
const QUEUE = "tickets";
const RABBIT_URL = "amqp://guest:guest@rabbitmq:5672";

async function connectQueue() {
    while (true) {
        try {
            const conn = await amqp.connect(RABBIT_URL);
            const ch = await conn.createChannel();
            await ch.assertQueue(QUEUE);
            console.log("[PAYMENT] Connected to RabbitMQ");
            ch.consume(QUEUE, (msg) => {
                console.log("[PAYMENT] Payment confirmed for", msg.content.toString());
                ch.ack(msg);
            });
            break; // success
        } catch (err) {
            console.error("[PAYMENT] RabbitMQ connection error, retrying in 5 s", err.message);
            await new Promise((r) => setTimeout(r, 5000));
        }
    }
}
connectQueue();

app.get("/api/payment/health", (req, res) => res.send("OK"));
app.listen(PORT, () => console.log(`Payment-Service running on ${PORT}`));
