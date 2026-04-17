# Architecture Decisions

These are the non-obvious decisions I made while designing this system, and my reasoning behind each one.

---

## Single Rails monolith serving both JSON and HTML

The assignment calls for a Rails backend (for my JD) and a React frontend, which could naturally be read as two separate applications. I chose instead to have a single Rails app serve both — using `respond_to` in controllers to render HTML for the Hotwire frontend and JSON for the Next.js frontend. Business logic lives once; only the rendering layer branches.

In practice, I wouldn't pair a Rails monolith with a React frontend — Hotwire handles that need without introducing a separate application. The React frontend is here solely to demonstrate that I'm comfortable working in both models.

---

## PostgreSQL over SQLite

The spec lists SQLite as a viable option, but I opted for PostgreSQL. With 10,000 employees and aggregation queries across multiple dimensions, PostgreSQL handles concurrent reads and `GROUP BY` queries more reliably. It also makes the deployed application feel production-grade rather than a prototype. The setup overhead compared to SQLite is negligible for any Rails developer.

---

## Soft delete via `deleted_at`

When an HR Manager deletes an employee, a hard delete would permanently remove the row — and silently distort all historical insight calculations retroactively. Instead, employees are soft deleted by setting a `deleted_at` timestamp. A Rails default scope excludes them from all queries automatically, and the data is retained for historical accuracy.

A side benefit: restoring a deleted employee is trivial — just nullify `deleted_at`.

---

## Two-token authentication: JWT + refresh token in body

The JWT alone is sufficient for stateless authentication, but a 30-minute expiry forces the user to re-enter credentials frequently if nothing rotates it. A refresh token solves this without weakening security.

The design uses two tokens with different lifetimes:

- **JWT** (30 min) — short-lived, sent by the client in the `Authorization` header on every request. If intercepted, the exposure window is at most 30 minutes.
- **Refresh token** (7 days) — long-lived, stored server-side as a SHA-256 digest in the `refresh_tokens` table. Delivered in the response body at `data.auth.refresh_token` on sign-in and on every refresh. The frontend stores it in `localStorage`.

We store a SHA-256 digest rather than the raw token. If the database is compromised, the digests cannot be reversed to valid tokens.

Refresh tokens are rotated on every use: the old record is deleted and a new one is created. This gives each token a fresh 7-day window from the last refresh — a user who is active stays signed in indefinitely; a user who is inactive for 7 days must sign in again. It also means a stolen refresh token can only be used once before it is invalidated by the legitimate user's next refresh.

The refresh endpoint does not require a valid JWT — its purpose is to issue a new JWT after the previous one has expired. The refresh token in the request body is the sole credential.

Sign-out accepts the refresh token in the request body to delete the `refresh_tokens` record server-side, invalidating the session immediately rather than waiting for natural expiry.

**Trade-off:** Storing the refresh token in `localStorage` means a successful XSS attack could read it. An `HttpOnly` cookie is the stronger model, but it requires careful CORS configuration when the frontend and backend are on different origins. Since both tokens are in `localStorage`, the security properties are symmetric — the benefit of an in-memory JWT disappears when the refresh token is equally accessible. For a production deployment, moving to `HttpOnly` cookies (with a properly configured CORS setup or a same-origin reverse proxy) would be the recommended upgrade.

---

## Dedicated salary update endpoint

Salary changes need to be written to `salary_histories` to support time-series insights. If salary were editable through the general `PATCH /employees/:id` endpoint, it would be possible to change a salary without recording the history — either by accident or oversight. To make that impossible, I exclude salary from the general update endpoint entirely. The dedicated `PATCH /employees/:id/salary` endpoint is the only write path to `salary_histories`, making history recording structural rather than procedural.

The `effective_from` date defaults to today — it is derived automatically from `Date.today` when the salary history record is written, rather than being supplied by the caller. Backdated salary changes are not supported through the UI at this stage.

---

## `salary_histories` as an append-only log

The `employees` table only holds the current salary. To support time-series insights — average salary over time by country, department, or job title — I added a `salary_histories` table that records each salary change as an immutable row, written once and never updated.

This is a lightweight alternative to full event sourcing. It's sufficient for the read patterns required here, and I populate it with synthetic historical records in the seed script to make the feature demonstrable.

---

## Flat JSON responses over JSON:API

The Rails ecosystem has a strong convention around the `jsonapi-serializer` gem and the JSON:API specification. I chose a flat JSON format instead, with PORO serializer classes handling the response shape.

The main reason is fit: my insights endpoints return aggregations, not records, and don't map cleanly to the JSON:API resource model. The flat format is also simpler for the Next.js frontend to consume without unwrapping a `data.attributes` envelope. For a larger system with multiple resources and complex relationships, `jsonapi-serializer` would be the right call — this is a deliberate tradeoff, not an oversight.

---

## Server-side filtering and pagination

With 10,000 employees, fetching the full dataset and filtering in the browser is wasteful. I handle all filtering (`country`, `department`, `job_title`, `employment_type`, name search) and pagination server-side via query parameters. The indexes on filterable columns are load-bearing — the queries degrade without them.

---

## JobTitle as a managed reference table

The employee record originally stored job title as free text. That creates a data quality problem: "Software Engineer", "software engineer", and "Softwre Engineer" are treated as three distinct dimensions in insight groupings, silently distorting averages and counts.

To prevent this, job titles are managed by HR Managers as a separate reference table. Employees reference a `job_title_id` foreign key rather than entering text directly. The unique constraint on `job_titles.name` enforces a single canonical form per title, and the `countries` gem resolves the display name at runtime so the UI always shows the full title without storing redundant string data on each employee row.

This also prevents orphaned references — deleting a job title that still has employees assigned is blocked at the model layer, keeping the reference data consistent.

The same approach applies to `department`. Free-text department names carry the same data quality risk, so `department_id` replaces the original `department` varchar on employees. Both job titles and departments are managed from a Company Settings page in the UI, keeping reference data management in one place rather than buried inside the employee form.

---

## Bulk upsert for the seed script

The spec says engineers run the seed script regularly, and that performance matters. A naïve row-by-row insert of 10,000 employees is slow, and running it twice doubles the count. Instead, I use Rails' `upsert_all`, keyed on `email`, so a single database round-trip inserts or updates all 10,000 rows. The script is idempotent by design — running it any number of times produces the same result.
