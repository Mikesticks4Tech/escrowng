# EscrowNG 🔐

> **Secure peer-to-peer escrow payments for Nigeria — powered by Paystack.**

EscrowNG is a full-stack fintech web application that eliminates payment fraud in peer-to-peer transactions. Buyers pay into escrow; funds are held securely until the seller delivers and the buyer confirms — then and only then are funds released. Built-in dispute resolution ensures fair outcomes for every transaction.

---

## The Problem

Online transactions in Nigeria are riddled with trust gaps — buyers fear paying and not receiving, sellers fear delivering and not getting paid. EscrowNG sits in the middle as a neutral, automated escrow agent, so both parties transact with confidence.

---

## Live Demo

🔗 **[https://escrowng.vercel.app](#)**

---

## Features

### 💳 Secure Escrow Payment Flow

Transactions move through a clear, auditable lifecycle:

```
Pending → Funded → Delivered → Completed
```

Funds only move to the seller after the buyer explicitly confirms delivery. No surprises, no disputes from miscommunication.

### 💰 Real Paystack Integration

Buyers pay via card, bank transfer, or USSD — all powered by Paystack's production-grade payment infrastructure. Webhooks keep transaction state in sync automatically.

### 📨 Seller Invite System

Buyers initiate a transaction and invite the seller by email. Sellers receive a pending notification and can accept or reject before any funds are committed.

### ⚖️ Dispute & Resolution System

If a buyer raises a dispute, the transaction is flagged for admin review. Admins can investigate and resolve — releasing funds to the seller or refunding the buyer — based on evidence.

### 🔐 JWT Authentication

Protected routes on both the frontend and backend. Access tokens ensure only authenticated users can view or act on transactions.

### 📊 Real-Time Status Tracking

Both buyer and seller can track transaction status in real time from their dashboards — no guessing, no chasing messages.

---

## Tech Stack

| Layer      | Technology                              |
| ---------- | --------------------------------------- |
| Frontend   | React, TypeScript, React Router         |
| Backend    | Node.js, Express                        |
| Database   | MongoDB Atlas, Mongoose                 |
| Payments   | Paystack API (webhooks + direct charge) |
| Auth       | JWT (JSON Web Tokens)                   |
| Deployment | Vercel (frontend), Render (backend)     |

---

## How It Works

1. **Buyer creates a transaction** — sets amount, description, and invites the seller by email.
2. **Seller accepts the invite** — both parties agree to terms before any money moves.
3. **Buyer funds the escrow** — pays via Paystack; funds are held by EscrowNG.
4. **Seller delivers** — marks the transaction as delivered when goods/services are sent.
5. **Buyer confirms** — reviews the delivery and confirms. Funds are released to the seller.
6. **Dispute (if needed)** — buyer can open a dispute instead of confirming. Admin steps in to resolve.

---

## Getting Started

### Prerequisites

- Node.js v18+
- MongoDB Atlas cluster
- Paystack account (test or live keys)

### Clone the Repo

```bash
git clone https://github.com/Mikesticks4tech/escrowng.git
cd escrowng
```

### Backend Setup

```bash
cd server
npm install
```

Create a `.env` file in `/server`:

```env
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret_key
PAYSTACK_SECRET_KEY=sk_test_your_paystack_secret_key
CLIENT_URL=http://localhost:5173
```

Start the server:

```bash
npm run dev
```

### Frontend Setup

```bash
cd client
npm install
```

Create a `.env` file in `/client`:

```env
VITE_API_URL=http://localhost:5000/api
VITE_PAYSTACK_PUBLIC_KEY=pk_test_your_paystack_public_key
```

Start the frontend:

```bash
npm run dev
```

App runs at `http://localhost:5173`

---

## Environment Variables Reference

### Backend (`/server/.env`)

| Variable              | Description                                      |
| --------------------- | ------------------------------------------------ |
| `MONGO_URI`           | MongoDB Atlas connection string                  |
| `JWT_SECRET`          | Secret key for signing JWTs                      |
| `PAYSTACK_SECRET_KEY` | Paystack secret key (sk*test*... or sk*live*...) |
| `CLIENT_URL`          | Frontend URL for CORS                            |

### Frontend (`/client/.env`)

| Variable                   | Description                                      |
| -------------------------- | ------------------------------------------------ |
| `VITE_API_URL`             | Backend API base URL                             |
| `VITE_PAYSTACK_PUBLIC_KEY` | Paystack public key (pk*test*... or pk*live*...) |

---

## Folder Structure

```
escrowng/
├── client/                  # React + TypeScript frontend
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Route-level pages
│   │   ├── context/         # Auth context / global state
│   │   └── utils/           # API helpers, constants
│   └── ...
│
├── server/                  # Node.js + Express backend
│   ├── controllers/         # Route logic
│   ├── models/              # Mongoose schemas
│   ├── routes/              # API route definitions
│   ├── middleware/          # Auth middleware, error handling
│   └── ...
```

---

## API Endpoints (Overview)

### Auth

| Method | Endpoint             | Description           |
| ------ | -------------------- | --------------------- |
| POST   | `/api/auth/register` | Register a new user   |
| POST   | `/api/auth/login`    | Login and receive JWT |

### Transactions

| Method | Endpoint                        | Description                               |
| ------ | ------------------------------- | ----------------------------------------- |
| POST   | `/api/transactions`             | Create a new escrow transaction           |
| GET    | `/api/transactions`             | Get all transactions for logged-in user   |
| GET    | `/api/transactions/:id`         | Get transaction details                   |
| PATCH  | `/api/transactions/:id/fund`    | Mark transaction as funded (post-payment) |
| PATCH  | `/api/transactions/:id/deliver` | Seller marks as delivered                 |
| PATCH  | `/api/transactions/:id/confirm` | Buyer confirms delivery                   |

### Disputes

| Method | Endpoint                    | Description            |
| ------ | --------------------------- | ---------------------- |
| POST   | `/api/disputes`             | Open a dispute         |
| PATCH  | `/api/disputes/:id/resolve` | Admin resolves dispute |

### Payments

| Method | Endpoint                | Description              |
| ------ | ----------------------- | ------------------------ |
| POST   | `/api/payments/webhook` | Paystack webhook handler |

---

## Deployment

**Frontend → Vercel**

- Connect your GitHub repo to Vercel
- Set environment variables in the Vercel dashboard
- Vercel auto-deploys on every push to `main`

**Backend → Render**

- Connect your GitHub repo to Render
- Set environment variables in Render dashboard
- Add `npm run build && npm start` as the start command

> **Tip:** Use [UptimeRobot](https://uptimerobot.com) to ping your Render backend every 5 minutes to prevent cold starts on the free tier.

---

## Author

**Idowu Michael (Mike)**
Full Stack Developer · Nigeria

- GitHub: [@Mikesticks4tech](https://github.com/Mikesticks4tech)
- LinkedIn: [linkedin.com/in/idowu-michael-025a01387](#)

---

## License

MIT — feel free to fork and build on top of this.
