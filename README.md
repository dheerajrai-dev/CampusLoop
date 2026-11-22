# CampusLoop 🎓

> **Your campus. Your people. Your resources.**  
> A campus-restricted peer-to-peer resource and services exchange built for verified university communities.

---

## 🚀 Key Features

- **🎯 Request Board (Central Surface):** Post academic requests, task needs, equipment borrowing, or on-campus assistance. Receive peer offers, compare proposals, and atomically assign tasks.
- **📦 Campus Marketplace:** Offer, lend, give away, exchange, or sell items (calculators, textbooks, lab coats, hardware accessories) with designated public campus pickup spots.
- **🛠️ Student Services Directory:** Offer or discover peer tutoring (Python/DSA, Math), graphic design, deck polishing, Linux dual-boot setup, and bicycle maintenance.
- **🤝 Two-Sided Completion & Trust:** Transactions progress transparently (`Accepted` ➔ `In Progress` ➔ `Completed`). Both the requester and provider must confirm completion before reviews unlock.
- **⭐ Reputation & Trust Signals:** 1–5 star ratings, feedback comments, verified campus email badges, and community reporting.
- **🔒 Campus Isolation & Safety:** Content is strictly scoped to the student's campus. CampusLoop does not process or hold payments in MVP — students agree on terms directly in public campus meeting points.
- **✨ 1-Click Demo Evaluation Switcher:** Switch seamlessly between **Aarav (CS Junior / Requester)** and **Meera (Design Senior / Provider)** right from the navigation header.

---

## 🛠️ Tech Stack

### Backend
- **Python 3.12+ (tested on Python 3.14)**
- **FastAPI** with RESTful `/api/v1` routers
- **SQLAlchemy 2.0** ORM (SQLite zero-configuration local default + PostgreSQL production support via `psycopg3`)
- **Alembic** database migrations
- **Pydantic v2** schemas & request/response validation
- **PyJWT & bcrypt** password hashing and authentication
- **pytest & httpx** automated test suite

### Frontend
- **React 19 + TypeScript + Vite**
- **React Router v7**
- **TanStack Query v5**
- **React Hook Form + Zod**
- **Tailwind CSS v4**
- **Lucide React Icons**

---

## 🏁 Local Development Quick Start

### 1. Prerequisites
- Python 3.12+
- Node.js 18+ and npm

### 2. Backend Setup
```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows PowerShell:
.\venv\Scripts\Activate.ps1
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start backend development server
python -m uvicorn backend.app.main:app --reload --port 8000
```
- API Documentation (Swagger): [http://localhost:8000/docs](http://localhost:8000/docs)
- API Health Check: [http://localhost:8000/health](http://localhost:8000/health)

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Open your browser at [http://localhost:5173](http://localhost:5173).

---

## 🧪 Running Automated Tests

Run the complete test suite with `pytest`:
```bash
.\venv\Scripts\pytest -v
```
*Tests cover registration, login, token validation, campus domain verification, request & offer workflows, duplicate offer prevention, atomic acceptance, two-sided completion confirmation, and review validation.*

---

## 🚢 Production Deployment

CampusLoop supports multiple production deployment strategies:

### 1. ⚡ Vercel Full-Stack (Frontend + Python Backend Together)

Deploy both the React frontend and FastAPI backend to Vercel in a single project with **zero CORS configuration needed**:

1. Push your repository to GitHub or GitLab.
2. In the [Vercel Dashboard](https://vercel.com/new), click **Add New...** → **Project**.
3. Select this repository.
4. Leave **Framework Preset** as **Other** and **Root Directory** as `./` (Vercel automatically detects `vercel.json` and root `package.json`).
5. Under **Environment Variables**, set:
   - `JWT_SECRET`: Random 32+ character hex string (run `python -c "import secrets; print(secrets.token_hex(32))"`).
   - `ENVIRONMENT`: `production`
   - `AUTO_SEED`: `true`
   - `DATABASE_URL`: *(Recommended)* PostgreSQL connection string (e.g. from [Neon.tech](https://neon.tech), [Supabase](https://supabase.com), or Vercel Postgres). If omitted, falls back to `/tmp/campusloop.db` for ephemeral preview.
6. Click **Deploy**!

### 2. 🐳 All-in-One Docker Container (Render, Railway, Fly.io, Cloud Run, VPS)

A single multi-stage container that builds the React SPA and runs FastAPI with Uvicorn:
```bash
# Build image
docker build -t campusloop .

# Run with persistent storage
docker run -d \
  --name campusloop \
  -p 8000:8000 \
  -v campusloop_data:/app/data \
  -e ENVIRONMENT=production \
  -e JWT_SECRET=$(python -c "import secrets; print(secrets.token_hex(32))") \
  --restart unless-stopped \
  campusloop
```

### 3. 🐘 Production Docker Compose (PostgreSQL 16 + Nginx)

For self-hosted Linux servers or virtual private servers (VPS):
```bash
cp .env.example .env
# Edit .env with your POSTGRES_PASSWORD and JWT_SECRET
docker compose -f docker-compose.prod.yml up -d --build
```
Spins up:
- `db`: PostgreSQL 16 Alpine with persistent volume and healthchecks
- `backend`: FastAPI Python 3.12 service
- `frontend`: Hardened Nginx container with Gzip compression, asset caching, and SPA routing

### 4. 🚀 Render.com (1-Click Blueprint)

The repository includes a ready-to-use [`render.yaml`](render.yaml) specification:
1. In the [Render Dashboard](https://dashboard.render.com), click **New +** → **Blueprint**.
2. Connect this repository. Render automatically provisions the web service, creates a PostgreSQL database, generates secrets, and sets up health checks.

---

## ⚙️ Environment Variables Reference

| Variable | Required | Default | Description |
| :--- | :---: | :--- | :--- |
| `ENVIRONMENT` | No | `production` | Environment mode (`production` or `development`). |
| `AUTO_SEED` | No | `true` | Automatically seeds demo campus & sample listings if database is empty. |
| `DATABASE_URL` | Yes (Prod) | `sqlite:///./campusloop.db` | Database URL. Supports SQLite or PostgreSQL (`postgresql+psycopg://user:password@host:5432/dbname`). Automatically fixes legacy `postgres://` prefixes. |
| `JWT_SECRET` | **Yes (Prod)** | *dev key* | Cryptographic secret for signing auth tokens (min 32 chars). Generate with: `python -c "import secrets; print(secrets.token_hex(32))"` |
| `ALGORITHM` | No | `HS256` | JWT signature algorithm. |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | No | `1440` (24h) | Auth token session lifetime. |
| `PORT` | No | `8000` | HTTP port to listen on. Automatically bound to `$PORT` on Render/Railway/Fly/Heroku. |
| `HOST` | No | `0.0.0.0` | Network interface to bind. |
| `CORS_ORIGINS` | No | `http://localhost:5173,http://localhost:3000` | Comma-separated list of allowed origins. |
| `VITE_API_BASE_URL` | Optional | `/api/v1` | **Frontend build-time only**. Leave blank if frontend and backend share domain. |

---

## 🎬 3-Minute Demo Walkthrough

1. **Sign in as Aarav (Demo Requester):**
   - Click **Demo Switch** in the top navigation bar and select **Aarav Sharma**.
   - Notice Aarav's verified badge and active request: *"Need a 10-slide presentation polished by tomorrow"* with a ₹400 budget.
2. **Switch to Meera (Demo Provider):**
   - Click **Demo Switch** and select **Meera Patel**.
   - Navigate to the **Request Board** and open Aarav's presentation request.
   - Fill out the offer form: enter proposal message, proposed price (₹350), and availability note.
   - Click **Send Offer**. Notice your active pending offer appears.
3. **Switch back to Aarav (Requester):**
   - Click **Demo Switch** ➔ **Aarav Sharma**.
   - Open the request page. Meera's offer is now visible under **Submitted Offers**.
   - Click **Accept Offer**. The request changes to `Assigned` and you are directed to your **Activity** dashboard.
4. **Complete the Task & Exchange:**
   - On the **Activity** page, click **Mark In Progress**.
   - Click **Confirm Completion**. Notice that the task remains pending until Meera also confirms.
   - Switch to **Meera Patel**, visit **Activity**, and click **Confirm Completion**.
   - Both sides have now confirmed: status advances to `Completed`!
5. **Leave a Review:**
   - Click **Leave a Review** on the completed task.
   - Select 5 stars and submit feedback comment.
   - Visit Meera's public profile (`/profile/...`) to see the verified review and updated reputation score!
6. **Explore Marketplace & Services:**
   - Browse the **Marketplace** for textbooks, TI-84 calculators, lab coats, and cycle locks with designated campus pickup spots.
   - Browse **Services** to view student tutoring, Python debugging, and photography offerings.

---

## 🛡️ Trust & Campus Safety Guidelines

- Exchanges should **always take place in public campus areas** (library quads, cafeterias, student centers).
- CampusLoop MVP **does not hold or process escrow payments**. Students settle agreed compensation directly.
- Campus email allowlists verify genuine university students.
