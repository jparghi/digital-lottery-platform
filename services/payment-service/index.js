import express from "express";
import amqp from "amqplib";
const app = express();
const PORT = 8081;
const QUEUE = "tickets";
(async () => {
try {
const conn = await amqp.connect("amqp://guest:guest@rabbitmq:5672");
const ch = await conn.createChannel();
await ch.assertQueue(QUEUE);
ch.consume(QUEUE, msg => {
console.log("[PAYMENT] Payment confirmed for", msg.content.toString());
ch.ack(msg);
});
} catch (err) {
console.error("RabbitMQ connection error", err);
}
})();
app.get("/api/payment/health", (req, res) => res.send("OK"));
app.listen(PORT, () => console.log(Payment-Service running on ${PORT}));
