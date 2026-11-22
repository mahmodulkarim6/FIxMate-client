# FixMate — repair services, booked in minutes

A full-stack repair-service platform for smartphones, laptops, home appliances and electrical
work. Customers browse vetted technicians, request a repair, and **pay only after the job is
marked complete**. Technicians manage listings and a job pipeline; admins approve listings, manage
roles and watch platform health.

- **Live site:** https://fixmate-client-zeta.vercel.app · **API:** https://fixmate-server-brown.vercel.app/
- **Client** — this repo. Next.js 16 (App Router) + React 19, TypeScript, Tailwind v4, shadcn/ui.
- **API** — [`../FixMate-server`](../FixMate-server). Express + MongoDB, JWT verification,
  Stripe Checkout, ImgBB uploads.

---

## Feature overview

### Public site
- **Home** — hero with live platform stats, category shortcuts, how-it-works, featured services,
  technician spotlight, testimonials, CTA band.
- **Services** — server-side search, category + mode filters, sorting and pagination, all in the
  URL so results are shareable and back-button friendly.
- **Service detail** — gallery, price/duration/area facts, technician card, booking form with
  validation, reviews, related services.
- **About** — the trust story, payment-after-completion model and support channels.
- **Auth** — sign up as customer or technician (role picker + password checklist), sign in with a
  redirect back to the page you came from.
- **Custom 404, error boundary and loading skeletons**, plus toast notifications for every action.

### Customer dashboard
- Overview cards + status donut + six-month spend chart + recent activity.
- Booking list with an inline **Requested → Accepted → In Progress → Completed → Paid** tracker,
  a detailed timeline dialog, cancel while still pending, and **Pay Now** that unlocks only after
  the technician completes the job.
- **Rate & review** a completed, paid repair (1–5 stars + short review); ratings appear on public
  service cards and detail pages.
- Payment history with Stripe transaction IDs and a **PDF invoice download** per transaction.
- Profile editor with an ImgBB avatar upload.

### Technician dashboard
- Overview with earnings trend, approval counts and incoming-request badge.
- **Add service** — validation, live preview, ImgBB cover upload, and a "pending approval" success
  state.
- **My services** — availability switch (pauses requests without losing approval), edit dialog
  that sends the listing back to review, delete confirmation.
- **Pro plan** — free accounts list up to 3 services; a Stripe checkout unlocks unlimited listings
  and the Verified Pro badge shown on every public card.
- **Requests** — accept/reject, start work, complete with a final-amount modal.

### Admin dashboard
- Overview: users, listings, bookings, revenue, revenue-by-month, category split, status
  pipeline, latest bookings.
- **Users** — role switcher with self-protection (you cannot change your own role) and Pro badges.
- **Service approval** — review grid with a detail preview, approve, or reject with a reason the
  technician can act on.
- **Bookings** — read-only oversight of every job with a timeline.
- **Transactions** — full Stripe ledger split into repair revenue and Pro subscriptions, totals,
  average repair ticket, current-month revenue.

### Cross-cutting
- Role-aware sticky navbar with a mobile sheet menu, and a footer using the new X logo.
- Smooth light/dark theme toggle (with `D` hotkey) using a warm cream + deep teal + amber palette;
  equal-height cards; consistent status badge colours; `Bricolage Grotesque` headings with `Geist`
  body text.
- Every dashboard route is protected **on the server** by its layout, not just in the browser.

---

## Tech stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 16.4 (App Router, Turbopack), React 19.3 |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 + shadcn/ui (base-ui), `next-themes` |
| Auth | BetterAuth 1.7 with the MongoDB adapter + JWT plugin |
| Data | MongoDB (shared with the API) |
| Charts | Recharts wrappers in `components/dashboard/dashboard-charts.tsx` |
| Validation | Hand-written validators shared by client and server contracts |
| Icons / toasts | `lucide-react`, `sonner` |

---

## Quick start

```bash
# 1. API server
cd ../FixMate-server
npm install
cp .env                   # set MONGODB_URI, STRIPE_*, IMGBB_API_KEY
npm run dev               # http://localhost:5000

# 2. This client
cd ../FixMate-client
npm install
cp .env                   # set MONGODB_URI, BETTER_AUTH_*, NEXT_PUBLIC_*
npm run dev               # http://localhost:3000

# 3. Demo data (optional but recommended)
cd ../FixMate-server
npm run seed              # requires this client to be running
```

MongoDB must be reachable before either app starts. Both apps **must** use the same
`MONGODB_URI` / `MONGODB_DB`.

### Environment variables

| Variable | Example | Notes |
| --- | --- | --- |
| `BETTER_AUTH_SECRET` | long random string | Session signing secret. |
| `BETTER_AUTH_URL` | `http://localhost:3000` | Also the JWT issuer/audience. Must match the API's `JWT_ISSUER` / `JWT_AUDIENCE`. |
| `MONGODB_URI` | `mongodb://127.0.0.1:27017` | |
| `MONGODB_DB` | `fixmate` | |
| `NEXT_PUBLIC_API_URL` | `http://localhost:5000` | Express API base URL. |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` | Public site URL / BetterAuth client base. |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | — | Optional; Google login enables itself when both are present. |

### Demo accounts — password `Fixmate123!`

| Role | Email |
| --- | --- |
| Admin | `admin@fixmate.dev` |
| Technician | `rakib@fixmate.dev` · `sadia@fixmate.dev` · `karim@fixmate.dev` |
| Customer | `nusrat@fixmate.dev` · `tanvir@fixmate.dev` |

`nusrat@fixmate.dev` owns one completed-but-unpaid job, so the Stripe flow can be tried straight
away.

---

## Routes

| Route | Access | Purpose |
| --- | --- | --- |
| `/` | Public | Marketing home. |
| `/services` | Public | Catalogue with search / filter / sort / pagination. |
| `/services/[id]` | Public | Details + repair request form. |
| `/about` | Public | Story, process, guarantees. |
| `/sign-in`, `/sign-up` | Public | BetterAuth email + password. |
| `/payment/success`, `/payment/cancel` | Public | Stripe return pages. |
| `/dashboard/customer` | Customer | Overview. |
| `/dashboard/customer/bookings` | Customer | Jobs, timeline, cancel, Pay Now. |
| `/dashboard/customer/payments` | Customer | Receipts. |
| `/dashboard/technician` | Technician | Overview. |
| `/dashboard/technician/add-service` | Technician | Create listing. |
| `/dashboard/technician/my-services` | Technician | Manage listings. |
| `/dashboard/technician/requests` | Technician | Job pipeline. |
| `/dashboard/admin` | Admin | Platform overview. |
| `/dashboard/admin/users` | Admin | Roles. |
| `/dashboard/admin/services` | Admin | Approval queue. |
| `/dashboard/admin/bookings` | Admin | Oversight. |
| `/dashboard/admin/transactions` | Admin | Revenue ledger. |
| `/dashboard/profile` | Any signed-in user | Profile + avatar. |

Signing in as the wrong role for a dashboard redirects you to your own home instead of showing a
broken page.

---

## How it fits together

### Auth
BetterAuth owns credentials and sessions. A `jwt()` plugin signs a 1-hour token whose claims
include `role`, which the API verifies against the client's JWKS — no shared secret.

- `lib/auth.ts` — server-side BetterAuth config (Mongo adapter, `additionalFields`, role guard on
  sign-up so nobody can self-register as admin).
- `lib/auth-client.ts` — React client (`useSession`, `signIn`, `signUp`, `updateUser`).
- `lib/client-api.ts` — fetches `/api/auth/token`, caches the JWT until just before expiry, and
  attaches `Authorization: Bearer …` to every API call. A `401` clears the cache.
- `lib/session.ts` — `requireUser()` / `requireRole()` used by each dashboard layout, so
  protection happens during server rendering.

### Data flow
Public pages fetch from the Express API in server components (`lib/api.ts`). Dashboard pages are
client components using `hooks/use-api.ts`, which gives `{ data, loading, error, refresh }` — the
same shape every table and chart consumes.

### Payments
1. Technician completes a job and sets the final amount.
2. Customer's **Pay Now** calls `POST /api/payments/create-checkout-session`.
3. Stripe's hosted **test-mode** checkout opens with its own reminder — *Use test card 4242 4242
   4242 4242 with any future date and any CVC.* — and redirects back to
   `/payment/success?session_id=…`, which verifies the session and renders the receipt; the
   webhook writes the same record idempotently.
4. `/payment/cancel` reassures the customer that nothing was charged.
5. Test with Stripe's test card `4242 4242 4242 4242`, any future date and any CVC. Real cards are
   declined in test mode.

### Images
Uploads go to the Express API, which forwards them to ImgBB — the key stays server-side. If a
listing has no image (or a stale URL), `components/services/service-art.tsx` renders on-brand
vector artwork per category, so the UI never shows a broken tile.

---

## Project structure

```
app/
├── (auth)/                 # sign-in, sign-up
├── (public)/               # home, services, about, payment return pages
├── dashboard/              # role-guarded shells + customer/technician/admin pages
├── api/auth/[...all]/      # BetterAuth handler
├── layout.tsx              # fonts, theme provider, toaster
├── error.tsx / loading.tsx / not-found.tsx
└── globals.css             # design tokens, surface/utility classes

components/
├── brand/                  # logo
├── dashboard/              # page header, tables, charts, timeline
├── home/                   # landing sections
├── layout/                 # sticky header, footer, theme toggle
├── services/               # cards, media + vector fallback, filters, request form
├── shared/                 # status badges, stat cards, category icons
└── ui/                     # shadcn/ui primitives

lib/                        # auth, api clients, types, constants, formatting, status maps
hooks/                      # use-api
```

---

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Dev server with Turbopack. |
| `npm run build` | Production build (type-checks as part of the build). |
| `npm start` | Serve the production build. |
| `npm run typecheck` | `tsc --noEmit`. |
| `npm run lint` | ESLint. |
| `npm run format` | Prettier with the Tailwind plugin. |

---

## Deployment notes

1. Deploy the API somewhere that keeps a long-lived process (Railway, Render, Fly.io) and set
   `CLIENT_URL` to the deployed client origin.
2. Deploy the client (Vercel works well). Set `BETTER_AUTH_URL` and `NEXT_PUBLIC_APP_URL` to the
   production URL, and `NEXT_PUBLIC_API_URL` to the API origin.
3. Point `JWT_ISSUER` / `JWT_AUDIENCE` on the API at the production client URL — they must match
   exactly or every token is rejected.
4. Add a Stripe webhook endpoint at `https://<api-host>/api/payments/webhook` for
   `checkout.session.completed` and put its signing secret in `STRIPE_WEBHOOK_SECRET`.
5. Use a dedicated MongoDB database user and an Atlas connection string; never commit `.env`.

---

## Original assignment

Built as the Category 006 assignment for Programming Hero. TypeScript type-checks clean and the
production build passes.

---

## npm packages used

| Package | Why |
| --- | --- |
| `next`, `react`, `react-dom` | App Router framework and UI runtime |
| `better-auth`, `@better-auth/mongo-adapter` | Authentication, sessions and the JWT plugin |
| `mongodb` | BetterAuth's database connection |
| `@base-ui/react`, `shadcn`, `class-variance-authority`, `cn`, `lucide-react` | UI primitives, styling helpers and icons |
| `tailwindcss`, `@tailwindcss/postcss`, `tw-animate-css`, `next-themes` | Styling and dark mode |
| `recharts` | Dashboard charts |
| `sonner` | Toast notifications |
| `typescript`, `eslint`, `eslint-config-next`, `prettier`, `prettier-plugin-tailwindcss` | Tooling |
