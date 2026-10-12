# Expense Voucher Management System

A production-quality fintech application for digitising expense voucher processes. Employees can create vouchers, directors can approve/reject them, and the accounts team can view approved reimbursements.

## Tech Stack
- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Framer Motion, Recharts, React Hook Form + Zod, TanStack Query
- **Backend**: Node.js, Express, TypeScript, Prisma ORM, PostgreSQL
- **Design System**: Premium Glassmorphism with layered mouse parallax background, dark theme focus, robust motion variants.

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- PostgreSQL

### 1. Database & Server Setup
```bash
cd server
npm install
```
Configure your `.env` file (see `server/.env.example`):
```env
PORT=5000
DATABASE_URL="postgresql://user:password@localhost:5432/expense_vouchers?schema=public"
JWT_SECRET="super-secret-jwt-key"
```
Run migrations and seed the database:
```bash
npx prisma migrate dev --name init
npx prisma db seed
npm run dev
```

### 2. Client Setup
```bash
cd client
npm install
npm run dev
```

### Demo Credentials
- Employee: `employee1@abc.com`
- Director: `director@abc.com`
- Accounts: `accounts@abc.com`
- Password for all: `Password@123`

---

## DB Schema Explanation

- **users**: Stores Employee, Director, and Accounts profiles with role-based enum. Contains `signature_url` for employees.
- **vouchers**: Core entity. Tracks status (`DRAFT`, `PENDING_APPROVAL`, `APPROVED`, `REJECTED`), amounts, and ties `employee_id` and `director_id` foreign keys. Stores snapshot URLs for signatures at the time of approval.
- **voucher_activity**: Audit trail table recording every status change (e.g., submitted, approved, rejected) with timestamps and actor tracking.
- **voucher_counters**: Singleton-style table for atomic, transaction-safe auto-incrementing of the custom voucher number (`VCH-YYYY-XXXX`).

---

## Assumptions & Out of Scope
- **Status mapping**: "Submitted" and "Pending Approval" from the UI are stored as a single status `PENDING_APPROVAL` in the DB. `submitted_at` records the exact submission moment.
- **Signatures**: Employee signature is uploaded once to their profile (in settings/My Signature) and is attached immutably to a voucher at the moment of submission. It can be replaced anytime before submission. Director signature is uploaded physically via the Approve modal.
- **Directors**: One Director account is seeded for demo purposes, but the DB schema supports multiple directors.
- **Reimbursement marking**: Marking an approved voucher as physically "Paid/Reimbursed" is out of scope for this assignment.
- **Image validation**: Upload checks strictly enforce `image/png`, `image/jpeg`, and `image/webp` with a 2MB limit.

---

## API Documentation

For the complete OpenAPI spec, see `openapi.yaml` in the root folder.

| Method | Route | Auth | Purpose |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Public | Authenticate user, returns JWT. |
| `GET` | `/api/auth/me` | Valid JWT | Returns current logged-in user details. |
| `POST` | `/api/users/me/signature` | Employee | Upload signature image (multipart/form-data). |
| `GET` | `/api/vouchers` | JWT (Scoped) | Get list of vouchers. Supports `search`, `status`, `minAmount`, `maxAmount`, `page`. |
| `GET` | `/api/vouchers/:id` | JWT (Scoped) | Get voucher details and audit trail. |
| `POST` | `/api/vouchers` | Employee | Create a new DRAFT voucher. |
| `PUT` | `/api/vouchers/:id` | Employee | Edit a DRAFT voucher. |
| `DELETE` | `/api/vouchers/:id` | Employee | Delete a DRAFT voucher. |
| `POST` | `/api/vouchers/:id/submit` | Employee | Submit a DRAFT for approval. |
| `POST` | `/api/vouchers/:id/approve` | Director | Approve voucher (requires signature upload). |
| `POST` | `/api/vouchers/:id/reject` | Director | Reject voucher (requires JSON body `{ reason }`). |
| `GET` | `/api/dashboard/summary` | JWT | Get stat cards, chart data, and recent activity. |

## QA Notes
- Fully responsive (tested down to 375px).
- Respects `prefers-reduced-motion` for parallax accessibility.
- Follows WCAG contrast guidelines for glassmorphic elements.
