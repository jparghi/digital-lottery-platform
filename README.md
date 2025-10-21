# 🎰 Digital Lottery Platform – Phase 1 MVP

Microservice-based MVP demonstrating:
React → Nginx → Spring Boot (Ticket Service) → RabbitMQ → Node.js (Payment Service) → Postgres → Prometheus + Grafana.

## Quick Start
```bash
docker compose up -d --build
Frontend: http://localhost

RabbitMQ UI: http://localhost:15672

Grafana: http://localhost:3000
 (admin/admin)

Prometheus: http://localhost:9090

