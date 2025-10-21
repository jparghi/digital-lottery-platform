Good — you’ve narrowed it down exactly: everything except the **Payment Service** container works. That’s the right focus point.

Let’s fix it methodically so we don’t keep chasing symptoms.

---

## 🧭 Step 1 — Check what actually kills the container

Run:

```bash
docker logs digital-lottery-platform-payment-service-1
```

If it exits too fast:

```bash
docker compose up payment-service
```

to watch it start interactively.

Write down or copy the last 5–10 lines that start with `Error:` or `RabbitMQ connection error`.
(That’s the *real* cause: Node runtime, npm install, or broker connection.)

---

## 🧰 Step 2 — Make sure the Node image really contains dependencies

Rebuild the image cleanly:

```bash
docker compose down
docker compose build --no-cache payment-service
```

Then start only it:

```bash
docker compose up -d payment-service
docker ps | grep payment-service
```

If it still exits, logs will usually show one of these:

| Error snippet                                 | Meaning                           | Fix                             |
| --------------------------------------------- | --------------------------------- | ------------------------------- |
| `Cannot find module 'express'` or `'amqplib'` | npm didn’t run during image build | check `Dockerfile` & rebuild    |
| `RabbitMQ connection error ECONNREFUSED`      | container starts before broker    | add retry logic or `depends_on` |
| `SyntaxError`                                 | typo in code                      | fix file & rebuild              |

---

## 🧩 Step 3 — Known-good files

### `services/payment-service/Dockerfile`

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install
COPY . .
EXPOSE 8081
CMD ["node","index.js"]
```

*(copying `package.json` before the rest lets Docker cache npm install)*

### `services/payment-service/package.json`

```json
{
  "name": "payment-service",
  "version": "1.0.0",
  "type": "module",
  "dependencies": {
    "express": "^4.19.2",
    "amqplib": "^0.10.3"
  }
}
```

### `services/payment-service/index.js`

```javascript
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
```

✅ The retry loop prevents the container from crashing if RabbitMQ isn’t ready yet.

---

## ⚙️ Step 4 — Ensure Compose waits for RabbitMQ

Edit the service block in `docker-compose.yml`:

```yaml
  payment-service:
    build: ./services/payment-service
    ports:
      - "8081:8081"
    env_file: .env
    depends_on:
      rabbitmq:
        condition: service_started
```

---

## 🔄 Step 5 — Re-run everything

```bash
docker compose down -v
docker compose build --no-cache payment-service
docker compose up -d
```

Check status:

```bash
docker ps | grep payment-service
```

Expected → **Up** (healthy).

Logs:

```bash
docker logs -f digital-lottery-platform-payment-service-1
```

You should see:

```
[PAYMENT] Connected to RabbitMQ
Payment-Service running on 8081
```

---

## ✅ Step 6 — Re-test end-to-end

```bash
curl -X POST http://localhost/api/ticket/buy
```

Then:

```bash
docker logs -f digital-lottery-platform-payment-service-1
```

→ `[PAYMENT] Payment confirmed for new-ticket`

---

If you paste the **current logs** from `docker logs digital-lottery-platform-payment-service-1`, I can confirm the exact failing line and tell you the one-line fix.
But applying the retry-loop version above almost always resolves the “payment-service exited (1)” problem permanently.
