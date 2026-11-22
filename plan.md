# CampusLoop — Architecture Plan & Implementation Roadmap

## 1. Technology Stack & Conventions

### Backend
- **Language / Runtime:** Python 3.14 with virtual environment (`venv`)
- **Framework:** FastAPI
- **Database ORM:** SQLAlchemy 2.0 (PostgreSQL production-ready, SQLite zero-friction local fallback)
- **Migrations:** Alembic
- **Validation & Serialization:** Pydantic v2 & `pydantic-settings`
- **Authentication:** JWT (HMAC-SHA256) + direct `bcrypt` hashing
- **Testing:** pytest + httpx `TestClient`

### Frontend
- **Framework:** React 19 + TypeScript + Vite
- **Routing:** React Router v7
- **Server State & Cache:** TanStack Query v5
- **Form Management:** React Hook Form + Zod
- **Styling:** Tailwind CSS with custom community color scheme
- **Icons:** Lucide React

---

## 2. Project Directory Tree

```text
CampusLoop/
├── venv/                       # Python virtual environment (ignored in git)
├── .env.example                # Sample environment variables
├── .env                        # Local backend environment configuration
├── .gitignore                  # Git ignore rules for Python, Node, db, secrets
├── requirements.txt            # Backend dependencies
├── plan.md                     # This plan
├── backend/
│   ├── app/
│   │   ├── main.py             # FastAPI entrypoint, middleware, CORS
│   │   ├── core/
│   │   │   ├── config.py       # Pydantic Settings
│   │   │   ├── security.py     # Password hashing & JWT token encode/decode
│   │   │   └── deps.py         # DB session & auth user FastAPI dependencies
│   │   ├── db/
│   │   │   ├── session.py      # SQLAlchemy engine and sessionmaker
│   │   │   ├── base.py         # Declarative Base
│   │   │   └── seed.py         # Realistic demo data seeder
│   │   ├── models/
│   │   │   ├── campus.py       # Campus & domain verification
│   │   │   ├── user.py         # Student user & profile
│   │   │   ├── listing.py      # Items for sell, lend, giveaway, exchange
│   │   │   ├── request.py      # Requests & offers
│   │   │   ├── service.py      # Student skill/service offerings
│   │   │   ├── transaction.py  # Accepted task/exchange status & confirmation
│   │   │   ├── review.py       # Ratings & reviews
│   │   │   └── moderation.py   # Reports and blocks
│   │   ├── schemas/            # Pydantic request & response models
│   │   │   ├── auth.py
│   │   │   ├── user.py
│   │   │   ├── listing.py
│   │   │   ├── request.py
│   │   │   ├── offer.py
│   │   │   ├── service.py
│   │   │   ├── transaction.py
│   │   │   └── review.py
│   │   ├── api/
│   │   │   └── v1/
│   │   │       ├── api.py      # Router aggregator
│   │   │       ├── auth.py     # Register, Login, Me
│   │   │       ├── users.py    # Public profiles & updates
│   │   │       ├── explore.py   # Aggregated feed, search & category filters
│   │   │       ├── listings.py # Marketplace items CRUD
│   │   │       ├── requests.py # Request Board & Offers management
│   │   │       ├── services.py # Student services CRUD
│   │   │       ├── transactions.py # State updates & 2-sided completion
│   │   │       └── reviews.py  # Reviews & ratings
│   │   └── services/           # Deterministic matching & business logic
│   └── tests/                  # Pytest test suites (auth, workflow, permissions)
├── frontend/
│   ├── src/
│   │   ├── app/                # Router, AuthContext, QueryProvider
│   │   ├── components/         # Common UI: Navbar, Footer, Badges, Modals, Empty/Loading
│   │   ├── features/
│   │   │   ├── auth/           # Login, Register, Campus selector
│   │   │   ├── explore/        # Campus Feed, Search, Filter chips
│   │   │   ├── requests/       # Request Board, Post Request, Offer list/submit
│   │   │   ├── listings/       # Marketplace, Item detail, Post Item
│   │   │   ├── services/       # Services directory, Service detail, Post Service
│   │   │   ├── activity/       # User transactions, submitted/received offers
│   │   │   └── profile/        # Student public profile, reviews, edit bio
│   │   ├── lib/
│   │   │   ├── api.ts          # Axios/fetch typed API client with JWT bearer
│   │   │   └── utils.ts
│   │   └── styles/             # Tailwind base styles
```

---

## 3. Database Model Outline

1. **campuses**: `id (UUID)`, `name`, `email_domain`, `city`, `created_at`
2. **users**: `id (UUID)`, `email`, `password_hash`, `full_name`, `campus_id (FK)`, `department`, `course`, `year_or_semester`, `avatar_url`, `bio`, `is_verified`, `created_at`
3. **listings**: `id (UUID)`, `owner_id (FK)`, `campus_id (FK)`, `title`, `description`, `category`, `listing_mode (sell, lend, giveaway, exchange)`, `price`, `condition`, `pickup_area`, `availability_status (available, reserved, unavailable, completed, archived)`, `created_at`
4. **listing_images**: `id (UUID)`, `listing_id (FK)`, `image_url`, `sort_order`
5. **requests**: `id (UUID)`, `requester_id (FK)`, `campus_id (FK)`, `title`, `description`, `category`, `request_type (item, academic_help, task, campus_help, other)`, `budget`, `preferred_arrangement (free, paid, exchange, any)`, `deadline`, `status (open, assigned, completed, cancelled, archived)`, `created_at`
6. **offers**: `id (UUID)`, `request_id (FK)`, `provider_id (FK)`, `message`, `proposed_price`, `availability_note`, `status (pending, accepted, rejected, withdrawn, completed, cancelled)`, `created_at`
7. **services**: `id (UUID)`, `provider_id (FK)`, `campus_id (FK)`, `title`, `description`, `category`, `tags`, `pricing_type (free, fixed, hourly, negotiable)`, `price`, `availability_note`, `status (active, paused, archived)`, `created_at`
8. **transactions**: `id (UUID)`, `request_id`, `listing_id`, `service_id`, `offer_id`, `requester_or_buyer_id (FK)`, `provider_or_owner_id (FK)`, `status (accepted, in_progress, completed, cancelled)`, `completion_confirmed_by_requester (bool)`, `completion_confirmed_by_provider (bool)`, `created_at`, `completed_at`
9. **reviews**: `id (UUID)`, `transaction_id (FK)`, `reviewer_id (FK)`, `reviewee_id (FK)`, `rating (1-5)`, `comment`, `created_at`
10. **reports & blocks**: report moderation flags and user block relations.

---

## 4. UI Route List

- `/` — Landing & Campus Introduction
- `/explore` — Unified Campus Feed (Tabs for Requests, Items, Services with live search & filters)
- `/requests` — Request Board
- `/requests/new` — Post a Request modal / form
- `/requests/:id` — Request Details & Offers (review offers if owner, submit offer if peer)
- `/marketplace` — Items Marketplace (Sell, Lend, Giveaway, Exchange)
- `/marketplace/new` — Post an Item
- `/marketplace/:id` — Item Detail & Connect
- `/services` — Campus Services Directory
- `/services/new` — Post a Service
- `/services/:id` — Service Detail
- `/activity` — My Tasks, Exchanges & Offers (status timeline, confirmation buttons)
- `/profile/:id` — Public Profile (badges, offerings, reviews)
- `/profile/edit` — Edit My Profile
- `/login` & `/register` — Authentication with Campus Selection & Demo Mode

---

## 5. Design System Specification

- **Brand Theme:** Warm, approachable, student-first community aesthetic.
- **Color Palette:**
  - Primary / Brand: Indigo/Emerald energetic campus tones (`emerald-600`, `indigo-600`)
  - Accent / Badges:
    - **Free / Giveaway:** Emerald badge (`bg-emerald-50 text-emerald-700 border-emerald-200`)
    - **Borrow / Lend:** Amber badge (`bg-amber-50 text-amber-700 border-amber-200`)
    - **Exchange:** Purple badge (`bg-purple-50 text-purple-700 border-purple-200`)
    - **Paid / Sell:** Blue badge (`bg-blue-50 text-blue-700 border-blue-200`)
  - Neutral Backgrounds: Cool gray / stone background (`bg-slate-50`), crisp white cards (`bg-white`) with subtle borders (`border-slate-200/80`) and refined soft shadows.
- **Typography:** Inter / system font with crisp contrast and explicit visual hierarchy.
- **Component Consistency:** Rounded corners (`rounded-xl` and `rounded-2xl`), accessible form controls, clear focus rings, and explicit status states.
