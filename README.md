# SpendWise — Full-Stack MERN Expense Tracker

A complete expense tracker built with MongoDB, Express, React, and Node.js.

## Features
- 🔐 JWT authentication (register / login)
- 💳 Manage transactions — add, edit, delete, filter, search, paginate
- 🎯 Monthly budgets per category with live alerts (warning / exceeded)
- 📊 Monthly & yearly reports with charts (line, bar, doughnut)
- 📱 Fully responsive, dark-themed UI

---

## Project Structure

```
spendwise/
├── package.json              ← root scripts (dev, install-all, build)
├── .env.example              ← copy to .env and fill in values
├── .gitignore
│
├── backend/
│   ├── server.js             ← Express app entry point
│   ├── package.json
│   ├── config/
│   │   └── db.js             ← MongoDB connection
│   ├── models/
│   │   ├── User.js           ← User schema (bcrypt hashing)
│   │   ├── Transaction.js    ← Transaction schema + indexes
│   │   └── Budget.js         ← Budget schema
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── transactionController.js
│   │   ├── budgetController.js
│   │   └── reportController.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── transactionRoutes.js
│   │   ├── budgetRoutes.js
│   │   └── reportRoutes.js
│   └── middleware/
│       └── authMiddleware.js ← JWT protect middleware
│
└── frontend/
    ├── package.json
    ├── public/
    │   └── index.html
    └── src/
        ├── index.js           ← ReactDOM entry
        ├── index.css          ← Global styles + design tokens
        ├── App.js             ← BrowserRouter + route definitions
        ├── utils/
        │   ├── api.js         ← Axios instance with JWT interceptor
        │   └── helpers.js     ← formatCurrency, formatDate, constants
        ├── context/
        │   ├── AuthContext.js
        │   ├── TransactionContext.js
        │   └── BudgetContext.js
        ├── pages/
        │   ├── LoginPage.js
        │   ├── RegisterPage.js
        │   ├── DashboardPage.js
        │   ├── TransactionsPage.js
        │   ├── BudgetPage.js
        │   └── ReportsPage.js
        └── components/
            ├── layout/
            │   ├── Layout.js      ← Navbar + <Outlet>
            │   └── Layout.css
            ├── dashboard/
            │   └── StatCard.js
            ├── transactions/
            │   ├── TransactionRow.js
            │   ├── TransactionModal.js
            │   └── Transactions.css
            ├── budget/
            │   ├── BudgetCard.js
            │   ├── BudgetModal.js
            │   └── Budget.css
            └── reports/
                └── CategoryBar.js
```

---

## Prerequisites

- **Node.js** v18+
- **MongoDB** — local install or [MongoDB Atlas](https://www.mongodb.com/atlas) (free tier)

---

## Quick Start

### 1. Clone and install all dependencies
```bash
git clone <your-repo-url>
cd spendwise

# Install root deps + backend + frontend in one go
npm run install-all
```

### 2. Configure environment
```bash
cp .env.example .env
```

Edit `.env`:
```
MONGO_URI=mongodb://localhost:27017/spendwise
JWT_SECRET=replace_with_a_long_random_string
PORT=5000
NODE_ENV=development
```

> For **MongoDB Atlas**, replace `MONGO_URI` with your connection string:
> `mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/spendwise`

### 3. Run in development
```bash
npm run dev
```

This starts:
- **Backend** on `http://localhost:5000`
- **Frontend** on `http://localhost:3000` (proxies `/api/*` to backend)

### 4. Open the app
Visit `http://localhost:3000` — register a new account and start tracking!

---

## API Reference

### Auth
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login, returns JWT |
| GET  | `/api/auth/me` | Get current user (protected) |

### Transactions (all protected)
| Method | Route | Description |
|--------|-------|-------------|
| GET  | `/api/transactions` | List with filters & pagination |
| GET  | `/api/transactions/summary` | Dashboard summary |
| POST | `/api/transactions` | Create transaction |
| PUT  | `/api/transactions/:id` | Update transaction |
| DELETE | `/api/transactions/:id` | Delete transaction |

**Query params for GET /transactions:**
`type`, `category`, `startDate`, `endDate`, `search`, `page`, `limit`

### Budgets (all protected)
| Method | Route | Description |
|--------|-------|-------------|
| GET  | `/api/budgets?month=YYYY-MM` | Get budgets with spending |
| POST | `/api/budgets` | Create/update single budget |
| POST | `/api/budgets/bulk` | Bulk upsert budgets |
| DELETE | `/api/budgets/:id` | Remove budget |

### Reports (all protected)
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/reports/monthly?month=YYYY-MM` | Monthly breakdown |
| GET | `/api/reports/yearly?year=YYYY` | Full year overview |
| GET | `/api/reports/months` | List months with data |

---

## Production Build

```bash
# Build frontend static files
npm run build

# Serve static files from Express (add to backend/server.js)
# app.use(express.static(path.join(__dirname, '../frontend/build')))
# app.get('*', (req, res) => res.sendFile(path.join(__dirname, '../frontend/build/index.html')))

# Then run
cd backend && npm start
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Database | MongoDB + Mongoose |
| Backend | Node.js + Express |
| Auth | JWT + bcryptjs |
| Validation | express-validator |
| Frontend | React 18 + React Router v6 |
| State | React Context API |
| HTTP client | Axios |
| Charts | Chart.js + react-chartjs-2 |
| Notifications | react-toastify |
| Dev tools | nodemon + concurrently |
