# CampusLoop 🎓

> **Your campus. Your people. Your resources.**  
> A hyper-local, peer-to-peer resource and skill exchange platform engineered specifically for verified university student communities.

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React 19](https://img.shields.io/badge/Frontend-React%2019-61DAFB.svg?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6.svg?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind-CSS%20v4-38B2AC.svg?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Tests Passing](https://img.shields.io/badge/Tests-15%2F15%20Passed-brightgreen.svg?style=flat-square&logo=pytest&logoColor=white)](backend/tests/test_api.py)
[![Vercel Ready](https://img.shields.io/badge/Deployment-Vercel%20Full--Stack-black.svg?style=flat-square&logo=vercel&logoColor=white)](vercel.json)

---

## 🌟 Overview & Architecture

CampusLoop eliminates fragmented WhatsApp groups, notice boards, and unsafe public marketplaces by centralizing campus exchanges into a secure, university-scoped platform.

### Core Workflow Lifecycle

```
[Student Request] ──► [Peer Proposals/Offers] ──► [Atomic Acceptance]
                                                         │
                                                         ▼
[Public Profile & Rep] ◄── [Two-Sided Reviews] ◄── [Dual Confirmation (Requester & Provider)]
```

---

## 🚀 Key Features

- **🎯 Academic & Task Request Board (Central Surface):** Post urgent academic requests, task needs, equipment borrowing, or on-campus assistance. Receive peer offers, compare proposals with price quotes, and atomically accept assignments with concurrency locking.
- **📦 Campus Marketplace:** Buy, sell, lend, give away, or exchange items (textbooks, graphing calculators, lab coats, hardware accessories) with designated public campus pickup spots.
- **🛠️ Student Services Directory:** Peer tutoring (Python/DSA, Calculus, Stats), graphic design, presentation polishing, Linux dual-boot setup, and cycle maintenance.
- **🤝 Two-Sided Completion & Escrow Safety:** Transactions advance predictably (`Accepted` ➔ `In Progress` ➔ `Completed`). Both the requester and provider must independently confirm completion before reviews unlock.
- **⭐ Verified Reputation Engine:** 1–5 star ratings, feedback comments, verified university email badges, and community moderation reporting (`/api/v1/reports`).
- **🏫 University Customization & Flexibility:** Students can select from pre-seeded campuses or freely type their own university/institution during registration.
- **⚡ 1-Click Demo Evaluation Switcher:** Switch instantaneously between **Aarav (CS Junior / Requester)** and **Meera (Design Senior / Provider)** right from the navigation header, backed by a dedicated `/api/v1/auth/demo-login` endpoint.

---

## ⚡ Performance & Engineering Highlights

- **N+1 Query Elimination:** All list endpoints leverage eager SQL joins (`joinedload` and `selectinload`) to prevent recursive queries on foreign keys and relationships.
- **Database Indexing:** Indexed temporal fields (`created_at`) across `listings`, `requests`, `services`, and `transactions` to ensure sub-millisecond sorting and pagination without full-table scans.
- **Optimized Frontend Code Splitting:** Converted monolithic route imports to dynamic `React.lazy()` chunks with `<Suspense>`. The main JavaScript vendor bundle was slashed by **36%** (from **488 kB down to 312 kB / 95 kB gzip**).
- **Intelligent Query Caching:** Configured TanStack Query v5 with 60-second stale times and 10-minute cache retention to eliminate redundant background network fetches.
- **Accessible (a11y) & Responsive UI:** Fully responsive Flexbox & CSS Grid design adhering to WCAG standards with ARIA dialog roles (`role="dialog"`, `aria-modal`), keyboard navigation, and proper contrast ratios.

---

## 🛠️ Tech Stack

### Backend
- **Python 3.12+ (tested through Python 3.14)**
- **FastAPI** with structured `/api/v1` RESTful routers
- **SQLAlchemy 2.0** ORM (SQLite zero-configuration local default + PostgreSQL production support via `psycopg3`)
- **Alembic** database migrations
- **Pydantic v2** schemas & request/response validation
- **PyJWT & bcrypt** password hashing and stateless authentication
- **pytest & httpx** automated test suite (15/15 tests passing)

### Frontend
- **React 19 + TypeScript + Vite**
- **React Router v7** (code-split route boundaries)
- **TanStack Query v5** (server state & caching)
- **React Hook Form + Zod** (type-safe validation)
- **Tailwind CSS v4** (modern utility-first styling)
- **Lucide React Icons**

---

## 📂 Project Structure

```
CampusLoop/
├── api/                        # Vercel Serverless Function entry point
│   └── index.py                # Mounts FastAPI application for Vercel
├── backend/
│   ├── app/
│   │   ├── api/v1/             # Modular REST routers (auth, requests, listings, services, etc.)
│   │   ├── core/               # App configuration, security, JWT dependencies
│   │   ├── db/                 # Database engine & session management
│   │   ├── models/             # SQLAlchemy ORM database models
│   │   └── schemas/            # Pydantic v2 data transfer schemas
│   ├── tests/                  # Pytest automated test suite (15 tests)
│   └── requirements.txt        # Production Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/         # Reusable UI components (Navbar, Modal, Footer, etc.)
│   │   ├── context/            # React context providers (AuthContext)
│   │   ├── features/           # Domain feature pages (explore, requests, marketplace, services)
│   │   ├── services/           # Axios HTTP client & API service layer
│   │   └── types/              # TypeScript interfaces and domain models
│   ├── package.json
│   └── vite.config.ts
├── vercel.json                 # Vercel deployment configuration & route rewrites
├── pyproject.toml              # Pytest configuration
└── README.md
```

---

## 🏁 Local Development Quick Start

### 1. Prerequisites
- **Python 3.12+**
- **Node.js 18+** and **npm**

### 2. Backend Setup
```bash
# 1. Clone repository
git clone https://github.com/dheerajrai-dev/CampusLoop.git
cd CampusLoop

# 2. Create virtual environment
python -m venv venv

# 3. Activate virtual environment
# Windows PowerShell:
.\venv\Scripts\Activate.ps1
# macOS/Linux:
source venv/bin/activate

# 4. Install dependencies
pip install -r backend/requirements.txt

# 5. Start FastAPI development server
python -m uvicorn backend.app.main:app --reload --port 8000
```
- Interactive Swagger API Docs: [http://localhost:8000/docs](http://localhost:8000/docs)
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

Run the complete 15-test automated test suite using `pytest`:
```bash
.\venv\Scripts\pytest -v
```

### Test Coverage Highlights:
- ✅ Health check & campus directory listing
- ✅ Multi-campus and custom typed university registration
- ✅ Demo user one-click login endpoint (`/api/v1/auth/demo-login`)
- ✅ Password recovery and security verification
- ✅ End-to-end request creation, offer submission, and concurrent duplicate offer guards
- ✅ Atomic offer acceptance & auto-generation of transactions
- ✅ Two-sided completion confirmation protocol
- ✅ Verified review submission & reputation updating
- ✅ Explore feed multi-faceted filtering (search, campus, price range)
- ✅ Community moderation report creation (`/api/v1/reports`)

---

## 🚢 Production Deployment (Vercel Full-Stack)

CampusLoop is configured for seamless deployment on **Vercel** as a unified full-stack application (React SPA + FastAPI serverless runtime):

1. Fork or push this repository to GitHub.
2. In the [Vercel Dashboard](https://vercel.com/new), import your repository.
3. Configure **Environment Variables**:
   - `JWT_SECRET`: Random 32+ character hex string (e.g. run `python -c "import secrets; print(secrets.token_hex(32))"`).
   - `ENVIRONMENT`: `production`
   - `AUTO_SEED`: `true` (automatically initializes verified demo accounts and sample listings on first run).
   - `DATABASE_URL`: *(Recommended)* Managed PostgreSQL connection string (from [Neon](https://neon.tech), [Supabase](https://supabase.com), or Vercel Postgres). If omitted, falls back to `/tmp/campusloop.db` for ephemeral preview deployments.
4. Click **Deploy**!

### Routing on Vercel:
- **`/*`** ➔ React Single Page Application (Vite static build)
- **`/api/*`** ➔ FastAPI backend serverless handler (`api/index.py`)
- **`/docs`** ➔ OpenAPI Interactive documentation
- **`/health`** ➔ Service health status check

---

## ⚙️ Environment Variables Reference

| Variable | Required | Default | Description |
| :--- | :---: | :--- | :--- |
| `ENVIRONMENT` | No | `production` | Environment mode (`production` or `development`). |
| `AUTO_SEED` | No | `true` | Automatically seeds demo campus & sample listings if database is empty. |
| `DATABASE_URL` | Optional (Prod) | `sqlite:///./campusloop.db` | Database connection string. Supports SQLite and PostgreSQL (`postgresql+psycopg://...`). |
| `JWT_SECRET` | **Yes (Prod)** | *dev key* | Cryptographic secret for signing auth tokens (min 32 chars). |
| `ALGORITHM` | No | `HS256` | JWT signature algorithm. |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | No | `1440` (24h) | Auth token session lifetime. |
| `PORT` | No | `8000` | HTTP port to listen on. |
| `CORS_ORIGINS` | No | `*` (or comma-separated) | Allowed CORS origins for external client calls. |

---

## 🎬 3-Minute Demo Walkthrough

1. **Sign in as Aarav (Demo Requester):**
   - Click **Demo Switch** in the navigation bar and select **Aarav Sharma**.
   - Review Aarav's verified badge and active request: *"Need a 10-slide presentation polished by tomorrow"* with a ₹400 budget.
2. **Switch to Meera (Demo Provider):**
   - Click **Demo Switch** and select **Meera Patel**.
   - Navigate to the **Request Board** and open Aarav's presentation request.
   - Fill out the offer form: proposal message, proposed price (₹350), and availability note.
   - Click **Send Offer**.
3. **Switch back to Aarav (Requester):**
   - Click **Demo Switch** ➔ **Aarav Sharma**.
   - Open the request page. Meera's offer is visible under **Submitted Offers**.
   - Click **Accept Offer**. The request changes to `Assigned` and you are directed to your **Activity** dashboard.
4. **Complete the Task & Exchange:**
   - On the **Activity** page, click **Mark In Progress**.
   - Click **Confirm Completion**. The task remains pending until Meera also confirms.
   - Switch to **Meera Patel**, visit **Activity**, and click **Confirm Completion**.
   - Both sides have now confirmed: status advances to `Completed`!
5. **Leave a Review:**
   - Click **Leave a Review** on the completed task.
   - Select 5 stars and submit feedback comment.
   - Visit Meera's public profile (`/profile/...`) to see the verified review and updated reputation score!

---

## 🛡️ Trust & Safety Philosophy

- **Public Campus Zones:** All physical exchanges should occur in designated, well-lit campus spaces (libraries, quads, student centers).
- **No Escrow Overhead:** In MVP, CampusLoop does not process, hold, or take fees from student funds. Terms are agreed transparently in-app, and students settle directly.
- **Community Moderation:** Any student can flag questionable content or users with the built-in report system (`/api/v1/reports`).

---

## 📄 License

Distributed under the MIT License. See [LICENSE](LICENSE) for details.
