# MeritList

An organic, merit-ranked AI tools directory API. Built as a corrective to
pay-to-win "verified listing" ranking models seen in directories like
Futurepedia — discovery here is driven entirely by real community engagement,
not paid placement.

## Stack

Node.js, Express, TypeScript, PostgreSQL, Drizzle ORM, Zod, JWT + argon2,
Swagger (OpenAPI), deployed on Azure App Service (DB hosted on Neon).

## Architecture

Feature-based: each domain (`auth`, `tools`, `upvotes`) is self-contained with
its own controller, service, routes, and validation — rather than splitting
by technical layer.

```
src/
├── config/        env + db connection
├── db/schema/      Drizzle table definitions
├── features/
│   ├── auth/        register, login, JWT issuance
│   ├── tools/        submit, recent, popular, related
│   └── upvotes/      upvote a tool (transactional, unique-constrained)
├── middleware/      requireAuth, validate, error handler
├── utils/           JWT helpers, ApiError
└── docs/            Swagger/OpenAPI spec
```

## Setup

```bash
npm install
cp .env.example .env   # fill in DATABASE_URL and JWT_SECRET
npm run db:generate
npm run db:migrate
npm run dev
```

API runs at `http://localhost:4000`, Swagger docs at `http://localhost:4000/docs`.

## Design notes

**Spam filtering (Submit Tool):** enforced at write-time via Zod — minimum
description length, valid URL format, and a fixed category list. Bad
submissions are rejected with a 400 before they ever reach the database, so
`recent` and `popular` never need to filter junk — the data is clean by
construction.

**Popular Tools:** ranked using a Hacker-News-style time-decay formula —

```
score = upvote_count / (hours_since_created + 2) ^ gravity
```

computed directly in the SQL query via Drizzle's `sql` template, so old,
inactive tools naturally fall down the ranking even if they once had a lot of
upvotes, and there's no paid mechanism to override it.

**Related Tools:** same-category match, excluding the target tool itself,
ranked by upvote count. Because ranking is upvote-aware rather than a flat
category dump, two tools in different categories (or the same category but
very different popularity tiers) return visibly different related lists.

**Duplicate upvotes:** prevented at the database level via a unique
constraint on `(user_id, tool_id)` in the `upvotes` table, not just app logic —
insert and counter increment happen in a single transaction.

## API summary

| Method | Route                    | Auth | Description                      |
| ------ | ------------------------ | ---- | -------------------------------- |
| POST   | `/api/auth/register`     | —    | Register a new user              |
| POST   | `/api/auth/login`        | —    | Log in, receive JWT              |
| POST   | `/api/tools`             | ✓    | Submit a new tool                |
| GET    | `/api/tools/recent`      | —    | Most recently submitted tools    |
| GET    | `/api/tools/popular`     | —    | Tools ranked by time-decay score |
| GET    | `/api/tools/:id/related` | —    | Tools related to a given tool    |
| POST   | `/api/tools/:id/upvote`  | ✓    | Upvote a tool                    |
