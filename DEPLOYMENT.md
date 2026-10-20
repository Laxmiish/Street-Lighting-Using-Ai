# LuminaAI Smart Street Lighting Platform - Deployment Guide

This guide provides step-by-step instructions for deploying the LuminaAI platform across different environments:

1. **Option 1: Vercel Deployment (Full-Stack Monorepo or Frontend-Only)** - Deploy directly to Vercel with serverless functions and free cloud database (Neon/Supabase).
2. **Option 2: Docker Compose (Self-Hosted / VPS)** - Complete containerized stack on any VPS, cloud instance, or local environment.
3. **Option 3: Decoupled Cloud PaaS** - Frontend on Vercel/Netlify, Backend on Render/Railway, Database on Supabase/Neon.
4. **Option 4: Linux VM (Ubuntu/Debian)** - Production deployment using Nginx reverse proxy, PM2 process manager, and native PostgreSQL.

---

## Architecture Overview

- **Frontend**: Vite React 18 SPA with Leaflet maps (OpenStreetMap, no API keys required), served via Nginx.
- **Backend**: Node.js Express REST API with Ridge regression AI dimming algorithms.
- **Database**: PostgreSQL 16 with TimescaleDB hypertable extension, initialized with Lucknow Municipal Corporation spatial seeds.

---

## Option 1: Vercel Deployment

You can deploy LuminaAI to Vercel using either of two workflows:
- **Method A: Full-Stack Monorepo on Vercel (Recommended)**: Serves both the React SPA and the Express backend as serverless functions on a single Vercel domain with zero CORS issues.
- **Method B: Frontend-Only on Vercel**: Deploys only the UI to Vercel, pointing to an external backend (e.g., Render/Railway).

### Method A: Full-Stack Monorepo on Vercel (1-Project)

#### Step 1: Provision a Free Cloud PostgreSQL Database
Since Vercel is serverless, you need a cloud-hosted PostgreSQL database:
1. Create a free database at [Neon.tech](https://neon.tech) or [Supabase.com](https://supabase.com).
2. In the cloud dashboard SQL Editor, execute:
   - First: [`database/init.sql`](database/init.sql)
   - Second: [`database/seed.sql`](database/seed.sql)
3. Copy your pooled connection URI: `postgresql://user:password@host:5432/dbname?sslmode=require`

#### Step 2: Import into Vercel
1. Push your repository to GitHub / GitLab / Bitbucket.
2. In the [Vercel Dashboard](https://vercel.com/dashboard), click **Add New** -> **Project** -> **Import**.
3. Keep the **Root Directory** as `./` (default).
4. Vercel automatically detects the root [`vercel.json`](vercel.json) and [`package.json`](package.json).
5. Under **Environment Variables**, add:
   - `DATABASE_URL`: Your Neon or Supabase connection string.
   - `NODE_ENV`: `production`
6. Click **Deploy**.

#### How It Works:
- Root [`vercel.json`](vercel.json) runs `npm run build`, generating static frontend assets into `frontend/dist`.
- Any request to `/api/*` is routed directly to the serverless function [`api/index.js`](api/index.js) which executes the Express app.
- All non-API routes fallback to `index.html` for React Router SPA navigation.

---

### Method B: Frontend-Only on Vercel

If you already run the backend separately (e.g. on Render, Railway, or AWS):
1. In Vercel, set **Root Directory** to `frontend`.
2. Framework Preset: `Vite`.
3. Build Command: `npm run build`.
4. Output Directory: `dist`.
5. Under **Environment Variables**, add:
   - `VITE_API_URL`: `https://your-backend.onrender.com` (without trailing slash).
6. Click **Deploy**.
7. The included [`frontend/vercel.json`](frontend/vercel.json) automatically handles SPA routes (e.g. `/admin`, `/records`) to prevent 404 errors on browser page reloads.

---

## Option 2: Docker Compose Deployment (1-Command)

The fastest and most consistent way to deploy the entire stack.

### Prerequisites
- Docker Engine 24.0+ and Docker Compose v2 installed.

### Steps

1. **Clone the repository and enter directory**:
   ```bash
   git clone <your-repository-url>
   cd "Street Lighting Using Ai"
   ```

2. **Configure environment variables (optional)**:
   Create a `.env` file in the root if you wish to override default credentials:
   ```env
   DB_USER=postgres
   DB_PASSWORD=postgres123
   DB_NAME=street_lighting_db
   ```

3. **Build and launch all services**:
   ```bash
   docker compose up -d --build
   ```

4. **Verify running containers**:
   ```bash
   docker compose ps
   ```

   You will see three healthy services:
   - `street_lighting_db`: TimescaleDB listening on `5432` with auto-initialized Lucknow schema and telemetry data.
   - `street_lighting_backend`: Express API running on port `5000`.
   - `street_lighting_frontend`: Nginx serving static assets and proxying `/api/*` requests on port `80` and `3000`.

5. **Access the application**:
   - Web Platform: `http://localhost` or `http://<your-server-ip>`
   - Direct API Health Check: `http://<your-server-ip>:5000/api/health`

6. **To stop or restart**:
   ```bash
   # Stop services
   docker compose down

   # View real-time logs
   docker compose logs -f backend
   ```

---

## Option 2: Decoupled Cloud PaaS Deployment

Ideal for cloud hosting without managing virtual machine infrastructure.

### 1. Database (Neon or Supabase)
1. Create a free PostgreSQL project on [Neon](https://neon.tech) or [Supabase](https://supabase.com).
2. Open the SQL Editor in your cloud database dashboard.
3. Run the schema script: [`database/init.sql`](database/init.sql).
4. Run the Lucknow city seed script: [`database/seed.sql`](database/seed.sql).
5. Copy your connection URI (`postgresql://user:pass@host:5432/dbname?sslmode=require`).

### 2. Backend (Render or Railway)
1. Connect your repository to [Render](https://render.com) or [Railway](https://railway.app).
2. Set the Root Directory to `backend`.
3. Set Build Command: `npm install`
4. Set Start Command: `node server.js`
5. Configure Environment Variables:
   - `DATABASE_URL`: Your Supabase/Neon connection URI with SSL.
   - `NODE_ENV`: `production`
   - `PORT`: `5000` (or leave default for Render)
   - `CORS_ORIGIN`: `*` (or your frontend domain)
6. Deploy and note your backend URL (e.g., `https://lumina-backend.onrender.com`).

### 3. Frontend (Vercel or Netlify)
1. Connect your repository to [Vercel](https://vercel.com) or [Netlify](https://netlify.com).
2. Set Root Directory to `frontend`.
3. Framework Preset: `Vite`.
4. Build Command: `npm run build`
5. Output Directory: `dist`
6. Add Environment Variable:
   - `VITE_API_URL`: `https://lumina-backend.onrender.com` (your backend URL without trailing slash).
7. Deploy. Vercel/Netlify will automatically serve the React SPA and direct all API queries to your cloud backend.

---

## Option 3: Traditional Linux VM (Ubuntu + PM2 + Nginx)

For dedicated Ubuntu 22.04 / 24.04 VPS servers (AWS EC2, DigitalOcean, Hetzner, Linode).

### 1. Install Node.js, PostgreSQL, and Nginx
```bash
sudo apt update && sudo apt install -y curl git nginx postgresql postgresql-contrib
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2
```

### 2. Setup Database
```bash
sudo -u postgres psql -c "CREATE USER smartcity WITH PASSWORD 'SecurePassword123';"
sudo -u postgres psql -c "CREATE DATABASE street_lighting_db OWNER smartcity;"
sudo -u postgres psql -d street_lighting_db -f database/init.sql
sudo -u postgres psql -d street_lighting_db -f database/seed.sql
```

### 3. Deploy Backend with PM2
```bash
cd backend
npm ci --only=production

# Configure .env
cat <<EOF > .env
PORT=5000
NODE_ENV=production
DATABASE_URL=postgresql://smartcity:SecurePassword123@localhost:5432/street_lighting_db
CORS_ORIGIN=*
EOF

# Start with PM2
pm2 start server.js --name "lumina-backend"
pm2 save
pm2 startup
```

### 4. Build and Configure Frontend with Nginx
```bash
cd ../frontend
npm ci
npm run build

# Deploy files to /var/www/lumina
sudo mkdir -p /var/www/lumina
sudo cp -r dist/* /var/www/lumina/

# Configure Nginx site
sudo nano /etc/nginx/sites-available/lumina
```

Paste the following Nginx virtual host configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com; # or server IP

    root /var/www/lumina;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://localhost:5000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable site and restart Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/lumina /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
```

---

## Verification & Post-Deployment Checklist

1. **System Health Check**:
   ```bash
   curl http://localhost/api/health
   # Expected response: {"status":"healthy","database":"connected",...}
   ```
2. **Poles & Telemetry Verification**:
   ```bash
   curl http://localhost/api/poles
   # Expected response: JSON list of 25 Lucknow City poles
   ```
3. **Map Display**: Open your browser at `http://your-server-ip/admin` or `http://your-server-ip/dashboard` to verify that the OpenStreetMap canonical tiles render without API keys.
4. **AI Adaptation Test**: Navigate to the Simulation page or trigger `/api/ai/predict` to verify real-time dimming calculations.
