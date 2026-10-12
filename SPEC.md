# SPEC: Expense Voucher Management System

## 1. Roadmap (time plan, ~7 days)

| Day | Phase | Output |
| :--- | :--- | :--- |
| 1 | Setup + DB | Monorepo, Prisma schema, migrations, seed, Express skeleton |
| 2 | Auth + RBAC | Login, JWT, role middleware, protected routes in React |
| 3 | Employee module | Create/Draft/Edit/Delete/Submit, signature upload |
| 4 | Director + Accounts | Approve/Reject, list with search/filter/sort, details |
| 5 | Dashboards | 3 role dashboards with stats + recent activity |
| 6 | UI polish | Glass design system, parallax background, animations, responsive |
| 7 | Docs + QA | README, API docs, screenshots, test all rules, deploy (optional) |

## 2. Database schema

**users**: id (uuid), name, email (unique), password_hash, role (EMPLOYEE | DIRECTOR | ACCOUNTS), employee_code (nullable), department (nullable), signature_url (nullable), created_at, updated_at

**vouchers**: id (uuid), voucher_number (unique), voucher_date, expense_date, department, title, category (enum: TRAVEL, FOOD, ACCOMMODATION, OFFICE_SUPPLIES, SOFTWARE, TRAINING, OTHER), description, amount (Decimal 12,2), status (DRAFT | PENDING_APPROVAL | APPROVED | REJECTED), employee_id (FK users), employee_signature_url, director_id (FK users, nullable), director_signature_url, submitted_at, approved_at, rejected_at, rejection_reason, created_at, updated_at

**voucher_activity** (audit trail): id, voucher_id, actor_id, action (CREATED | UPDATED | SUBMITTED | APPROVED | REJECTED), note, created_at

**voucher_counters**: year (PK), last_number. Increment inside a transaction to generate VCH-2026-0001 safely.

Indexes: vouchers(employee_id), vouchers(status), vouchers(expense_date), vouchers(voucher_number).

## 3. API list

| Method | Route | Role | Purpose |
| :--- | :--- | :--- | :--- |
| POST | /api/auth/login | public | Login |
| GET | /api/auth/me | any | Current user |
| POST | /api/auth/logout | any | Logout |
| POST | /api/users/me/signature | employee | Upload signature |
| GET | /api/vouchers | all (scoped) | List with search/filter/sort/pagination |
| GET | /api/vouchers/:id | all (scoped) | Details + activity |
| POST | /api/vouchers | employee | Create Draft |
| PUT | /api/vouchers/:id | employee (own, Draft) | Edit Draft |
| DELETE | /api/vouchers/:id | employee (own, Draft) | Delete Draft |
| POST | /api/vouchers/:id/submit | employee (own, Draft) | Submit |
| POST | /api/vouchers/:id/approve | director | Approve (multipart: signature) |
| POST | /api/vouchers/:id/reject | director | Reject (body: reason) |
| GET | /api/vouchers/:id/pdf | director, accounts, owner | Printable PDF |
| GET | /api/dashboard/summary | all (role based) | Dashboard stats |

Query params for list: `search`, `status`, `department`, `category`, `from`, `to`, `minAmount`, `maxAmount`, `sortBy`, `order`, `page`, `limit`.

## 4. Frontend structure

```
client/src/
  app/ (router, providers, guards)
  components/ui/ (GlassCard, Button, Input, Select, Badge, Modal, Table, Skeleton, EmptyState, Toast)
  components/layout/ (AppShell, Sidebar, Topbar, ParallaxBackground)
  features/auth | vouchers | dashboard | signature
  hooks/
  lib/ (api client, utils)
  types/
```

Routes: `/login`, `/employee/dashboard`, `/employee/vouchers`, `/employee/vouchers/new`, `/employee/vouchers/:id`, `/employee/vouchers/:id/edit`, `/director/dashboard`, `/director/pending`, `/director/vouchers`, `/director/vouchers/:id`, `/accounts/dashboard`, `/accounts/vouchers`, `/accounts/vouchers/:id`.

## 5. Design System (glassmorphism + parallax)

**Mood**: calm, trustworthy fintech. Dark theme by default with a light theme toggle.

**Palette (CSS variables)**:
- Background base: `#0B1020` (deep navy)
- Accent primary: `#4F8CFF` (azure), secondary: `#2DD4BF` (teal)
- Success `#34D399`, Warning `#FBBF24`, Danger `#F87171`
- Text primary `rgba(255,255,255,0.92)`, secondary `rgba(255,255,255,0.62)`
- Light theme: base `#EEF2FA`, text `#0F172A`

**Typography**: "Plus Jakarta Sans" for headings, "Inter" for body, tabular numerals for amounts. Scale: 12/14/16/20/28/40.

**Glass surface recipe**:
```css
.glass {
  background: rgba(255,255,255,0.07);
  backdrop-filter: blur(18px) saturate(140%);
  -webkit-backdrop-filter: blur(18px) saturate(140%);
  border: 1px solid rgba(255,255,255,0.14);
  box-shadow: 0 8px 32px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.12);
  border-radius: 20px;
}
```
Data tables and forms use a more opaque variant (`0.12` to `0.16` alpha) so text stays readable. Maintain WCAG AA contrast.

**Parallax animated background (ParallaxBackground component)**:
- 3 layers, fixed behind the app, `pointer-events: none`.
  1. Far: large blurred gradient blobs (azure, teal), slow drift (40 to 60 s loop).
  2. Mid: smaller soft orbs, moves opposite to the mouse by ~12 px.
  3. Near: subtle fine grid or noise overlay at low opacity, moves ~24 px with the mouse.
- Mouse-move parallax using Framer Motion `useMotionValue` + `useSpring`; on touch devices use gentle scroll-based parallax or idle drift.
- Only animate `transform` and `opacity` (GPU friendly). Pause when tab hidden. Disable parallax under `prefers-reduced-motion`.

**Motion**: page transitions 250 ms fade+rise, staggered card entry (60 ms), hover lift on cards (translateY -3px + stronger border), animated number count-up on dashboard stats, skeleton shimmer for loading.

**Components to feel premium**: status badges with dot + soft tinted glass; sticky glass topbar; collapsible glass sidebar; stat cards with sparkline; voucher detail page laid out like a real printed voucher with signature boxes; signature upload with drag-and-drop + live preview + remove.

**Avoid (looks AI-made)**: purple to pink gradients everywhere, emoji icons, centered giant hero text on app screens, identical card grids with no hierarchy, generic "Welcome back!" copy, random stock illustrations, too many glows. Use real, concise microcopy ("3 vouchers awaiting your approval").

## 6. Status transition table (server side)

| From | Action | To | Who |
| :--- | :--- | :--- | :--- |
| DRAFT | submit | PENDING_APPROVAL | owner employee |
| PENDING_APPROVAL | approve | APPROVED | director |
| PENDING_APPROVAL | reject | REJECTED | director |
| any other | any | blocked (409) | n/a |

## 7. QA checklist (test before submitting)
- [ ] Employee cannot open another employee's voucher URL or API id
- [ ] Employee cannot edit/delete after submit (API returns 409)
- [ ] Submit without signature fails
- [ ] Approve without signature fails; reject without reason fails
- [ ] Amount 0 and negative blocked
- [ ] Accounts cannot hit any POST/PUT/DELETE voucher route
- [ ] Voucher numbers stay unique under concurrent creates
- [ ] Uploading a .exe renamed .png is rejected
- [ ] Direct URL access to wrong-role pages redirects
- [ ] Works on 375 px mobile width
- [ ] README, .env.example, migrations, seed all present
