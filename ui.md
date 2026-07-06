UI_DESIGN.md — Subscription Tracker Visual Design Spec

Read VISION.md and PRD.md first. This doc defines the actual visual design
(layout, components, colors) for the dashboard, based on two reference
designs, adapted to this project's actual data (Subscriber entity from
PRD.md section 3).

1. Reference analysis

Reference A — SaaS analytics dashboard (dark, sidebar layout)


Left sidebar navigation (icon + label nav items, one active/highlighted)
Top row: 4 metric cards in a horizontal grid, each with a value, a
label, and a small trend indicator (up/down % vs previous period)
One metric card uses a radial/gauge chart instead of a plain number
(progress toward a goal)
Donut chart card for categorical breakdown
Line/area chart card for a value trending over time
Data table card (sortable columns, avatar + name in first column)
A promotional/upsell card (flat color block, CTA button)
Right-hand panel: live activity/notification feed, separate from main
content


Reference B — Finance/wallet app (card-based, mobile-first)


Hero "balance" card with a glossy/gradient surface, large numeral,
masked account number styling
Circular progress ring for spend-by-category breakdown, with a
color-coded legend below it
Bar chart card for income trend, with one bar visually emphasized
(current period)
Transaction list: avatar, name, timestamp, amount — amount color-coded
by direction (money in vs money out)


What we take from each


From A: overall page structure — sidebar + top metric row + chart
cards + data table + side notification feed. This is the skeleton.
From B: the treatment of the hero revenue number as a distinct,
gradient-surfaced card rather than a plain metric tile, and
color-coding money direction in list rows.


2. Component mapping to this project

Reference componentThis project's versionData source (PRD.md §3)Sidebar navNot needed yet — single-page tool, no multi-page nav until Phase 1+—4 metric cardsActive subscribers / Revenue this month / Expiring in 3 daysderived from Subscriber[]Radial gauge cardOptional 4th card: monthly revenue goal progress (manual target input)amount sum vs a goal constantDonut chartPlan mix — share of subscribers on 1/3/6 month plansgrouped by plan_monthsLine/area chartRevenue trend, last 30/90 daysgrouped by payment_dateData tableSubscriber table (name, plan, expiry, status)Subscriber[], sorted by expiry_dateUpsell cardNot used — no upsell audience (single admin tool)—Notification feed"Expiring soon" / "Expired" alert listfiltered Subscriber[] by statusHero gradient balance cardRevenue-this-month hero card, gradient surfacesum of amount for current monthBar chart (income)Monthly revenue bars, last 6 monthsgrouped by payment_date monthTransaction list (color-coded)Payment log — green for payment received, red for refund/removedSubscriber[] events

Only build the rows above that map to a real PRD.md feature (F1–F6). Skip
sidebar, upsell card — they map to nothing in this project's scope.

3. Color system — YouTube Studio inspired, dark theme

Base palette mirrors YouTube Studio's dark mode: near-black background,
dark gray surfaces, white text, red as the single brand/accent color used
sparingly for active states and primary actions — NOT used broadly as
decoration.

TokenHexUsage--bg-page#0F0F0Fpage background--bg-surface#181818card background--bg-surface-raised#212121hover/raised state, table header--border#2D2D2Dhairline borders--text-primary#F1F1F1headings, values--text-secondary#AAAAAAlabels, muted text--text-tertiary#717171timestamps, placeholders--accent-brand#FF0000active nav item, primary button, focus ring--accent-brand-hover#CC0000button hover--success#3DDC84positive change, payment received--danger#F44336expired status, refund, negative change--warning#FFC107expiring-soon status

Use --accent-brand (red) only for: active navigation state, primary
action buttons, and focus outlines. Do not tint every card border red —
that reads as YouTube's chrome, not as this product's data.

Gradient treatment — revenue / earning elements only

Per the brief, revenue and sales-related cards and charts get a distinct
gradient treatment, reserved ONLY for money-related surfaces so it stays
meaningful instead of decorative:


Revenue hero card background:
linear-gradient(135deg, #0B3D2E 0%, #0F6E56 45%, #1D9E75 100%) —
a dark-to-mid green diagonal gradient (green = profit/growth, distinct
from the red brand accent so the two never compete). White text on top.
Revenue trend line/area chart fill:
linear-gradient(180deg, rgba(29,158,117,0.35) 0%, rgba(29,158,117,0) 100%)
under the line, with a solid #3DDC84 stroke.
Monthly revenue bar chart: bars filled with
linear-gradient(180deg, #3DDC84 0%, #0F6E56 100%), current month's bar
at full opacity, past months at 70% opacity to draw the eye to the
latest figure (same emphasis idea as Reference B's highlighted bar).
Every other card (subscriber count, expiring count, table, notification
feed) stays flat --bg-surface — no gradient. Gradient = "this is
money," flat = "this is operational data." Keep that rule consistent.


Status badge colors (table + notifications)

StatusBackgroundTextActivergba(61,220,132,0.15)#3DDC84Expiring soonrgba(255,193,7,0.15)#FFC107Expiredrgba(244,67,54,0.15)#F44336

4. Typography


Font: system sans-serif stack (-apple-system, "Segoe UI", Roboto, sans-serif) — matches both references' clean grotesque look, no need
for a custom font for an internal tool.
Hero numbers (revenue card): 32px / weight 600
Metric card values: 24px / weight 600
Card labels / eyebrows: 13px / weight 500 / --text-secondary /
letter-spacing 0.02em
Table body: 14px / weight 400
Table header: 13px / weight 500 / --text-secondary, uppercase-free
(sentence case per product convention)


5. Layout


Single column on mobile, widening to a 12-column grid on desktop.
Row 1: metric card grid — repeat(auto-fit, minmax(180px, 1fr)), gap
16px. Revenue hero card can span 2 columns if a goal-gauge card is
added later.
Row 2: two-column split on desktop (chart card left ~60%, notification
feed right ~40%); stacks vertically on mobile.
Row 3: full-width subscriber table.
Card corner radius: 12px. Card padding: 20px. Gap between cards: 16px.
No drop shadows — separation comes from --bg-surface vs --bg-page
contrast only, consistent with both references' flat dark aesthetic.


6. Component specs

Metric card

┌─────────────────────────────┐
│ label (secondary, 13px)     │
│ 24px value       ▲ 12% (sm) │
└─────────────────────────────┘

Trend arrow: --success green if positive, --danger red if negative,
--text-tertiary gray if flat/no comparison available yet.

Revenue hero card (gradient)

┌─────────────────────────────┐
│ Revenue this month           │ gradient bg
│ ₹XX,XXX            +12%      │ white text
│ ▂▃▅▇▆▇█  (sparkline, optional)│
└─────────────────────────────┘

Subscriber table row

Avatar-less (no photos needed) — use a colored initial circle instead,
--bg-surface-raised background, --text-primary initial. Status badge
right-aligned per Section 3 colors.

Notification / alert feed item

● [status-color dot] Name — expires in 2 days

Sorted soonest-first, same data as the table but filtered to
expiring_soon and expired only.

7. What NOT to carry over from the references


No upsell/premium-plan promo card — irrelevant, single-admin tool.
No "Contacts of your managers" panel — no team in this project.
No masked account number styling on the revenue card — there's no card
number here, don't fake one.
No currency-exchange widget — single currency (INR) throughout.


8. Build note for coding agents

Apply this palette and layout to the existing Phase 0 artifact (see
PRD.md §4) first — same HTML/CSS/vanilla JS, same window.storage
persistence, same Subscriber data model. This doc changes how it looks,
not the data model, storage phase, or feature set defined in PRD.md.
Do not add charts requiring a new library unless PRD.md's phase allows it
— a plain-JS sparkline/canvas is enough for Phase 0.