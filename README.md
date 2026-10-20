# LuminaAI — Municipal Smart Street Lighting & Adaptive Energy Automation

An enterprise-grade, IoT-driven intelligent street lighting surveillance and adaptive illumination management platform engineered for municipal corporations and smart city authorities. LuminaAI continuously optimizes urban power consumption, pinpoints multi-tier electrical anomalies in real time, and dynamically controls zonal illuminance based on predictive traffic models and environmental telemetry.

---

## 1. Executive Summary

Urban municipal lighting infrastructure routinely accounts for up to 40% of total municipal electricity expenditures. LuminaAI bridges legacy municipal street lighting grids with next-generation IoT edge micro-controllers, time-series telemetry pipelines, and cloud-hosted supervisory dashboards.

### Core Architecture Principles
* **100% Dynamic Live Database Telemetry**: Zero static mock data or pre-baked client pages. All pages, telemetry cards, zonal maps, analytical trends, and simulation triggers communicate strictly with the live Neon PostgreSQL database in real time.
* **Bi-Directional Database Mutations**: All operations—including administrative brightness adjustments, simulated radar surges, fault injections, and maintenance ticket resolutions—execute live SQL transactions against PostgreSQL and update the system state instantly.
* **Predictive Illumination Adjustment**: Ridge regression machine learning models adjust fixture lumens ahead of traffic surges, switching from baseline 20% security lighting to 55-65% during projected rush hours and up to 100% on reactive radar triggers.
* **Hierarchical Fault Pinpointing**: 3-tier fault engine isolates failures across Master Gateways (Zone), Mini-Clusters (ESP-NOW mesh), and individual Pole Nodes (LED drivers and power supplies).
* **Zero-API-Key Geospatial Surveillance**: Interactive GIS cartography rendered directly with OpenStreetMap and Leaflet without reliance on billable third-party map APIs.
* **Unified Role-Based Governance**: Dedicated operational views for Administrative Commissioners, Central Grid Operators, and Field Technicians with automated work-order generation.

---

## 2. System Architecture

```
+-----------------------------------------------------------------------------------+
|                        LuminaAI Dynamic Municipal Console                         |
|     (Zero Static Mock Data • Live State Synchronized with PostgreSQL via REST)    |
+-----------------------------------------------------------------------------------+
                                         ^
                                         | Dynamic JSON Telemetry & Live Mutations
                                         v
+-----------------------------------------------------------------------------------+
|                    Express API Server / Vercel Serverless Function                |
|      (REST Endpoints: /api/poles, /api/telemetry, /api/demo, /api/alerts, /api/*) |
+-----------------------------------------------------------------------------------+
                                         ^
                                         | Real-Time Queries & Mutations (SSL Pool)
                                         v
+---------------------------------------+ +---------------------------------------+
|        Neon Serverless PostgreSQL     | |           Edge AI Engine              |
|        (Poles Table, Telemetry Logs,  | | (Scikit-Learn Ridge Model Weights     |
|         Active Alerts, Audit Trails)  | |  + Embedded C Header edge_model.h)    |
+---------------------------------------+ +---------------------------------------+
```

---

## 3. Repository Structure

```
├── .env.example              # Template configuration for environment variables
├── .gitignore                # Production ignore definitions (protecting secrets and caches)
├── DEPLOYMENT.md             # Comprehensive Vercel and Neon cloud deployment manual
├── README.md                 # System overview and operational reference
├── docker-compose.yml        # Local multi-service container orchestration
├── vercel.json               # Monorepo serverless routing configuration
│
├── ai_model/                 # Edge AI & ML training pipeline
│   ├── README.md             # Model evaluation metrics and algorithm specification
│   ├── edge_model.h          # C header for microcontrollers (ESP32 / ARM Cortex)
│   ├── traffic_model_weights.json # Serialized Ridge regression coefficients
│   └── train_traffic_model.py     # Python model trainer on 48,000+ UCI traffic records
│
├── api/                      # Cloud serverless bridge
│   └── index.js              # Express serverless handler for Vercel deployment
│
├── backend/                  # RESTful API Server
│   ├── Dockerfile            # Container definition for standalone backend deployment
│   ├── config/               # Environment resolution and configuration loader
│   ├── controllers/          # Dynamic business logic handlers for assets, telemetry, and alerts
│   ├── middleware/           # JWT authentication and schema validation middleware
│   ├── routes/               # Declarative Express routing endpoints
│   ├── services/             # AI inference, anomaly detection, and audit engines
│   └── server.js             # HTTP application initialization
│
├── database/                 # Relational Data Schemas & Migrations
│   ├── db.js                 # PostgreSQL connection pool with SSL handling
│   ├── init.sql              # Core schema definitions and spatial extensions
│   ├── schema.sql            # Table structures for poles, telemetry, alerts, and officers
│   ├── seed.sql              # Seed data for municipal asset validation
│   ├── seed_lucknow.sql      # Lucknow City municipal corridors and coordinate assets
│   ├── views.sql             # Materialized analytical views and aggregate metrics
│   ├── queries.sql           # Verified query library for telemetry aggregations
│   └── migrate.js            # Node schema migration runner
│
└── frontend/                 # Dynamic Municipal Surveillance Console
    ├── Dockerfile            # Production container build (Nginx reverse-proxy)
    ├── nginx.conf            # Reverse-proxy forwarding /api requests to backend
    ├── index.html            # Dynamic single-page application entry point
    ├── vite.config.js        # Vite bundler configuration
    ├── tailwind.config.js    # Design system typography and color palette tokens
    └── src/
        ├── App.jsx           # Root route coordinator and layout wrapper
        ├── context/          # Dynamic state management (LightingContext, AuthContext)
        ├── services/         # Axios/Fetch API clients communicating with live PostgreSQL
        ├── components/       # Dynamic UI widgets, energy charts, live tables, and GIS maps
        └── pages/            # Viewports (Dashboard, Analytics, Maintenance, Records, Demo)
```

---

## 4. Key Functional Capabilities

### A. Dynamic Geospatial Surveillance
* Real-time geospatial rendering of street lighting fixtures across Lucknow Municipal Corporation zones (Hazratganj, Gomti Nagar, Alambagh, Chowk Heritage, Indira Nagar, and Charbagh).
* Fixtures and mini-clusters reflect real-time telemetry straight from PostgreSQL: Active (Green), Dimmed (Cyan), Faulty (Red), Offline (Slate).
* Inspecting a pole pulls live electrical parameters: instant wattage, current draw, lifetime kWh, radar motion flag, and coordinates.

### B. Machine Learning Illuminance Optimization
* Implements cyclical diurnal harmonic encoding ($\sin, \cos$) to adapt base brightness relative to projected traffic volumes.
* Adheres to standard IRC:SP:72 security minimums (20% lumen floor during low-occupancy night windows).
* Automatically enforces zero-lumen daytime cutoffs when ambient illumination reaches $\ge 50.0\text{ lx}$.

### C. Predictive Maintenance & Automated Work Orders
* Automatically creates high-priority work orders when telemetry confirms zero current under active drive commands.
* Tracks technician assignment, SLA resolution intervals, and maintenance records persisted in the database.

### D. 100% Dynamic Simulation & Live Database Mutation Lab
* The `/demo` simulation environment contains **no client-side mock storage or static dummy data**.
* Triggering a synthetic event (e.g., bulb burnout, driver failure, high-temperature overheating, or corridor radar traffic surges) dispatches live HTTP POST requests to `/api/demo/*`.
* The serverless backend executes SQL transactions (`UPDATE poles ...`, inserting alert records, logging audit events) directly against the active Neon PostgreSQL database.
* The frontend immediately synchronizes with the updated database state via `refreshFromBackend()`, guaranteeing strict end-to-end data fidelity across all connected clients.

---

## 5. Technology Stack

* **Frontend**: React 18, Vite 5, Tailwind CSS 3, Lucide React, Leaflet 1.9 (Fully dynamic; zero mock data)
* **Backend**: Node.js 18+, Express 4, Node-Postgres (`pg` connection pool with SSL)
* **Database**: PostgreSQL 15+ / Neon Serverless Postgres with Connection Pooling
* **Machine Learning**: Python 3.10+, Scikit-Learn, NumPy, Pandas
* **Deployment Architecture**: Full-Stack Dynamic Serverless Application on Vercel (Dynamic Frontend + Express Serverless API + Neon Serverless PostgreSQL) or Multi-Container Docker Compose

---

## 6. Local Setup and Development

### Prerequisites
* Node.js version 18.x or later
* npm version 9.x or later
* PostgreSQL database instance (or a Neon Cloud connection string)

### Step 1: Clone and Configure Environment
Copy the example environment configuration:
```bash
cp .env.example .env.local
```

Populate your live database connection string in `.env.local`:
```ini
DATABASE_URL=postgresql://user:password@host/neondb?sslmode=require
PORT=5000
NODE_ENV=development
```

### Step 2: Install Backend and Frontend Dependencies
```bash
# Install root orchestration dependencies
npm install

# Install backend dependencies
cd backend && npm install && cd ..

# Install frontend dependencies
cd frontend && npm install && cd ..
```

### Step 3: Run the Application Locally
In two separate terminals:

```bash
# Terminal 1: Launch Backend API Server (Port 5000)
cd backend
npm run dev
```

```bash
# Terminal 2: Launch Frontend Development Server (Port 5173)
cd frontend
npm run dev
```

Visit `http://localhost:5173` to interact with the live dynamic surveillance console.

---

## 7. Cloud Deployment (Vercel)

LuminaAI is engineered as a unified dynamic full-stack application on Vercel:

1. Push this repository to GitHub or GitLab.
2. In the Vercel Dashboard, select **Add New Project** and import the repository.
3. Configure the following Environment Variables in the project settings:
   * `DATABASE_URL`: Your pooled Neon connection string (`sslmode=require`).
   * `NODE_ENV`: `production`
4. Click **Deploy**. Vercel will host the dynamic frontend UI via `frontend/vercel.json` and route all dynamic `/api/*` telemetry and mutation requests through the Express serverless backend in `api/index.js`, connected directly to your Neon PostgreSQL instance.

For in-depth operational procedures, consult [`DEPLOYMENT.md`](file:///f:/Projects/Street%20Lighting%20Using%20Ai/DEPLOYMENT.md).

---

## 8. License & Governance

Developed under the standards and guidelines of the Smart Cities Mission and the Directorate of Urban Local Bodies (DULB). All municipal telemetry protocols conform to IRC:SP:72 guidelines for urban energy conservation.
