Subscription Tracker

Read VISION.md first for why this exists. This doc defines what to build,
how data is structured, where it's stored, and what tech stack to use.

1. User

Single admin user: Raj. No public signup, no multi-tenant support. Every
build phase below assumes one authenticated (or unauthenticated, in early
phases) operator.

2. Core features

F1 — Add subscriber

Form fields: name, contact (Telegram handle or phone), plan (1/3/6 month,
fixed prices below), payment date (defaults to today).
On submit: compute expiry_date = payment_date + plan_months, store record.

Fixed plans (hardcode as constants, not user-editable in MVP):

PlanDurationPrice (INR)1 month1 month1993 month3 months4996 month6 months899

F2 — Status classification (derived, not stored)

Computed on every render from expiry_date vs today:


expired — expiry date is in the past
expiring_soon — expiry date is within 3 days from today
active — expiry date is more than 3 days out


F3 — Subscriber list / table

Columns: name, contact, plan, amount paid, expiry date, status badge,
remove action. Sorted by soonest expiry first (most urgent at top).

F4 — Summary cards


Active subscriber count (status != expired)
Revenue this calendar month (sum of amount where payment_date is in
current month)
Count expiring within 3 days (nudges Raj to follow up)


F5 — Remove subscriber

Manual delete action per row (e.g. subscription cancelled, refunded, or
data entry error).

F6 — Persistence

Data must survive between sessions. See Section 4 (Storage) for the phase
each persistence approach applies to.

Deferred features (do NOT build until the relevant phase is reached)


F7 — Razorpay webhook auto-creates subscriber record on payment
F8 — Automatic Telegram bot access grant/revoke on status change
F9 — Automatic TradingView invite-list add/remove
F10 — Renewal reminder messages (e.g. auto-DM 2 days before expiry)
F11 — Multi-admin auth
F12 — Editable/custom plans (beyond the 3 fixed tiers)


3. Data model

Single entity: Subscriber.

Subscriber
├── id            string   unique identifier
├── name          string   required
├── contact       string   Telegram handle or phone, required
├── plan_months   int      one of 1, 3, 6
├── amount        int      INR amount actually paid
├── payment_date  date     ISO 8601
├── expiry_date   date     ISO 8601, derived = payment_date + plan_months
└── source        string   "manual" | "razorpay_webhook"  (default "manual")

status is NEVER stored — always derive it from expiry_date at read time
so it can't go stale.

source field exists from day one even though webhook automation (F7) is
deferred, so the schema doesn't need a breaking migration later.

4. Storage — phased

Phase 0 (current / MVP): Client-side persistence only — the artifact's
key-value storage (window.storage, personal/non-shared scope), storing
the full subscriber list as one JSON blob under a single key (e.g.
subscribers). No backend, no server. Fine for a single admin, low volume,
no automation.

Phase 1 (once subscriber count makes the artifact clunky, roughly 20+
active subscribers, or once a real deployed dashboard is wanted):
Move to Supabase Postgres.

sqlcreate table subscribers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  contact text not null,
  plan_months int not null check (plan_months in (1,3,6)),
  amount int not null,
  payment_date date not null,
  expiry_date date not null,
  source text not null default 'manual',
  created_at timestamptz not null default now()
);

Status stays derived at query/render time, not a stored column.

Phase 2 (F7 — webhook automation): A small always-on backend service
(NOT the dashboard frontend) receives Razorpay webhook events and inserts
rows into the Phase 1 Supabase table directly. This service must run on a
platform that supports persistent/background processes — NOT serverless
functions with cold-start-only execution — because it needs to reliably
catch webhook calls at any time.

5. Tech stack

Frontend (dashboard UI)


Phase 0: Single HTML file, vanilla JS, inline CSS. No build step,
no framework. This matches the current artifact and should stay as-is
until Phase 1.
Phase 1+: Next.js (React) app, deployed on Vercel. Vercel is
appropriate here because the dashboard is a normal request/response web
app with no need for an always-on background process — reads/writes
happen on user interaction, not on a schedule.
Styling: plain CSS or Tailwind, no heavy UI framework needed for a
single-admin internal tool. Keep it simple — this is not a
customer-facing product.


Backend / automation (Phase 2 only)


Small Python or Node service that:

Exposes a webhook endpoint for Razorpay payment events.
Verifies the Razorpay webhook signature.
Inserts a Subscriber row into Supabase.



Must be deployed somewhere that supports persistent/always-on
processes — Railway or Render (free tier is fine to start). Do NOT use
Vercel for this piece — Vercel's serverless model is not built for a
service that must reliably be listening at arbitrary times, and this is
a separate deployable from the dashboard frontend above.


Database


Supabase (Postgres) — free tier. Also handles future auth (F11) if/when
multi-admin support is ever needed, though that is explicitly out of
scope today.


Payment


Razorpay Payment Links for the 3 fixed plans (manual creation, no API
integration needed until Phase 2's webhook work).


6. Non-functional requirements


Must work on mobile browser (Raj checks this from his phone frequently).
Zero or near-zero hosting cost until subscriber volume justifies paid
tiers.
No customer-facing surface — assume the only visitor is Raj.
Keep Phase 0 fully self-contained (no external accounts/setup required)
so it's usable immediately, before Razorpay/Supabase accounts exist.


7. Roadmap / build order


Phase 0 (done) — artifact-based dashboard, manual entry, local
persistence.
Phase 1 — migrate to Supabase + Next.js on Vercel once Razorpay
account is active and subscriber count grows past manual-artifact
comfort.
Phase 2 — Razorpay webhook service on Railway/Render, auto-inserts
subscribers on payment (F7).
Phase 3 — access automation: auto-grant/revoke Telegram bot access
(F8) and/or TradingView invite list (F9) based on subscriber status.
Phase 4 — renewal reminders (F10).


Do not start a later phase's work until the current phase is actually a
bottleneck. Building Phase 2 automation with zero real subscribers is
wasted effort — re-check VISION.md's guiding principle before jumping
ahead.

8. Open questions / assumptions to revisit


Plan prices (₹199/₹499/₹899) are current as of this doc — confirm before
hardcoding into Phase 1+ if pricing has changed.
Whether Telegram bot or TradingView indicator (or both) is the delivered
product affects what F8/F9 automation looks like — decide before
starting Phase 3.
Single-admin assumption holds unless Raj brings on help managing the
business — revisit F11 only if that changes.