# CampusLoop — Product Requirements & Implementation Guide

## 1. Product definition

**CampusLoop** is a campus-restricted peer-to-peer resource and services exchange. Students can offer, lend, give away, exchange, or sell items; post requests for things they need; and offer paid or free help to other students.

**Tagline:** Your campus. Your people. Your resources.

### Problem
Students often pay for resources that other students already own and no longer need. At the same time, students have skills and spare time but lack a convenient, trusted way to find small jobs within their campus community. Existing general marketplaces are not designed around campus identity, short-distance exchanges, borrowing, skill-sharing, or student-sized requests.

### Product promise
Help students save money, access useful resources, get help, and earn from their skills—all within a verified campus community.

### Product principles
- Campus-first: relevant listings and requests from the user's campus.
- Request-led: the Request Board is the primary discovery and interaction surface.
- Flexible exchange: free, borrow, exchange, and paid are first-class options.
- Trust and clarity: profiles, status, expectations, and completion are visible.
- Simple MVP: build a reliable core workflow before adding complex features.

## 2. Target users

1. **Requester:** needs an item, help, or a task completed.
2. **Provider:** offers an item, skill, service, or assistance.
3. **Both:** every student can switch between requesting and providing.

Examples: borrowing a calculator, finding a used textbook, requesting poster design, offering Python tutoring, getting help with a laptop setup, or asking someone to pick up printouts on campus.

## 3. MVP scope

### Must-have features

#### A. Account and campus identity
- Sign up, sign in, sign out.
- Student profile with name, campus, department/course, year/semester, avatar (optional), and short bio (optional).
- Campus membership is verified for MVP using an approved email domain allowlist. If no campus email domain is available, provide a clearly marked demo/admin verification flow for testing; do not imply verification is real.
- Users can edit their profile and view another student's public profile.


#### B. Explore / discovery
- Campus feed with tabs or filters for **Requests**, **Items**, and **Services**.
- Search by title and description.
- Filters: category, free/paid, item/service/request, newest, and price range where applicable.
- Listing cards show type, title, concise details, budget/price, status, creator, and time posted.


#### C. Resource marketplace
Students can post items as:
- Sell
- Lend
- Give away
- Exchange

Item fields: title, description, category, condition, exchange mode, price (if paid), images (optional, 1–4), availability, pickup location/meeting point (campus-level only; no exact private addresses), and status.


#### D. Request Board (central feature)
Students can request:
- An item/resource
- Academic or peer help
- A task/service
- Campus assistance
- Other needs

Request fields: title, description, category, request type, optional budget, deadline (optional), preferred arrangement (free/paid/exchange/any), and attachments (optional).

Other students can submit an **Offer** to fulfill a request. Offer fields: message, proposed price (optional), estimated completion/availability, and optional note. Requester can review offers and accept one. Acceptance creates a task/transaction record and marks the request as assigned. The requester may close/cancel the request.


#### E. Services and skill listings
Students can publish services they offer, such as tutoring, coding help, design, photography, editing, writing, device setup, or other lawful campus services.
Service fields: title, category, description, skills/tags, pricing type (free/fixed/hourly/negotiable), price (optional), availability (optional), and status.
A student can contact the provider or create an offer/request flow. Avoid a separate booking calendar in MVP.


#### F. Task / exchange status
For accepted offers, support a simple state progression:
- Requested / Offer pending
- Accepted / Assigned
- In progress (optional transition)
- Completed
- Cancelled

Both sides can confirm completion. Keep a clear history of the accepted offer and status changes.


#### G. Reviews and trust
- Reviews only after a completed task or exchange.
- Rating (1–5) and short comment.
- One review per user per completed transaction, with basic moderation/reporting.
- User can report a listing, request, offer, or profile.
- Block user (basic: blocked user content hidden from the blocker).

## 4. Out of scope for MVP

Do **not** implement these in the first version:
- Payment gateway, wallet, escrow, or automatic payout.
- AI chatbot or AI-generated financial advice.
- Complex recommendation model. Use transparent rule-based matching first.
- Delivery logistics, GPS tracking, or precise location sharing.
- Campus-wide admin console beyond minimal moderation tools.
- Multi-campus federation or external marketplace integrations.
- Calendar scheduling, video calls, or elaborate messaging system.
- Push notifications. In-app notification records are optional if time permits.

For paid work, users agree on payment directly and CampusLoop does not hold money. Clearly communicate this in the UI.

## 5. Primary user journeys

### Journey 1 — Post a need and receive offers
1. Student signs in and opens Request Board.
2. Selects “Post a request.”
3. Enters title, details, category, budget (optional), deadline (optional), and preferred arrangement.
4. Publishes request.
5. Other students browse and submit offers.
6. Requester compares offers and accepts one.
7. Request becomes Assigned; selected offer/task is created.
8. Parties coordinate and mark task complete.
9. Both sides can review each other.

### Journey 2 — Offer a service and find work
1. Student creates a service listing (e.g., Python tutoring, poster design).
2. Listing appears in campus Services feed.
3. Another student views the service and sends a request/message or uses the offer/request workflow.
4. Provider accepts and the work status is tracked.
5. Completion and reviews are recorded.

### Journey 3 — Sell, lend, give, or exchange an item
1. Student creates an item listing and chooses Sell, Lend, Give away, or Exchange.
2. Adds item details, condition, price (when relevant), and campus pickup point.
3. Interested student contacts/request arrangement.
4. Owner accepts; listing is reserved/assigned.
5. Item is handed over; both parties confirm completion.
6. Listing becomes Completed or unavailable.

### Journey 4 — Discover campus help
1. Student filters requests or services by category.
2. Finds a suitable listing.
3. Opens detail page and profile.
4. Submits an offer or request.
5. The other student accepts and the task is tracked.

## 6. Screens and navigation

Use a responsive web app, mobile-first but comfortable on desktop.

1. **Landing / Welcome** — short product explanation, sign in/sign up, campus selection/verification.
2. **Explore** — campus feed with Requests, Items, Services; search and filters.
3. **Request Board** — list of requests, request detail, create request, offers list and offer submission.
4. **Marketplace** — item listing cards, item detail, create/edit listing.
5. **Services** — student service cards, service detail, create/edit service.
6. **Create** — one clear creation menu for Request, Item, Service.
7. **Activity** — user's posted items/requests/services, received/sent offers, accepted tasks and status.
8. **Profile** — public student profile, offerings, completed exchanges/tasks, reviews; edit own profile.
9. **Notifications** (optional MVP) — new offer, offer accepted, status updated, review received.

Navigation should be simple: Explore, Requests, Create, Activity, Profile. Avoid a large admin-style dashboard or empty metric cards.

## 7. UX and visual direction

Create a polished, student-friendly community product, not a generic finance dashboard or corporate SaaS admin panel.
- Clear, warm, approachable visual language.
- Strong hierarchy and generous spacing; readable cards and typography.
- Distinct visual labels for Free, Paid, Borrow, Exchange, Sell, Give away.
- Request Board should feel active and central.
- Show realistic seed data so the app is not empty in demo mode.
- Responsive layout: desktop navigation/sidebar; mobile bottom navigation or compact menu.
- Include loading, empty, error, success, and confirmation states.
- Use accessible form labels, keyboard navigation, focus indicators, and sufficient contrast.
- Avoid excessive gradients, glassmorphism, generic AI-generated landing-page patterns, or decorative animation that reduces usability.

## 8. Matching logic (MVP, deterministic)

Implement a simple rule-based ranking for requests and services, with reasons visible where possible.

Potential ranking inputs:
- Same campus (required filter)
- Category match
- Keyword/tag overlap
- Budget compatibility
- Deadline/availability compatibility
- Listing freshness

Keep the scoring in a dedicated backend service/module and document its weights. Example initial score (tune after tests):
- Category match: +40
- Keyword/tag overlap: up to +25
- Budget compatibility: +15
- Availability/deadline fit: +10
- Freshness: up to +10

Do not present the score as an AI prediction or guarantee. Add a short “Why this is recommended” explanation. If matching is not needed to finish the MVP, ship category/search/filter first and add ranking as a stretch feature.

## 9. Suggested data model

Use UUID primary keys, timestamps, foreign keys, and soft-delete/archive fields where appropriate. Keep enums explicit.

### users
- id (UUID, PK)
- email (unique)
- password_hash
- full_name
- campus_id (FK)
- department (nullable)
- course (nullable)
- year_or_semester (nullable)
- avatar_url (nullable)
- bio (nullable)
- is_verified (boolean)
- created_at, updated_at

### campuses
- id (UUID, PK)
- name
- email_domain (nullable; allowlist domain)
- city (optional broad location)
- created_at

### listings (items)
- id
- owner_id (FK users)
- campus_id (FK campuses)
- title
- description
- category
- listing_mode enum: sell, lend, giveaway, exchange
- price (nullable; non-negative)
- condition (nullable)
- pickup_area (campus-level text)
- availability_status enum: available, reserved, unavailable, completed, archived
- created_at, updated_at

### listing_images
- id
- listing_id (FK)
- image_url
- sort_order

### requests
- id
- requester_id (FK users)
- campus_id (FK campuses)
- title
- description
- category
- request_type enum: item, academic_help, task, campus_help, other
- budget (nullable, non-negative)
- preferred_arrangement enum: free, paid, exchange, any
- deadline (nullable)
- status enum: open, assigned, completed, cancelled, archived
- created_at, updated_at

### offers
- id
- request_id (FK requests)
- provider_id (FK users)
- message
- proposed_price (nullable, non-negative)
- availability_note (nullable)
- status enum: pending, accepted, rejected, withdrawn, completed, cancelled
- created_at, updated_at

### services
- id
- provider_id (FK users)
- campus_id (FK campuses)
- title
- description
- category
- tags (JSON or normalized table)
- pricing_type enum: free, fixed, hourly, negotiable
- price (nullable, non-negative)
- availability_note (nullable)
- status enum: active, paused, archived
- created_at, updated_at

### transactions (accepted work/exchange)
- id
- request_id (nullable FK requests)
- listing_id (nullable FK listings)
- service_id (nullable FK services)
- offer_id (nullable FK offers)
- requester_or_buyer_id (FK users)
- provider_or_owner_id (FK users)
- status enum: accepted, in_progress, completed, cancelled
- completion_confirmed_by_requester (boolean)
- completion_confirmed_by_provider (boolean)
- created_at, updated_at, completed_at (nullable)

### reviews
- id
- transaction_id (FK transactions)
- reviewer_id (FK users)
- reviewee_id (FK users)
- rating (1–5)
- comment (nullable)
- created_at

### reports
- id
- reporter_id (FK users)
- target_type enum: user, listing, request, service, offer
- target_id
- reason
- details (nullable)
- status enum: open, reviewed, resolved, dismissed
- created_at

### blocks
- id
- blocker_id (FK users)
- blocked_id (FK users)
- created_at
- unique(blocker_id, blocked_id)

Optional later: conversations/messages, notifications, tags, moderation actions.

## 10. API design (REST)

Use versioned prefix `/api/v1`. Return consistent JSON and use Pydantic schemas for request/response validation.


### Authentication/profile
- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh` (only if refresh-token flow is implemented)
- `GET /users/me`
- `PATCH /users/me`
- `GET /users/{user_id}`
- `GET /users/{user_id}/reviews`

### Explore
- `GET /explore?type=request|listing|service&category=&q=&sort=&page=`

### Listings
- `POST /listings`
- `GET /listings`
- `GET /listings/{id}`
- `PATCH /listings/{id}` (owner only)
- `DELETE /listings/{id}` (owner only; archive instead of hard delete where appropriate)
- `POST /listings/{id}/interest` (optional; use a request/transaction workflow if implemented)

### Requests/offers
- `POST /requests`
- `GET /requests`
- `GET /requests/{id}`
- `PATCH /requests/{id}` (request owner only; allowed fields depend on status)
- `POST /requests/{id}/offers`
- `GET /requests/{id}/offers` (request owner only)
- `PATCH /offers/{id}` (offer owner can withdraw; request owner can accept/reject)

### Services
- `POST /services`
- `GET /services`
- `GET /services/{id}`
- `PATCH /services/{id}`
- `DELETE /services/{id}`

### Transactions/reviews/reports
- `GET /transactions/me`
- `GET /transactions/{id}` (participants only)
- `PATCH /transactions/{id}/status` (participants; enforce transition rules)
- `POST /transactions/{id}/confirm-completion`
- `POST /transactions/{id}/reviews`
- `POST /reports`
- `POST /users/{user_id}/block`
- `DELETE /users/{user_id}/block`

Implement only the endpoints required by the working UI. Do not create a large number of unused endpoints before the vertical slice works.

## 11. Backend architecture and implementation rules

### Stack
- Python 3.12+
- FastAPI
- PostgreSQL
- SQLAlchemy 2.x
- Alembic migrations
- Pydantic v2
- JWT authentication with secure password hashing (Argon2 or bcrypt)
- pytest

### Structure (keep it understandable)

```text
backend/
  app/
    main.py
    core/          # config, security, errors
    db/            # session, base, migrations
    models/        # SQLAlchemy models
    schemas/       # Pydantic request/response schemas
    api/v1/       # routers
    services/      # business logic, matching, status transitions
  tests/
  alembic/
  pyproject.toml
```

Avoid overengineering: no microservices, CQRS, event bus, or generic repository abstraction for this MVP.

### Backend quality requirements
- Validate input and enforce ownership permissions in backend, not just frontend.
- Use pagination for list endpoints.
- Use search/filter query parameters with safe validation.
- Never expose password hashes or private user fields.
- Enforce same-campus visibility and interactions.
- Enforce request/offer/transaction status transitions.
- Prevent duplicate offers from one provider for the same request unless the first is withdrawn/rejected and resubmission is allowed.
- Only transaction participants can update status or confirm completion.
- Only participants can leave reviews; review only after completion; one review per participant per transaction.
- Validate nonnegative prices/budgets.
- Avoid hard deletion when records are part of completed transactions.
- Add database indexes for campus_id, category, status, created_at, and common foreign keys.
- Use environment variables and provide `.env.example`; never commit secrets.
- Add structured logging, safe error messages, and CORS configuration for the local frontend.

## 12. Frontend implementation guide

### Stack
- React
- TypeScript
- Vite
- React Router
- TanStack Query (recommended for server state)
- React Hook Form + Zod (recommended for forms)
- Tailwind CSS (or another consistent styling system; choose one and stick to it)

### Suggested structure

```text
frontend/src/
  app/             # router, providers
  components/       # reusable UI components
  features/
    auth/
    explore/
    listings/
    requests/
    offers/
    services/
    activity/
    profile/
  lib/             # api client, validation, utilities
  styles/
```

### UI components to build
- App shell/navigation
- Listing/request/service cards
- Category chips
- Free/paid/borrow/exchange badges
- Search and filter controls
- Profile mini-card
- Offer submission panel
- Offers comparison/list
- Status timeline
- Review form
- Confirmation dialogs
- Empty/loading/error states

### Frontend rules
- Use typed API response models.
- Do not keep business rules only in the frontend.
- Validate forms client-side for UX and again server-side.
- Keep components small and focused.
- Avoid huge single-file components.
- Make desktop and mobile layouts usable.
- Use accessible buttons, labels, focus states, and keyboard controls.
- Include a demo mode/seeded data path for judges, but clearly label demo accounts/data.

## 13. Security, privacy, and safety requirements

- Campus verification must not be faked in production. Demo verification must be labeled.
- Do not display private addresses or precise location. Use campus pickup areas or public meeting points.
- Do not expose emails on public profiles by default.
- Add report/block mechanisms and basic moderation status.
- Provide guidance to meet in public campus areas for exchanges.
- Users must be able to cancel/withdraw before an exchange is finalized where reasonable.
- Clearly state CampusLoop does not process or guarantee payments in MVP.
- Do not allow listings for prohibited or dangerous goods. Add a category policy and report flow.
- Rate-limit login and offer/request actions where practical.

## 14. Demo seed data

Seed realistic demo data across categories, with enough records to make the campus feed look active:
- 8–12 items: textbooks, calculator, lab coat, headphones, drawing tablet, cycle accessories; mix sell/lend/give/exchange.
- 8–12 requests: tutoring, presentation design, laptop setup, borrow equipment, printing help; mix free/paid/exchange.
- 6–8 services: Python tutoring, poster design, photo editing, photography, notes formatting, basic tech support.
- 5–8 student profiles with different courses/years/skills and a few completed transactions/reviews.
Use fictional identities and explicitly label seeded accounts as demo data.
## 15. Acceptance criteria

### Auth and profile
- A user can register, log in, and log out.
- A user's campus is assigned/verified or clearly marked demo.
- User can edit profile fields.

### Requests and offers
- A signed-in student can create a request with optional budget and deadline.
- Request appears in campus feed and filters/search work.
- Another student can submit an offer.
- Request owner can accept one offer and reject/close others.
- The request changes to Assigned and an associated transaction is created.
- Unauthorized users cannot accept offers, edit others' requests, or access private offer details.

### Items and services
- User can create, edit, archive their own item/service listing.
- Listings display appropriate free/paid/lend/exchange states.
- Search/filter results are correct and campus-restricted.

### Completion and trust
- Transaction participants can update allowed statuses and confirm completion.
- Reviews can only be submitted for completed transactions.
- Reporting and blocking controls work at least at basic persistence level.

### Product quality
- Core routes load without console errors.
- Forms have validation and understandable error messages.
- Empty, loading, error, and success states exist.
- Responsive layout works at mobile and desktop sizes.
- A fresh clone can run by following README instructions.
- Automated tests cover authorization, offer acceptance, and completion/review rules.
## 16. Implementation phases for Antigravity

Do not build the entire application in one giant generation. Work in checkpoints and run the app after each phase.


### Phase 0 — Inspect and plan
1. Inspect existing repository and its tooling before changing files.
2. If the repo already has code, identify what is reusable and preserve it unless there is a concrete reason to change.
3. Write a short plan, proposed directory tree, database model outline, and UI route list.
4. Confirm stack and conventions in project documentation. Do not silently replace the stack.

**Deliverable:** plan.md and a proposed design system; no major code yet.


### Phase 1 — Foundation and visual shell
1. Set up frontend/backend, environment configuration, database connection, migrations.
2. Implement app shell, navigation, responsive design system, typography, cards, chips, buttons, forms.
3. Add seed/demo data and show populated Explore feed.
4. Build all key screens with mocked data first, but clearly separate mock API from real API.
5. Review visuals at desktop and mobile sizes. Fix spacing, overflow, hierarchy and states before continuing.

**Deliverable:** navigable frontend with seeded/mock content and working responsive layout.


### Phase 2 — Auth and profiles
1. Implement register/login, secure password handling, JWT.
2. Implement campus membership/verification and profile edit/view.
3. Connect frontend auth forms to API.
4. Add tests for auth and authorization.

**Deliverable:** authenticated app with real user profiles.


### Phase 3 — Items and services vertical slice
1. Implement database models, migrations, schemas, API, validation, permissions.
2. Implement create/edit/archive item and service flows.
3. Connect cards, filters, details, forms to API.
4. Add tests and manual verification.

**Deliverable:** items and services operate end-to-end against PostgreSQL.


### Phase 4 — Request Board and offers (highest priority)
1. Implement request creation, detail, edit/close, search/filter.
2. Implement offer submission and requester offer management.
3. Implement accept/reject rules and create transaction atomically.
4. Ensure accepted offer cannot be double-accepted under concurrent requests.
5. Connect UI and test the complete requester/provider flow.

**Deliverable:** a fully working request → offer → accept → assigned workflow.


### Phase 5 — Task completion and reputation
1. Implement transaction status transitions.
2. Implement two-sided completion confirmation.
3. Implement reviews and eligibility checks.
4. Add report/block persistence and basic UI.
5. Test edge cases and permissions.

**Deliverable:** completed task/exchange history and trust signals.


### Phase 6 — Matching, polish, and demo readiness
1. Add deterministic matching/ranking only if core flows are stable.
2. Explain why recommendations appear (category, tags, budget, timing).
3. Improve responsive states, accessibility, loading/errors, empty states.
4. Seed demo data and create a scripted 3-minute walkthrough.
5. Verify setup from a clean environment; update README and `.env.example`.

**Deliverable:** stable, demonstrable MVP with tests and documentation.
## 17. Required test cases

- Campus A users cannot see or interact with Campus B content if campus isolation is enforced.
- User cannot edit/delete another user's listing or request.
- Request owner cannot submit an offer to their own request.
- Provider cannot accept their own offer.
- Requester can accept at most one offer.
- Concurrent accept attempts result in only one accepted offer/transaction.
- Offers cannot be submitted to closed/assigned requests.
- Prices and budgets reject negative values.
- Only transaction participants can update status or confirm completion.
- Reviews cannot be submitted before completion or by nonparticipants.
- Duplicate reviews are rejected.
- Blocked users' content is hidden as designed.
## 18. Demo walkthrough (about 3 minutes)
1. Sign in as **Aarav (demo requester)**.
2. Post request: “Need a 10-slide presentation polished by tomorrow,” budget ₹400.
3. Switch to **Meera (demo provider)**, browse the Request Board, submit an offer for ₹350 with delivery note.
4. Switch back to Aarav, compare offers, accept Meera's offer.
5. Show request status moving to Assigned and transaction appearing in Activity.
6. Mark task in progress, then have both sides confirm completion.
7. Show reviews on both student profiles.
8. Briefly show a textbook listing with Borrow or Give away option to demonstrate the resource-sharing side.
Use separate demo accounts/session switching; do not fake the underlying state changes in the UI.
## 19. Environment and local run expectations

Provide:
- `.env.example` with backend and frontend configuration variables.
- Docker Compose for PostgreSQL (recommended) or clear local PostgreSQL setup instructions.
- Backend command, frontend command, migration command, seed command, and test command in README.
- Example environment variables: `DATABASE_URL`, `JWT_SECRET`, `ACCESS_TOKEN_EXPIRE_MINUTES`, `CORS_ORIGINS`, and frontend `VITE_API_BASE_URL`.
- Do not commit actual secrets or production credentials.
## 20. Antigravity working rules

Paste this as project guidance alongside the PRD:


> Read the PRD and implementation guide fully before coding. First inspect the existing repo, then produce a concise plan and architecture proposal. Implement in phases and keep the app runnable after every checkpoint. Do not silently change the stack, product scope, data model, routes, or visual direction. If a change is necessary, explain why and wait for approval for scope/architecture changes. Prioritize the Request Board vertical slice: request → offer → accept → task → completion → review. Use realistic seeded data, but label demo data. Keep business logic on the backend and test authorization/status rules. Do not add payment processing, AI chat, or unrelated dashboard features. Avoid placeholder buttons, dead links, fake state, and mock success messages for actions that are not wired. Before claiming a phase is done, run relevant tests, run the app, inspect the UI at desktop and mobile, and fix visible issues. Update README and a progress checklist after each phase.

## 21. Definition of done

CampusLoop MVP is done when a verified/demo student can post a request, another student can submit an offer, the requester can accept exactly one offer, the task can be completed by both participants, reviews are recorded, and the item/service exchange workflows are functional. Campus-specific visibility and authorization are enforced by the backend, not merely hidden in the UI. The app is responsive, has seeded demo data, has no dead core actions, has documented setup, and passes tests for the critical workflows.

## 22. Future roadmap (after MVP)
- Real-time messaging between participants.
- Notifications (email/in-app/push).
- Saved searches and personalized matching.
- Campus group buying.
- Verified student discounts and benefit discovery.
- Better moderation and admin tools.
- Multi-campus support and cross-campus discovery controls.
- Optional payment integration after trust, policies, and legal requirements are reviewed.
