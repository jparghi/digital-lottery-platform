# 🎰 Digital Lottery Platform – Phase 1 MVP

**A microservice-based, message-driven MVP demonstrating an event-oriented lottery system.**

**Stack:**
React → Nginx (Gateway) → Spring Boot (Ticket Service) → RabbitMQ → Node.js (Payment Service) → PostgreSQL → Prometheus + Grafana

---

## 🚀 Architecture Overview

```text
[Frontend (React)]
        │
        ▼
[Nginx Gateway (port 80)]
        │
 ┌──────┴───────────┐
 │                  │
 ▼                  ▼
Ticket Service   Payment Service
(Spring Boot)    (Node.js)
     │                │
     └────▶ RabbitMQ ◀┘
            │
            ▼
        PostgreSQL
            │
            ▼
  Prometheus + Grafana
```

**Flow summary:**

1. Frontend triggers **Buy Ticket** → `POST /api/ticket/buy`
2. Gateway proxies the call to **Ticket Service**.
3. Ticket Service creates a ticket record and publishes a message to RabbitMQ `tickets` queue.
4. **Payment Service** consumes the message and creates a payment record in Postgres.
5. Metrics are exported to Prometheus and visualized in Grafana.

---

## 🧩 Prerequisites

* Docker Desktop ≥ 24.x
* Docker Compose v2
* Ports 80, 5432, 5672, 15672, 8080, 8081, 9090, 3000, 5173 available

---

## ⚙️ Quick Start

```bash
# clone repo and enter project folder
git clone https://github.com/jparghi/digital-lottery-platform.git
cd digital-lottery-platform

# build and run all services
docker compose up -d --build
```

### Access Endpoints

| Component       | URL                                                                                  | Notes                         |
| --------------- | ------------------------------------------------------------------------------------ | ----------------------------- |
| Frontend        | [http://localhost](http://localhost)                                                 | React UI                      |
| Gateway         | [http://localhost/api/ticket/buy](http://localhost/api/ticket/buy)                   | Proxy endpoint                |
| Ticket Service  | [http://localhost:8080/api/ticket/buy](http://localhost:8080/api/ticket/buy)         | Spring Boot API               |
| Payment Service | [http://localhost:8081/api/payment/health](http://localhost:8081/api/payment/health) | Health check                  |
| PostgreSQL      | localhost:5432                                                                       | lottery_db / lottery_user     |
| RabbitMQ UI     | [http://localhost:15672](http://localhost:15672)                                     | guest / guest                 |
| Prometheus      | [http://localhost:9090](http://localhost:9090)                                       | Metrics endpoint              |
| Grafana         | [http://localhost:3000](http://localhost:3000)                                       | admin / admin (default login) |

---

## 🧪 Sanity Test Checklist

### 1️⃣ Clean Start

```bash
docker compose down -v
docker compose build --no-cache
docker compose up -d
```

### 2️⃣ Verify Containers

```bash
docker ps
```

All services should show `Up (healthy)`.

### 3️⃣ End-to-End Flow

```bash
curl -X POST http://localhost:8080/api/ticket/buy
# → Ticket purchased
```

Then:

```bash
docker logs -f digital-lottery-platform-payment-service-1
# → [PAYMENT] Payment recorded in DB ✅
```

Check DB:

```bash
docker exec -it digital-lottery-platform-db-1 psql -U lottery_user -d lottery_db
SELECT * FROM tickets;
SELECT * FROM payments;
```

✅ Each ticket purchase adds 1 row in `tickets` and 1 in `payments`.

### 4️⃣ RabbitMQ Dashboard

[http://localhost:15672](http://localhost:15672) → login `guest/guest`
Queue `tickets` should show 1 consumer (Payment Service).

### 5️⃣ Monitoring

* Prometheus: [http://localhost:9090](http://localhost:9090)
  → Query `http_server_requests_seconds_count`
* Grafana: [http://localhost:3000](http://localhost:3000) → add Prometheus data source → create dashboard.

### 6️⃣ Restart Validation

```bash
docker compose down
docker compose up -d
docker ps
```

All services auto-start cleanly.

---

## 🧱 Project Structure

```
digital-lottery-platform/
│
├── frontend/          # React UI
├── gateway/          # Nginx reverse proxy
├── services/
│   ├── ticket-service/ # Spring Boot producer
│   └── payment-service/ # Node.js consumer + DB writer
├── database/          # Postgres init scripts
├── monitoring/        # Prometheus + Grafana config
├── docker-compose.yml
└── README.md (this file)
```

---

## 📊 Metrics and Observability

* **Spring Boot Actuator** exposes `/actuator/prometheus`.
* **Prometheus** scrapes `ticket-service:8080` and `payment-service:8081`.
* **Grafana** visualizes request counts and latency.

---

## 🔐 Credentials & Environment

`.env` file:

```env
POSTGRES_USER=lottery_user
POSTGRES_PASSWORD=lottery_pass
POSTGRES_DB=lottery_db
RABBITMQ_USER=guest
RABBITMQ_PASS=guest
```

---

## 🧠 Phase 1 Highlights

| Feature       | Tech                           | Purpose                    |
| ------------- | ------------------------------ | -------------------------- |
| Microservices | Spring Boot + Node.js          | Modular domain isolation   |
| Event-Driven  | RabbitMQ                       | Async communication        |
| Persistence   | PostgreSQL                     | Ticket and payment storage |
| Observability | Prometheus + Grafana           | Metrics collection         |
| Scalability   | Docker Compose / K8s-ready     | Easily extendable          |
| Resilience    | Retry logic in Payment Service | Startup order safe         |
| Gateway       | Nginx                          | Unified entry point        |

---

## 🧭 Next Phase (Planned MAP2)

* Add user management and auth tokens (JWT).
* Implement distributed tracing (OpenTelemetry).
* Expose RESTful payment API with status tracking.
* Deploy on Kubernetes with Terraform modules.

---

✅ **Digital Lottery Platform MVP – MAP1 Complete**

> *Fully operational local deployment, verifiable through RabbitMQ, DB, and Grafana dashboards.*

---
