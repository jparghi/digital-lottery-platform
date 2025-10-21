Perfect — now that you’ve fixed the syntax issue and rebuilt your stack, this is the right time to perform a **complete sanity test** of your **Digital Lottery Platform MVP** 🧠🎯

Here’s your exact **Chief-Architect-style Sanity Checklist** — short, precise, and repeatable.

---

## 🧩 1️⃣ Clean Start

```bash
docker compose down -v
docker compose build --no-cache
docker compose up -d
```

✅ *Purpose:* ensures you’re running only fresh images and containers with the new fixed code.

---

## 🧭 2️⃣ Verify Container Health

```bash
docker ps
```

✅ *Expected output:* all these should show **STATUS = Up**

| Service         | Port       | Purpose           |
| --------------- | ---------- | ----------------- |
| gateway         | 80         | reverse proxy     |
| ticket-service  | 8080       | issues ticket     |
| payment-service | 8081       | consumes RabbitMQ |
| db              | 5432       | PostgreSQL        |
| rabbitmq        | 5672/15672 | message broker    |
| prometheus      | 9090       | metrics           |
| grafana         | 3000       | dashboards        |
| frontend        | 5173       | simple UI         |

If any shows **Exited (1)** → check logs:

```bash
docker logs <container_name>
```

---

## 🎫 3️⃣ Ticket Flow Validation

### Step A — Call the API

```bash
curl -X POST http://localhost/api/ticket/buy
```

✅ *Expected response:*

```
Ticket purchased
```

---

### Step B — Verify Payment Consumer

```bash
docker logs -f digital-lottery-platform-payment-service-1
```

✅ *Expected log line:*

```
[PAYMENT] Payment confirmed for new-ticket
```

This confirms RabbitMQ → Payment-Service connectivity.

---

### Step C — Database Record Check

```bash
docker exec -it digital-lottery-platform-db-1 psql -U lottery_user -d lottery_db
```

Then run inside psql:

```sql
SELECT * FROM tickets;
SELECT * FROM payments;
```

✅ *Expected:*
At least one ticket row with status `PENDING` or `CONFIRMED`.

Exit with `\q`.

---

## 🐇 4️⃣ RabbitMQ Dashboard

Visit → [http://localhost:15672](http://localhost:15672)
Login: `guest / guest`
✅ *Expected:*
Queue named `tickets` with message count increasing/decreasing as you trigger `curl`.

---

## 📈 5️⃣ Prometheus + Grafana

* **Prometheus:** [http://localhost:9090](http://localhost:9090)
  Search for `http_server_requests_seconds_count`

* **Grafana:** [http://localhost:3000](http://localhost:3000)
  Login: `admin / admin`
  Add data source → Prometheus → URL `http://prometheus:9090`
  Create simple dashboard → visualize ticket-service latency.

✅ *Expected:* metrics visible for ticket-service and payment-service.

---

## 🌐 6️⃣ Frontend Sanity

Open your browser → [http://localhost](http://localhost)

✅ *Expected:*
A simple page with a **“Buy Ticket 🎟️”** button.
Click it → alert “Ticket purchased!” → check logs again → `[PAYMENT] Payment confirmed`.

---

## 🧰 7️⃣ Gateway Proxy Check

Run:

```bash
curl -v http://localhost/api/ticket/buy
```

✅ *Look for:*

```
> POST /api/ticket/buy HTTP/1.1
< HTTP/1.1 200 OK
```

That confirms Nginx routing is correct.

---

## 🔧 8️⃣ Clean Exit & Restart Validation

```bash
docker compose down
docker compose up -d
docker ps
```

✅ *All services should start without manual restarts* — proving your compose dependencies and health-checks are correct.

---

## 🧾 9️⃣ Sanity Report Summary

| Check            | Command                                        | Expected Result             |
| ---------------- | ---------------------------------------------- | --------------------------- |
| 🟢 Containers up | `docker ps`                                    | All services “Up”           |
| 🟢 API           | `curl -X POST http://localhost/api/ticket/buy` | “Ticket purchased”          |
| 🟢 Logs          | `docker logs payment-service`                  | “Payment confirmed”         |
| 🟢 DB            | SQL query                                      | Ticket & Payment rows exist |
| 🟢 RabbitMQ      | Dashboard                                      | Queue visible               |
| 🟢 Grafana       | Dashboard                                      | Metrics appear              |
| 🟢 Restart       | `docker compose up -d`                         | All auto-start cleanly      |

---

Once all of those pass, you can confidently say:
✅ **Your Digital Lottery Platform MVP is fully operational and integration-tested locally.**

Would you like me to generate a short **Markdown “Sanity Test Checklist.md”** file you can drop into the repo for future use or demos?
