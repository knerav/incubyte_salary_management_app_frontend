# API Contract

This document describes how the Next.js frontend consumes the Rails backend API.

All endpoints are prefixed with `/api/v1`. The base URL is configured via the `NEXT_PUBLIC_API_URL` environment variable (default: `http://localhost:3000`).

---

## Authentication

The backend uses a two-token scheme: a short-lived JWT for request authentication and a long-lived refresh token delivered in the response body.

### JWT

The JWT is returned in the `Authorization` **response header** on sign-in and must be sent as a Bearer token on every subsequent request:

```
Authorization: Bearer <token>
```

Tokens expire after 30 minutes. Requests without a valid token return `401 Unauthorized`.

### Refresh token

A refresh token is returned in the **response body** at `data.auth.refresh_token` on sign-in and on every successful refresh. The backend stores a SHA-256 digest of the token — the raw value is never persisted. Tokens are rotated on every use: the old record is deleted and a new one is created, giving a fresh 7-day window from the last activity.

### Token storage

The frontend stores the JWT in `localStorage` under the key `auth_token`, mirrored to a readable cookie so that `proxy.ts` (Next.js middleware) can check auth state for route protection.

The refresh token is stored in `localStorage` under the key `refresh_token` and is read and written explicitly by `lib/auth.ts`.

### TypeScript types

```ts
// lib/auth.ts interface
getToken(): string | null
setToken(token: string): void
clearToken(): void
getRefreshToken(): string | null
setRefreshToken(token: string): void
clearRefreshToken(): void
```

### 401 handling and automatic token refresh

When any API request returns `401`, the frontend:

1. Attempts a token refresh by calling `POST /api/v1/users/refresh` with `{ auth: { refresh_token: "<stored_token>" } }` in the body.
2. If the refresh succeeds, stores the new JWT and the rotated refresh token, then retries the original request.
3. If the refresh also returns `401` (refresh token expired or invalid), clears both stored tokens and redirects to `/sign-in`.

Concurrent `401` responses trigger only one refresh attempt. Subsequent failing requests are queued and replayed once the refresh resolves.

---

## Shared response conventions

**Validation errors (`422`):**

```json
{ "errors": { "field": ["message"] } }
```

**Not found (`404`):**

```json
{ "error": "Not found" }
```

**Unauthorized (`401`):**
The frontend attempts a token refresh (see above). If the refresh also fails, the stored token is cleared and the user is redirected to `/sign-in`.

---

## TypeScript types

```ts
// types/index.ts

type EmploymentType = "full_time" | "part_time" | "contract";

interface Employee {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  job_title: string;
  department: string;
  country: string;
  salary: string;
  currency: string;
  employment_type: EmploymentType;
  hired_on: string;
}

interface PaginationMeta {
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

interface EmployeeListResponse {
  employees: Employee[];
  meta: PaginationMeta;
}

interface EmployeeFormData {
  first_name: string;
  last_name: string;
  email: string;
  job_title_id: number;
  department_id: number;
  country: string;
  salary: string;
  currency: string;
  employment_type: EmploymentType;
  hired_on: string;
}

interface SalaryUpdateData {
  salary: string;
  currency: string;
}

interface JobTitle {
  id: number;
  name: string;
}

interface Department {
  id: number;
  name: string;
}

interface SalaryBreakdown {
  job_title: string;
  avg_salary: string;
}

interface SalaryInsights {
  filters: Record<string, string>;
  insights: {
    employee_count: number;
    min_salary: string;
    max_salary: string;
    avg_salary: string;
    currency_code: string; // e.g. "GBP", "USD" — derived from the country filter, defaults to "GBP"
    currency_symbol: string; // e.g. "£", "$" — use directly to format salary values
    breakdowns: SalaryBreakdown[];
  };
}

interface SalaryHistoryEntry {
  effective_from: string;
  salary: string;
  currency: string;
  change: string | null; // percentage change from previous entry; null for the first entry
}

interface SalaryHistoryResponse {
  salary_history: SalaryHistoryEntry[];
}

interface ApiValidationError {
  errors: Record<string, string[]>;
}

interface AuthResponse {
  auth: {
    refresh_token: string;
  };
}

interface Country {
  code: string; // ISO 3166-1 alpha-2
  name: string; // full display name
}
```

---

## Auth endpoints

### Sign in

```
POST /api/v1/users/sign_in
```

**Request body:**

```json
{ "user": { "email": "hr@company.com", "password": "Password1!" } }
```

**Response `200`:** Body contains `{ "auth": { "refresh_token": "<token>" } }`. JWT is in the `Authorization` response header.

**Frontend behaviour:** Extract the JWT from the `Authorization` header, call `setToken()`. Extract the refresh token from `data.auth.refresh_token`, call `setRefreshToken()`. Then redirect to `/employees`.

---

### Refresh token

```
POST /api/v1/users/refresh
```

**Request body:** `{ "auth": { "refresh_token": "<stored_token>" } }`. No `Authorization` header required.

**Response `200`:** Body contains `{ "auth": { "refresh_token": "<new_token>" } }`. New JWT is in the `Authorization` response header. Token rotation — the old record is deleted and a new one is created.

**Response `401`:** Refresh token is invalid, expired, or absent.

**Frontend behaviour:** Called automatically by `lib/api.ts` when a request returns `401`. On success, stores the new JWT via `setToken()`, stores the rotated refresh token via `setRefreshToken()`, and replays the original request. On failure, calls `clearToken()`, `clearRefreshToken()`, and redirects to `/sign-in`.

---

### Sign out

```
DELETE /api/v1/users/sign_out
```

**Request:** Bearer token in `Authorization` header. Body (optional): `{ "auth": { "refresh_token": "<stored_token>" } }` — including this invalidates the server-side record immediately rather than waiting for natural expiry.

**Response `200`:** `{ "message": "Signed out successfully." }`. The `refresh_tokens` record is deleted.

**Frontend behaviour:** Call `clearToken()` and `clearRefreshToken()`, then redirect to `/sign-in`.

---

## Employees

### List employees

```
GET /api/v1/employees
```

**Query parameters:**

| Parameter         | Type    | Description                    |
| ----------------- | ------- | ------------------------------ |
| `page`            | integer | Page number, default `1`       |
| `per_page`        | integer | Records per page, default `25` |
| `q`               | string  | Search by name                 |
| `country`         | string  | Filter by ISO 3166-1 alpha-2   |
| `department_id`   | integer | Filter by department           |
| `job_title_id`    | integer | Filter by job title            |
| `employment_type` | string  | Filter by employment type      |

**Response `200`:** `EmployeeListResponse`

---

### Get employee

```
GET /api/v1/employees/:id
```

**Response `200`:** `Employee`

**Response `404`:** `{ "error": "Not found" }`

---

### Create employee

```
POST /api/v1/employees
```

**Request body:** `EmployeeFormData`

**Response `201`:** `Employee`

**Response `422`:** `ApiValidationError`

---

### Update employee

```
PATCH /api/v1/employees/:id
```

**Request body:** Partial `EmployeeFormData`, excluding `salary` and `currency` — salary changes go through the dedicated salary endpoint.

**Response `200`:** `Employee`

**Response `422`:** `ApiValidationError`

---

### Update salary

```
PATCH /api/v1/employees/:id/salary
```

**Request body:** `SalaryUpdateData`

**Response `200`:** `Employee`

**Response `422`:** `ApiValidationError`

---

### Delete employee

```
DELETE /api/v1/employees/:id
```

**Response `204`:** No content.

**Response `404`:** `{ "error": "Not found" }`

---

### Get salary history

```
GET /api/v1/employees/:id/salary_history
```

Returns the full salary history for an individual employee, ordered chronologically. Kept as a separate endpoint rather than a nested field on the employee object so that list and show views don't pay the cost of loading history on every request.

**Response `200`:** `SalaryHistoryResponse`

```json
{
  "salary_history": [
    {
      "effective_from": "2022-03-14",
      "salary": "95000.00",
      "currency": "USD",
      "change": null
    },
    {
      "effective_from": "2023-01-01",
      "salary": "105000.00",
      "currency": "USD",
      "change": "+10.53%"
    }
  ]
}
```

`change` is the percentage change from the preceding entry. The first entry is always `null`.

**Response `404`:** `{ "error": "Not found" }`

---

## Job Titles

These endpoints are required by the Settings page (job title management) and by the employee form (populating the job title dropdown).

### List job titles

```
GET /api/v1/job_titles
```

**Response `200`:**

```json
{ "job_titles": [{ "id": 1, "name": "Software Engineer" }] }
```

### Create job title

```
POST /api/v1/job_titles
```

**Request body:** `{ "name": "Product Manager" }`

**Response `201`:** `{ "id": 2, "name": "Product Manager" }`

**Response `422`:** `ApiValidationError`

### Update job title

```
PATCH /api/v1/job_titles/:id
```

**Request body:** `{ "name": "Senior Product Manager" }`

**Response `200`:** Updated `JobTitle`.

**Response `422`:** `ApiValidationError`

### Delete job title

```
DELETE /api/v1/job_titles/:id
```

**Response `204`:** No content.

**Response `422`:** `{ "errors": { "base": ["Cannot delete a job title assigned to employees"] } }`

---

## Departments

Parallel to Job Titles. Required by the Settings page and the employee form dropdown.

### List departments

```
GET /api/v1/departments
```

**Response `200`:**

```json
{ "departments": [{ "id": 1, "name": "Engineering" }] }
```

### Create department

```
POST /api/v1/departments
```

**Request body:** `{ "name": "Design" }`

**Response `201`:** `{ "id": 2, "name": "Design" }`

**Response `422`:** `ApiValidationError`

### Update department

```
PATCH /api/v1/departments/:id
```

**Request body:** `{ "name": "Product Design" }`

**Response `200`:** Updated `Department`.

**Response `422`:** `ApiValidationError`

### Delete department

```
DELETE /api/v1/departments/:id
```

**Response `204`:** No content.

**Response `422`:** `{ "errors": { "base": ["Cannot delete a department assigned to employees"] } }`

---

## Countries

### List countries

```
GET /api/v1/countries
```

Returns only countries that have at least one active (non-deleted) employee. Use this to populate country filter dropdowns — not the full ISO list.

**Response `200`:**

```json
{
  "countries": [
    { "code": "GB", "name": "United Kingdom" },
    { "code": "US", "name": "United States" }
  ]
}
```

`code` is the ISO 3166-1 alpha-2 value to send as the `country` query parameter. `name` is the full display name, sorted alphabetically.

---

## Insights

### Current salary insights

```
GET /api/v1/insights/salary
```

**Query parameters:**

| Parameter       | Type    | Description          |
| --------------- | ------- | -------------------- |
| `country`       | string  | Filter by country    |
| `department_id` | integer | Filter by department |
| `job_title_id`  | integer | Filter by job title  |

**Response `200`:** `SalaryInsights`

`currency_code` and `currency_symbol` are derived from the `country` filter, defaulting to `IN`/`INR`/`₹` when no country is selected. The frontend uses these directly to format salary values without its own currency lookup.
