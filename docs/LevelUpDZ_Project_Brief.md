# Level Up DZ — Full Project Brief & Build Script

**Purpose of this document:** hand this directly to the build agent (Antigravity) as the source of truth for the project. It contains (1) everything confirmed by the client and ready to build now, (2) the exact technical decisions the agent should make/scaffold, and (3) a clearly separated list of items that REQUIRE human intervention (accounts, API keys, purchases) — the agent should stub these out with placeholders/config and never invent credentials or silently pick a paid vendor.

---

## 0. Project Summary

Level Up DZ is a local Algerian e-learning platform, modeled on Udemy, adapted for the Algerian market. Web-first (responsive), mobile app is phase 2.

- **Platform name:** Level Up DZ
- **Slogan:** "Développez vos compétences, construisez votre avenir."
- **Languages:** Arabic + French at launch (RTL support required for Arabic), English later
- **Target audience:** general public — students, professionals, artisans — priority on practical/professional skill courses
- **Launch content:** ~10–20 courses, ~150–300 videos, MP4 1080p, 10–30 min avg length
- **First course lineup:** Pâtisserie moderne, Pâtisserie traditionnelle, Petits salés modernes, Cake Design, Gâteau algérien (Qâteau) — more added progressively
- **Delivery approach:** ship an MVP fast, then iterate

---

## 1. User Roles & Auth

Three account types: **Student**, **Instructor**, **Admin**.

### Registration
- Email + password
- Phone number
- Google OAuth (Facebook = phase 2)
- Required fields at signup: full name, email, phone, wilaya (Algerian province — use a dropdown of the 58 wilayas), password, optional profile photo

### Verification
- Email verification: **mandatory** at launch
- SMS/OTP verification: phase 2

### Instructor onboarding
- Anyone can apply as instructor, but the account stays inactive until **manually approved by an admin** (identity + content-quality check)

### Admin roles (build role-based permissions from day one, even if only "Super Admin" is used initially per the recap doc)
- **Super Admin** — full access
- **Admin** — manage courses, users, payments
- **Moderator** — content validation/moderation only
- **Support** — user assistance, no access to sensitive settings

### Session/device limits
- Cap concurrent devices per student account (e.g. max 2 devices, 1 active session) — build this as a configurable limit, default 2

---

## 2. Student Experience

- Search + filters: category, level (Beginner/Intermediate/Advanced), price (free/paid), language, instructor, course duration
- Course detail page with ratings (stars) + written reviews
- Buy single course or bundle/pack (subscriptions = phase 2, but design the data model so plans can be added without a rewrite)
- Stream-only video player, no download option exposed anywhere in the UI or API responses (see Section 5)
- Adaptive bitrate streaming (quality adjusts to connection)
- Progress tracking per course (%), resume-from-last-position
- Auto-generated certificate on course completion (define completion rule per course: e.g. % watched + quiz passed)
- Access to course PDFs, downloadable resources, quizzes, exercises
- Q&A section per course (student asks, instructor answers)
- Purchase/invoice history page — all purchased courses + receipts in one place
- Support: ticketing system + WhatsApp button (live chat = phase 2)
- Email notifications: payment confirmation, order validation, course purchase

---

## 3. Instructor Portal

- Apply as instructor → pending admin approval
- Course builder: modules → chapters structure
- Upload video, PDF, other docs, quizzes, exercises
- Edit/update courses after publishing (may require re-approval depending on how strict you want moderation — flag this as a config toggle, not hardcoded)
- Dashboard: sales, revenue, enrolled student count, reviews received
- Payout/withdrawal requests, admin-approved before payout executes
- Answer student Q&A on their own courses
- Commission rate: **must be admin-configurable per instructor** (not a global constant) since it varies by partnership

---

## 4. Admin Panel

- Dashboard stats: total students, total instructors, total published courses, sales (daily/monthly/yearly), revenue, best-selling/most-viewed courses, recent signups, pending manual-payment validations, traffic stats
- Approve/reject instructor-submitted courses before they go live
- Approve/reject instructor account applications
- Validate manual bank-transfer/proof-of-payment submissions
- Handle refunds and disputes
- Promo codes / time-limited discounts management
- Notification triggers for: new signups, purchases, payment validation/rejection, new course published, instructor requests, refund requests

---

## 5. Video Hosting & Content Protection

This is the highest-risk, highest-cost area of the project — **the vendor choice is a human decision, not something the agent should default into.**

### Client's requirements (non-negotiable)
- No public/direct video links, ever
- No download option, anywhere
- Highest reasonable protection level, DRM if budget allows
- Watermark overlay showing student's name/email during playback (deters screen-recording sharing)
- Adaptive streaming (auto quality based on connection)
- Concurrent device/session limit enforcement

### What the agent SHOULD do
- Build the video player integration as an **abstracted service layer** (e.g. `VideoProviderService` interface) so swapping the underlying vendor later doesn't require touching the rest of the app
- Implement signed/expiring playback URLs (never store or expose raw video URLs client-side)
- Build the dynamic watermark overlay in the player UI (this is app-side and doesn't depend on vendor choice)
- Implement session/device-limit enforcement server-side (token-based, revoke old sessions on new login beyond the cap)

### What requires human decision + account creation (do NOT auto-select or fake)
- Final vendor pick between DRM/anti-piracy video hosts (e.g. VdoCipher, Mux, Bunny.net Stream + signed URLs, Cloudflare Stream). Each has different DRM strength, pricing per GB streamed, and Algeria-specific latency considerations.
- Creating the vendor account and obtaining API key/secret
- Confirming monthly budget for hosting + bandwidth at current course volume (150–300 videos) and projected growth
- **Agent should leave a `.env.example` with placeholder variable names (e.g. `VIDEO_PROVIDER_API_KEY=`) and a `TODO_HUMAN.md` checklist entry, not a working key.**

---

## 6. Payments (Algeria-specific)

### Methods
1. **Online card payment** via **Chargily** (supports EDAHABIA / CIB) — confirmed in the recap sent to client
2. **Manual payment**: student sends payment via BaridiMob/CCP → uploads proof (screenshot/receipt) → admin manually validates → course access unlocked

### Client account status (as of last response)
- Has a CCP account already
- Does **not yet** have a SATIM merchant account — using Chargily as the payment aggregator avoids needing this directly, but confirm this assumption with the client before finalizing the payment module, since Chargily's own onboarding may still require certain documents from her as an auto-entrepreneur

### Commerce features to build
- Purchase: single course, bundle/pack (subscription plans: phase 2, model the schema now)
- Auto-generated invoice/receipt on every payment (must be compliant with Algerian auto-entrepreneur invoicing rules — confirm exact legal format requirement with an accountant, not assumed by the agent)
- Promo codes: percentage/fixed discount, time-limited, usage caps
- Refund policy logic: default = no refund once video playback has started; exception path = admin-approved refund for verified technical failure preventing access
- Payment/purchase history per student
- Email notification on payment events

### Requires human intervention
- Creating the Chargily merchant account and obtaining API keys
- Confirming CCP/BaridiMob receiving account details for the manual-payment flow
- **Agent should build the payment module against a `PaymentProviderService` abstraction with Chargily as the target integration, using placeholder env vars until real keys are supplied.**

---

## 7. Technical Stack & Hosting

### Suggested stack (agent to scaffold, adjust if it has a strong reason)
- Frontend: responsive web app (Next.js recommended — SSR helps SEO for course discovery pages, and handles i18n/RTL cleanly)
- Backend: Node.js (NestJS or Express) or equivalent — choose based on what pairs best with the chosen video/payment SDKs
- Database: PostgreSQL
- File/PDF storage: S3-compatible object storage
- i18n: full AR/FR key-based translation setup with RTL CSS logical properties from the start (do not hardcode LTR-only layouts)

### Hosting
- Client wants your team to propose and manage cloud vs VPS
- Requirements: daily automated backups, DDoS/intrusion protection, ability to scale, full admin access to all services (hosting, DB, domain, email) with clear path to transfer ownership to client if needed

### Requires human intervention
- Choosing and purchasing the hosting plan (cloud provider or VPS)
- Domain registration: **levelupdz.com preferred, levelupdz.dz fallback** — needs an actual availability check and purchase
- SSL certificate setup (can be automated via Let's Encrypt once domain/hosting is live — agent CAN automate this part once domain is pointed)
- **Agent should scaffold deployment config (Docker Compose / CI pipeline) but not provision or pay for actual infrastructure.**

---

## 8. Legal

- CGU (Terms of Use), Privacy Policy, Refund Policy, Legal Notices — need to be drafted per Algerian regulation
- Invoices must comply with auto-entrepreneur tax obligations
- IP protection clauses: instructors certify they own rights to content they upload; users agree not to copy/record/share/resell course content

### Requires human intervention
- Actual legal drafting should be reviewed by an Algerian lawyer/accountant familiar with auto-entrepreneur status — the agent can draft boilerplate text as a starting point but this must not be treated as final legal copy.

---

## 9. Branding Assets — Status

| Item | Status |
|---|---|
| Logo | Client to send file — not yet delivered |
| Colors | From logo, exact HEX pending |
| Font | No client preference — agent/design team to propose a modern, professional font suitable for an e-learning platform, get sign-off later |
| Slogan | Confirmed: "Développez vos compétences, construisez votre avenir." |

**Do not block development on the logo file** — build with placeholder branding tokens (color variables, logo component slot) so real assets drop in later without refactoring.

---

## 10. MVP Scope (build this first)

1. Auth (email/password + Google), email verification, 3 roles
2. Course catalog: browse, search, filter, course detail page
3. Course content model: modules → chapters → (video / PDF / quiz / resource)
4. Video playback with watermark overlay + device/session limits (against abstracted provider)
5. Purchase flow: single course, Chargily card payment + manual proof-of-payment path
6. Student dashboard: progress, resume playback, purchase history, certificate on completion
7. Instructor dashboard: course builder, sales stats, payout requests
8. Admin dashboard: approvals (courses + instructors), payment validation, core stats, promo codes
9. AR/FR i18n with RTL
10. Basic support: ticket system + WhatsApp button

**Phase 2 (explicitly deferred):** subscriptions, mobile app, Facebook login, SMS OTP, subtitles, live chat, English localization.

---

## 11. TODO_HUMAN — Checklist Before Go-Live

- [ ] Choose & pay for video hosting/DRM vendor, get API keys
- [ ] Choose & provision hosting (cloud/VPS), confirm budget
- [ ] Register domain (levelupdz.com or levelupdz.dz)
- [ ] Create Chargily merchant account, get API keys
- [ ] Confirm CCP/BaridiMob receiving account for manual payments
- [ ] Send final logo file + confirm HEX color codes
- [ ] Sign off on chosen font
- [ ] Have CGU/Privacy Policy/Refund Policy/Legal Notices reviewed by a lawyer
- [ ] Confirm invoice format meets auto-entrepreneur tax requirements (check with accountant)
- [ ] Set final commission-rate defaults for instructors
- [ ] Confirm course-completion rule for certificate issuance

---

*This document consolidates the client's original brief, both clarification rounds, and the recap sent back to her. Nothing in the functional scope above is ambiguous — the items in Section 11 are the only blockers, and they're all things only you can action (accounts, purchases, legal sign-off), not the build agent.*
