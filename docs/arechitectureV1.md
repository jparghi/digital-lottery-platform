

## 🧩 2️⃣ YOUR DIGITAL LOTTERY POC — *Today’s Hands-On Project*

Let’s create a **real-world, end-to-end system** you can *architect and showcase tomorrow*.

This will be your **anchor example** throughout the interview.

---

## 💡 PRODUCT CONCEPT: “Pollard iWin Digital Lottery Platform”

### 🧱 Overview

A **multi-channel digital lottery system** allowing players to:

* Create account & verify identity (KYC/AML)
* Buy digital lottery tickets (instant or draw)
* View results, claim prizes
* Integrate with retail POS and partner APIs (state lotteries)
* Operate under high concurrency, strict compliance (ISO 27001, PCI-DSS)

---

## 🧮 DOMAIN BREAKDOWN

| Domain                 | Purpose                                  | Key Services                                        |
| ---------------------- | ---------------------------------------- | --------------------------------------------------- |
| 🎫 Ticketing           | Manage ticket purchase, validation, draw | `TicketService`, `DrawService`, `ValidationService` |
| 👤 Identity & Security | Account mgmt, authentication, KYC        | `AuthService`, `KYCService`, `UserProfileService`   |
| 💳 Payment & Ledger    | Handle transactions, refunds, payout     | `PaymentService`, `LedgerService`                   |
| 📈 Analytics           | Real-time insights, fraud detection      | `EventStreamService`, `AnalyticsService`            |
| 🔒 Compliance          | Logging, audit, data protection          | `AuditService`, `ComplianceService`                 |
| 🏗️ Admin/Config       | Manage games, prizes, configurations     | `AdminService`                                      |

---

## ☁️ ARCHITECTURE LAYERS

### **1️⃣ Frontend Layer**

* React/Next.js app → communicates via REST + GraphQL.
* Hosted on CDN (CloudFront / Azure CDN).
* JWT authentication + feature flags (for A/B testing).

### **2️⃣ API Gateway Layer**

* Central gateway (e.g., AWS API Gateway / Kong / Apigee).
* Handles routing, throttling, authentication (JWT).
* Logs all traffic → ELK.

### **3️⃣ Microservices Layer (Core of Interview)**

All microservices are:

* Spring Boot (Java) or Node.js
* Stateless → horizontally scalable on K8s
* Connected via REST + Async (Kafka)
* CI/CD via GitHub Actions + Terraform + Helm

Example service boundaries:

```
ticket-service/
  POST /buyTicket
  GET /drawResults
  emits: ticket.purchased event → Kafka topic
```

Async pattern:

* `TicketService` publishes to `ledger.transactions`
* `PaymentService` consumes → verifies payment → emits `payment.confirmed`
* `DrawService` subscribes → validates eligibility, triggers draw

### **4️⃣ Database Layer**

* PostgreSQL (for structured data)
* Redis (for caching draw results, session data)
* S3 / Blob Storage (for game assets)

### **5️⃣ Observability Layer**

* Prometheus + Grafana → metrics dashboards.
* ELK stack → logs.
* Alerts via Slack / PagerDuty.

### **6️⃣ Security & Compliance Layer**

* OAuth2/JWT across services.
* All PII encrypted with AES-256 + KMS.
* PCI-DSS for payments, ISO 27001 for data storage.
* Hash-based audit trails (immutability).

---

## ⚙️ TECH STACK

| Layer          | Tech                                  |
| -------------- | ------------------------------------- |
| Frontend       | React, Next.js, Redux                 |
| API Gateway    | Kong / AWS API Gateway                |
| Backend        | Java (Spring Boot), Node.js           |
| Messaging      | Kafka / SQS                           |
| Database       | PostgreSQL, Redis                     |
| Infrastructure | Terraform, Helm, Kubernetes (EKS/AKS) |
| Observability  | Prometheus, Grafana, ELK              |
| Security       | OAuth2, JWT, Vault, IAM               |
| CI/CD          | GitHub Actions, ArgoCD                |

---

## 🧠 KEY ARCHITECTURE DECISIONS

| Decision                  | Trade-off                             | Reasoning                                     |
| ------------------------- | ------------------------------------- | --------------------------------------------- |
| Microservices vs Monolith | ↑ complexity / ↑ scalability          | Lottery modules scale independently           |
| Kafka events              | ↑ latency / ↑ decoupling              | Enables real-time analytics & fault tolerance |
| PostgreSQL + Redis        | Relational + caching                  | Balances integrity and speed                  |
| Terraform IaC             | ↑ setup time / ↑ repeatability        | Enforces consistency & compliance             |
| Central API Gateway       | Potential bottleneck / unified policy | Simplifies security and routing               |
| CI/CD with SonarQube      | ↑ pipeline time / ↓ defects           | Security built into delivery                  |

---

## 🚦 NON-FUNCTIONAL REQUIREMENTS (They’ll love this)

* **Availability:** 99.99% (multi-zone deployment)
* **Latency:** <250ms for ticket purchase flow
* **Scalability:** 10k concurrent transactions
* **Compliance:** PCI-DSS, ISO 27001, GDPR
* **Observability:** Full tracing (OpenTelemetry)

---