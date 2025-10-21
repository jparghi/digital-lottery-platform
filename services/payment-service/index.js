import express from "express";
import amqp from "amqplib";
import pkg from "pg";
const { Client } = pkg;

const app = express();
const PORT = 8081;
const QUEUE = "tickets";
const RABBIT_URL = "amqp://guest:guest@rabbitmq:5672";

// DB connection config (same as Postgres service)
const DB_CONFIG = {
    host: "db",
    user: "lottery_user",
    password: "lottery_pass",
    database: "lottery_db",
};

async function connectQueue() {
    while (true) {
        try {
            const conn = await amqp.connect(RABBIT_URL);
            const ch = await conn.createChannel();
            await ch.assertQueue(QUEUE);
            console.log("[PAYMENT] Connected to RabbitMQ, waiting for messages...");

            ch.consume(QUEUE, async (msg) => {
                if (msg !== null) {
                    const content = msg.content.toString();
                    console.log("[PAYMENT] Received ticket event:", content);

                    // Save payment record into DB
                    try {
                        const client = new Client(DB_CONFIG);
                        await client.connect();
                        await client.query(
                            "INSERT INTO payments (ticket_id, amount, status) VALUES ($1, $2, $3)",
                            [1, 10.00, "CONFIRMED"]
                        );
                        await client.end();
                        console.log("[PAYMENT] Payment recorded in DB ✅");
                    } catch (dbErr) {
                        console.error("[PAYMENT] Database insert error:", dbErr.message);
                    }

                    ch.ack(msg);
                }
            });

            break; // connected successfully
        } catch (err) {
            console.error("[PAYMENT] RabbitMQ connection error, retrying in 5 s", err.message);
            await new Promise((r) => setTimeout(r, 5000));
        }
    }
}

connectQueue();

app.get("/api/payment/health", (req, res) => res.send("OK"));
app.listen(PORT, () => console.log(`Payment-Service running on ${PORT}`));
