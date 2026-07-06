Subscription Tracker (Internal Ops Tool)

What this is

A small internal tool for tracking paying subscribers of Raj's trading-analytics
products (options analytics Telegram bot / TradingView indicator sold to Indian
retail traders). It is NOT the trading system itself — it has nothing to do with
NSE data, backtesting, or the V3 algo-trading platform. It is the business
operations layer that sits on top of the paid product.

Why we are building this

Raj is starting a small paid-subscription business:


Product: options analytics delivered via Telegram bot and/or a TradingView
indicator (PCR, OI buildup, Max Pain, IV skew — logic reused from the V3
trading platform's analytics layer).
Customers pay via Razorpay Payment Links for 1/3/6-month plans.
Access (Telegram bot access or TradingView invite) is currently granted
manually by Raj after he sees a payment come in.


Without a system, subscriber tracking will be lost in DMs, screenshots, and
memory. Raj needs a single source of truth for:


Who has paid, how much, and for what plan.
When each subscriber's access expires, so it can be revoked or renewed.
How much revenue is coming in, at a glance.


This is a solo-founder ops tool, not a customer-facing product. There is
exactly one user: Raj (admin).

Goals


Give Raj a single place to add a subscriber the moment a payment lands.
Auto-calculate expiry date from plan length + payment date.
Surface who is expiring soon so access can be revoked / renewal can be
chased, and who is already expired.
Show basic revenue visibility (this month's revenue, active subscriber
count) without needing a spreadsheet.
Start as simple as possible (manual entry, zero backend) and evolve toward
automation (Razorpay webhook auto-adds subscribers, auto-grants access)
only once there is real subscriber volume to justify it.


Non-goals (explicitly out of scope for now)


No public-facing storefront / landing page — that's a separate concern.
No multi-admin / team accounts — single user only.
No in-app payment collection — Razorpay Payment Links handle that
externally.
No automatic Telegram/TradingView access granting in the first version —
that's a later phase, not MVP.
Not a replacement for the trading platform's documentation system —
this is a standalone small tool.


Guiding principle for build order

Build only what has real data to justify it. A dashboard with zero
subscribers is a waste of time — favor the smallest thing that lets Raj
track real subscribers today, and defer automation (webhooks, auth,
multi-user) until subscriber count actually makes manual work painful.
See PRD.md's phased roadmap — do not skip ahead of the current phase.

Success looks like


Raj can add a subscriber in under 15 seconds after a payment notification.
Raj never manually revokes/renews the wrong subscriber's access because
expiry status is always visible and correct.
Revenue and active-subscriber numbers are trustworthy enough that Raj
stops needing a side spreadsheet.