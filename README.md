# 📦 Enterprise Inventory & Supply Chain Management System

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/Node.js-%3E%3D%2020.x-green.svg)](https://nodejs.org/)
[![Database](https://img.shields.io/badge/Database-PostgreSQL%20%7C%20Prisma-blue.svg)](https://www.prisma.io/)
[![Frontend](https://img.shields.io/badge/Frontend-React%20%7C%20Vite%20%7C%20MUI-purple.svg)](https://react.dev/)
[![Real-Time](https://img.shields.io/badge/Real--Time-Socket.IO%20%7C%20Redis-red.svg)](https://socket.io/)

A modern, highly resilient, and state-of-the-art **Enterprise Inventory & Supply Chain Management System**. This repository contains a robust, container-ready full-stack application built with a Node.js Express backend using Prisma ORM, Redis, and Socket.IO, paired with a dynamic React frontend configured with Redux Toolkit, React Router, Material UI (MUI), and Recharts.

---

## 🗺️ System Architecture & Workflow

The diagram below illustrates the end-to-end supply chain operational flow and data synchronization mechanisms within the application.

```mermaid
graph TD
    subgraph Procurement
        Vendor[Vendor / Supplier] -->|Purchase Order| Warehouse[Warehouse / Facility]
    end
    subgraph Inventory Control
        Warehouse -->|Stock In / QR Code Scan| Inventory[Inventory Tracking]
        Inventory -->|Transfer Order| OtherWarehouse[Secondary Warehouse]
    end
    subgraph Logistics & Fulfillment
        Inventory -->|Sales Order| Delivery[Delivery / Shipment]
        Delivery -->|Dispatch & Route Tracking| Customer[End Customer]
    end
    subgraph Intelligence & Management
        Inventory -.->|Prisma ORM| DB[(PostgreSQL Database)]
        Inventory -.->|Real-time Events| Socket[Socket.IO Server]
        Socket -.->|Websocket Broadcast| Client[React Dashboard]
        DB -->|Aggregated Data| Analytics[Analytics Engine]
        Analytics -->|Interactive Charts| Client
    end
    
    style Vendor fill:#e1f5fe,stroke:#0288d1,stroke-width:2px
    style Warehouse fill:#e8f5e9,stroke:#388e3c,stroke-width:2px
    style Delivery fill:#fff8e1,stroke:#fbc02d,stroke-width:2px
    style Client fill:#ede7f6,stroke:#5e35b1,stroke-width:2px
    style DB fill:#eceff1,stroke:#37474f,stroke-width:2px
```

---

## ✨ Core Features & Pages

The application is structured around a comprehensive suite of supply chain and enterprise resources modules:

*   **📊 Unified Dashboard:** Dynamic visualization of core operations. Real-time notifications via WebSockets, critical stock alerts, active orders overview, and recent warehouse transfers.
*   **📦 Inventory Control:** Complete stock tracking including detailed item states, batch/lot tracking, minimum threshold indicators, and instantaneous QR code scans for rapid inbound/outbound adjustments.
*   **🏷️ Product Catalog:** Management of universal items, SKU definitions, category hierarchies, units of measurement, and detailed technical specifications.
*   **🏢 Multi-Warehouse Management:** Tracking across physical facilities. Supports warehouse capacities, coordinates, occupancy levels, and structural bin locations.
*   **🧾 Order Orchestration:** Purchase orders (supplier intake) and Sales orders (customer fulfillment) with a full status lifecycle (Draft, Pending, Approved, Shipped, Delivered, Cancelled).
*   **🔄 Stock Transfers:** Multi-step inter-warehouse stock movement with tracking for dispatch, transit, receipt validation, and automatic inventory reconciliations.
*   **🚚 Delivery & Logistics:** Shipment dispatch management, tracking, carrier assignments, delivery routes, and driver details.
*   **🤝 Vendor Relations:** Supplier profiles, lead time tracking, performance metrics, and inventory sourcing relationships.
*   **📈 Intelligent Analytics:** Deep analytical charts showing stock velocity, sales trends, warehouse distribution patterns, and financial evaluations using Recharts and Chart.js.

---

## 🛠️ Technology Stack

### Frontend (`/client`)
*   **Core Framework:** React 19 (Vite-powered, high performance)
*   **State Management:** Redux Toolkit & React-Redux (Global app & auth state)
*   **Data Fetching:** TanStack React Query (Server-state caching, automatic refetching)
*   **UI Library:** Material UI v7 & Emotion (Premium responsive layouts, sleek design tokens)
*   **Animations:** Framer Motion (Smooth page transitions & feedback micro-animations)
*   **Visualization:** Recharts & Chart.js (Interactive business intelligence graphs)
*   **Scanning Utility:** HTML5 QR Code (Native browser barcode/QR scanning integration)

### Backend (`/server`)
*   **Runtime:** Node.js (Vite environment friendly)
*   **Web Server:** Express (Robust, modular middleware-driven routing)
*   **Database Access:** Prisma ORM (Type-safe client, PostgreSQL)
*   **Caching & Queue:** Redis via `ioredis` (Session, database cache, rate limit buffer)
*   **Real-time Layer:** Socket.IO (Event-driven instant server-to-client updates)
*   **Security:** Helmet, CORS, Express-Rate-Limit, BCryptJS
*   **Notifications:** Nodemailer (Automatic transaction email notifications)
*   **Logging:** Winston (Configured for structured, multi-transport console & file logging)
*   **Testing:** Jest (High coverage unit and integration test suite)

---

## 📁 Repository Structure

```text
Supplychain/
├── client/                 # React Frontend Application
│   ├── src/
│   │   ├── components/     # Shared, reusable UI components (Alerts, Tables, Inputs)
│   │   ├── pages/          # Core page views (Dashboard, Warehouses, Inventory, etc.)
│   │   ├── redux/          # Redux slices and store configuration
│   │   ├── hooks/          # Custom React hooks (WebSockets, API integrations)
│   │   ├── services/       # Axios client and API query methods
│   │   └── theme/          # Custom Material UI theme design tokens
│   ├── package.json
│   └── vite.config.js
│
├── server/                 # Express Backend API
│   ├── src/
│   │   ├── config/         # Database, Redis, Keycloak, and environment loaders
│   │   ├── controllers/    # API Route controllers / Business execution
│   │   ├── middleware/     # Auth, validation, rate-limiting, and error handlers
│   │   ├── routes/         # Express Router modules (auth, delivery, product, etc.)
│   │   ├── services/       # Secondary backend logic (Notification, Auth providers)
│   │   ├── socket/         # Socket.IO connection and room managers
│   │   └── utils/          # Winston loggers, seeders, helpers
│   ├── prisma/             # Schema definitions and database migrations
│   ├── tests/              # Jest test cases
│   └── package.json
│
└── .gitignore              # Unified root-level version control instructions
```

---

## 🚀 Getting Started

### 📋 Prerequisites
Before you start, ensure you have the following installed on your machine:
*   **Node.js:** `>= 20.x` (Recommended: LTS)
*   **PostgreSQL Database:** `>= 16.x` (Instance must be running)
*   **Redis Server:** `>= 7.x` (Used for caching & real-time socket storage)

### 📥 1. Clone & Install Dependencies

From the root directory of the project, run:

```bash
# Install frontend client dependencies
cd client
npm install

# Install backend server dependencies
cd ../server
npm install
```

---

## ⚙️ Environment Configurations

Both the client and server expect specific environment configurations to run properly.

### 🔌 Server Environment Setup (`server/.env`)
Create a `.env` file in the `/server` directory. You can copy the template from `server/.env.example`:

```properties
# Server Basics
NODE_ENV=development
PORT=5000

# Database Connectivity (PostgreSQL Schema)
DATABASE_URL="postgresql://inventory_db:3127@localhost:5432/inventory_db?schema=public"

# Authentication Secrets
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRE=7d

# Cache Layer (Redis)
REDIS_HOST=localhost
REDIS_PORT=6379

# Transactional Email Server (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=example@gmail.com
SMTP_PASS=app-specific-smtp-password
ADMIN_EMAIL=admin@company.com

# Keycloak Identity Provider (Optional)
KEYCLOAK_URL=http://localhost:8080
KEYCLOAK_REALM=inventory-realm
KEYCLOAK_CLIENT_ID=inventory-client
KEYCLOAK_CLIENT_SECRET=your-client-secret

# Client Link (For CORS control)
CLIENT_URL=http://localhost:3000

# API Security Controls
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
LOG_LEVEL=info
```

### 💻 Client Environment Setup (`client/.env`)
Create a `.env` file in the `/client` directory:

```properties
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

---

## 🗄️ Database Initialization (Prisma)

Once your PostgreSQL database is running and your `DATABASE_URL` is configured inside `server/.env`, execute the following database commands within the `/server` directory:

```bash
# Generate the Prisma Client
npx prisma generate

# Run Prisma migrations to construct database tables
npx prisma migrate dev --name init

# (Optional) Seed the database with initial master data (products, warehouses, vendors)
npm run db:seed
```

If you ever need to reset and re-seed your database back to fresh defaults, run:
```bash
npm run db:reset
```

To view and manage the database contents interactively in your browser, run:
```bash
npx prisma studio
```

---

## ⚡ Running the Application

For local development, you will run both the frontend dev server and backend API server simultaneously.

### 🌐 Running the Backend API
In the `/server` directory, run:
```bash
# Starts Express backend API server with nodemon auto-restart
npm run dev
```

### 🎨 Running the Frontend UI
In the `/client` directory, run:
```bash
# Starts Vite development server
npm run dev
```
*Your browser will typically open to `http://localhost:3000` or `http://localhost:5173`.*

---

## 🧪 Testing, Linting & Formatting

Maintaining high-quality code is integral to this supply chain system. 

### Backend Tests
From the `/server` directory, you can run Jest unit and integration tests:
```bash
# Run all tests with code coverage output
npm run test

# Run tests in watch-mode (continuous testing during development)
npm run test:watch
```

### Formatting & Linting
Ensure code style consistency before submitting pull requests:
```bash
# Run ESLint validation checks
npm run lint

# Format code with Prettier formatting guidelines
npm run format
```

---

## 🛡️ License

This project is licensed under the **MIT License**. See the `LICENSE` file (if provided) for detail-oriented details.

---

*For technical questions, operational bottlenecks, or feature suggestions, please reach out to the logistics engineering lead or the repository administrator.*
