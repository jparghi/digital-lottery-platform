Perfect timing, Jigish ✅ — now that we’ve corrected all service interconnections (RabbitMQ host binding, controller domain path, gateway proxying, and retry logic), your **sanity checklist** should be upgraded to reflect **the latest architecture and runtime behavior**.

Below is the **updated and corrected “Sanity Test Checklist.md”**, incorporating all the domain and dependency fixes (RabbitMQ host config, retry logic, Nginx proxy alignment, and Spring mappings).

---

# 🎯 Digital Lottery Platform – Sanity Test Checklist (Final)

**Goal:** Validate full end-to-end flow — *Frontend → Gateway → Ticket Service → RabbitMQ → Payment Service → DB → Prometheus/Grafana* — after fixing RabbitMQ and route domains.

---

## 🧩 1️⃣ Clean Start

```bash
docker compose down -v
docker compose build --no-cache
docker compose up -d
```

✅ *Purpose:* Run fresh containers with all fixed configs (RabbitMQ, gateway, health checks).

---

## 🧭 2️⃣ Verify Container Health

```bash
docker ps
```

✅ *Expected output:*

| Service         | Port       | Purpose           | Health       |
| --------------- | ---------- | ----------------- | ------------ |
| gateway         | 80         | reverse proxy     | Up (healthy) |
| ticket-service  | 8080       | issues ticket     | Up (healthy) |
| payment-service | 8081       | consumes RabbitMQ | Up (healthy) |
| db              | 5432       | PostgreSQL        | Up           |
| rabbitmq        | 5672/15672 | message broker    | Up           |
| prometheus      | 9090       | metrics           | Up           |
| grafana         | 3000       | dashboards        | Up           |
| frontend        | 5173       | simple UI         | Up           |

> If any show **Exited (1)** or **unhealthy**, check logs with:
> `docker logs <container_name>`

---

## 🐇 3️⃣ RabbitMQ Connectivity Test

Run:

```bash
docker logs -f digital-lottery-platform-payment-service-1
```

✅ *Expected startup sequence:*

```
Payment-Service running on 8081
[PAYMENT] RabbitMQ connection error, retrying in 5 s ...
[PAYMENT] Connected to RabbitMQ
```

> This confirms the retry logic works and RabbitMQ is reachable inside the Docker network.

---

## 🎫 4️⃣ Ticket Flow Validation

### Step A — Ticket API (direct to service)

```bash
curl -X POST http://localhost:8080/api/ticket/buy
```

✅ *Expected response:*

```
Ticket purchased
```

> Confirms the Ticket Service successfully publishes to the `tickets` queue.

---

### Step B — Verify Payment Consumer

```bash
docker logs -f digital-lottery-platform-payment-service-1
```

✅ *Expected log line:*

```
[PAYMENT] Payment confirmed for new-ticket
```

> Confirms RabbitMQ → Payment Service queue consumption is working.

---

### Step C — Gateway Proxy Route

```bash
curl -X POST http://localhost/api/ticket/buy
```

✅ *Expected response:*

```
Ticket purchased
```

> Confirms **Nginx** correctly proxies `/api/ticket/buy` to `/api/ticket/buy` inside the Ticket Service.

---

## 🧱 5️⃣ Database Record Check

```bash
docker exec -it digital-lottery-platform-db-1 psql -U lottery_user -d lottery_db
```

Inside `psql`, run:

```sql
SELECT * FROM tickets;
SELECT * FROM payments;
```

✅ *Expected:*
At least one ticket and one payment record.

Exit with `\q`.

---

## 📊 6️⃣ RabbitMQ Management UI

Open → [http://localhost:15672](http://localhost:15672)
Login: `guest / guest`

✅ *Expected:*

* Queue named `tickets`
* Message count fluctuates as you trigger `curl`.

---

## 📈 7️⃣ Prometheus + Grafana

**Prometheus:** [http://localhost:9090](http://localhost:9090)
→ Query `http_server_requests_seconds_count`

**Grafana:** [http://localhost:3000](http://localhost:3000)
→ Login: `admin / admin`
→ Add data source: Prometheus → `http://prometheus:9090`
→ Create dashboard to visualize Ticket & Payment metrics.

✅ *Expected:*
Metrics are being scraped for `ticket-service` and `payment-service`.

---

## 🌐 8️⃣ Frontend Test

Open → [http://localhost](http://localhost)

✅ *Expected:*

* Page loads with a **“Buy Ticket 🎟️”** button
* Clicking it triggers a `fetch('/api/ticket/buy')` → alert *“Ticket purchased!”*
* Payment logs show confirmation.

---

## 🔧 9️⃣ Restart & Recovery Check

```bash
docker compose down
docker compose up -d
docker ps
```

✅ *Expected:*
All services start automatically without manual restarts or dependency failures.

---

## 🧾 10️⃣ Sanity Report Summary

| Check            | Command                                             | Expected Result                |
| ---------------- | --------------------------------------------------- | ------------------------------ |
| 🟢 Containers up | `docker ps`                                         | All “Up (healthy)”             |
| 🟢 Ticket API    | `curl -X POST http://localhost:8080/api/ticket/buy` | “Ticket purchased”             |
| 🟢 Gateway       | `curl -X POST http://localhost/api/ticket/buy`      | “Ticket purchased”             |
| 🟢 Payment logs  | `docker logs payment-service`                       | “Payment confirmed”            |
| 🟢 DB            | SQL query                                           | Ticket & Payment records exist |
| 🟢 RabbitMQ      | Dashboard                                           | Queue visible                  |
| 🟢 Grafana       | Dashboard                                           | Metrics shown                  |
| 🟢 Restart       | `docker compose up -d`                              | All auto-start cleanly         |

---

✅ Once all tests pass, your **Digital Lottery Platform MVP** is officially:
**Fully integrated, message-driven, observable, and production-grade for demo.**

---

Would you like me to generate this as a downloadable **`Sanity_Test_Checklist.md`** file you can drop directly into your `/docs` or root folder so you can commit it to Git and share with the team?

