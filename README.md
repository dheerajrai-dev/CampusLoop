# CampusLoop 🎓

> **Your campus. Your people. Your resources.**  
> A campus-restricted peer-to-peer resource and services exchange built for verified university communities.

---

## 🚀 Features

- **🎯 Request Board (Central Surface):** Post academic requests, task needs, equipment borrowing, or on-campus assistance. Receive peer offers, compare proposals, and atomically assign tasks.
- **📦 Campus Marketplace:** Offer, lend, give away, exchange, or sell items (calculators, textbooks, lab coats, hardware accessories) with designated public campus pickup spots.
- **🛠️ Student Services Directory:** Offer or discover peer tutoring (Python/DSA, Math), graphic design, deck polishing, Linux dual-boot setup, and bicycle maintenance.
- **🤝 Two-Sided Completion & Trust:** Transactions progress transparently (`Accepted` ➔ `In Progress` ➔ `Completed`). Both the requester and provider must confirm completion before reviews unlock.
- **⭐ Reputation & Trust Signals:** 1–5 star ratings, feedback comments, verified campus email badges, and community reporting.
- **🔒 Campus Isolation & Safety:** Content is restricted to the student's campus. CampusLoop does not process or hold payments in MVP — students agree on terms directly in public campus meeting points.
- **✨ 1-Click Demo Evaluation Switcher:** Switch seamlessly between **Aarav (CS Junior / Requester)** and **Meera (Design Senior / Provider)** right from the navigation header.

---

## 🛠️ Tech Stack

### Backend
- **Python 3.12+ (tested on Python 3.14)**
- **FastAPI** with RESTful `/api/v1` routers
- **SQLAlchemy 2.0** ORM (SQLite zero-configuration local default + PostgreSQL production support)
- **Alembic** migrations
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

## 🏁 Quick Start Guide

### 1. Prerequisites
- Python 3.12+
- Node.js 18+ and npm

### 2. Backend Setup
1. Open terminal in the repository root:
   ```powershell
   # Create virtual environment (if not already created)
   python -m venv venv

   # Activate virtual environment
   # On Windows:
   .\venv\Scripts\Activate.ps1
   # On macOS/Linux:
   source venv/bin/activate

   # Install dependencies
   pip install -r requirements.txt
   ```
2. Configure `.env`:
   ```bash
   cp .env.example .env
   ```
3. Run the backend server:
   ```powershell
   python -m uvicorn backend.app.main:app --reload --port 8000
   ```
   *The database schema is automatically created and populated with realistic campus demo data on first startup.*
   - API Docs: [http://localhost:8000/docs](http://localhost:8000/docs)
   - API Root: [http://localhost:8000/api/v1](http://localhost:8000/api/v1)

### 3. Frontend Setup
1. Open a new terminal in the `frontend/` directory:
   ```powershell
   cd frontend
   npm install
   npm run dev
   ```
2. Open your browser at [http://localhost:5173](http://localhost:5173).

---

## 🧪 Running Automated Tests

Run backend tests using pytest from the project root:
```powershell
.\venv\Scripts\pytest
```
*Tests cover registration, login, token validation, campus domain verification, request & offer workflows, duplicate offer prevention, atomic acceptance, two-sided completion confirmation, and review validation.*

---

## 🎬 3-Minute Demo Walkthrough (PRD Section 18)

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
