# API Contract

This document describes how the Next.js frontend consumes the Rails backend API.

All endpoints are prefixed with `/api/v1`. The base URL is configured via the `NEXT_PUBLIC_API_URL` environment variable (default: `http://localhost:3000`).

---

## Authentication

The backend uses a two-token scheme: a short-lived JWT for request authentication and a long-lived refresh token delivered via an `HttpOnly` cookie.

### JWT

The JWT is returned in the `Authorization` **response header** on sign-in and must be sent as a Bearer token on every subsequent request:

```
Authorization: Bearer <token>
```

Tokens expire after 30 minutes. Requests without a valid token return `401 Unauthorized`.

### Refresh token

A refresh token is set as an `HttpOnly` cookie at sign-in:

- **Name:** `refresh_token`
- **HttpOnly:** `true` — JavaScript cannot read or exfiltrate it
- **SameSite:** `Strict` — blocks CSRF from cross-origin requests
- **Path:** `/api/v1/users/refresh` — the cookie is only sent to the refresh endpoint, not to any other API request
- **Max-Age:** 7 days

The backend stores a SHA-256 digest of the token — the raw value is never persisted.

### Token storage

The frontend stores the JWT in `localStorage` under the key `auth_token`. A thin `lib/auth.ts` module wraps all reads and writes so storage can be swapped without touching call sites, and so tests can mock it cleanly.

The refresh token is managed entirely by the browser via the `Set-Cookie` header — the frontend never reads or writes it directly.

### TypeScript types

```ts
// lib/auth.ts interface
getToken(): string | null
setToken(token: string): void
clearToken(): void
```

### 401 handling and automatic token refresh

When any API request returns `401`, the frontend:

1. Attempts a token refresh by calling `POST /api/v1/users/refresh`.
2. If the refresh succeeds, replaces the stored JWT with the new one and retries the original request.
3. If the refresh also returns `401` (refresh token expired or invalid), clears the stored JWT and redirects to `/sign-in`.

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
    breakdowns: SalaryBreakdown[];
  };
}

interface HistoricalSalaryPoint {
  period: string;
  avg_salary: string;
  employee_count: number;
}

interface HistoricalSalaryInsights {
  filters: Record<string, string>;
  group_by: "month" | "quarter" | "year";
  series: HistoricalSalaryPoint[];
}

interface ApiValidationError {
  errors: Record<string, string[]>;
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

**Response `200`:** Empty body. JWT is in the `Authorization` response header. Refresh token is in the `Set-Cookie` response header (`HttpOnly`, `SameSite=Strict`, `Path=/api/v1/users/refresh`, 7-day `Max-Age`).

**Frontend behaviour:** Extract the token from the `Authorization` header, call `setToken()`, then redirect to `/employees`. The browser stores the refresh token cookie automatically.

---

### Refresh token

```
POST /api/v1/users/refresh
```

**Request:** No `Authorization` header required. The browser sends the `HttpOnly` refresh token cookie automatically (scoped to this path).

**Response `200`:** Empty body. New JWT is in the `Authorization` response header. A new refresh token cookie is set (token rotation — the old record is deleted and a new one is created).

**Response `401`:** Refresh token is invalid, expired, or absent.

**Frontend behaviour:** Called automatically by `lib/api.ts` when a request returns `401`. On success, stores the new JWT via `setToken()` and replays the original request. On failure, calls `clearToken()` and redirects to `/sign-in`.

---

### Sign out

```
DELETE /api/v1/users/sign_out
```

**Request:** Bearer token in `Authorization` header.

**Response `200`:** `{ "message": "Signed out successfully." }`. The `refresh_tokens` record is deleted and the refresh token cookie is cleared (`Max-Age=0`).

**Frontend behaviour:** Call `clearToken()`, then redirect to `/sign-in`. The browser removes the refresh token cookie automatically.

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

---

### Historical salary insights

```
GET /api/v1/insights/salary/history
```

**Query parameters:**

| Parameter       | Type    | Description                                           |
| --------------- | ------- | ----------------------------------------------------- |
| `country`       | string  | Filter by country                                     |
| `department_id` | integer | Filter by department                                  |
| `job_title_id`  | integer | Filter by job title                                   |
| `from`          | date    | Start of date range, default 12 months ago            |
| `to`            | date    | End of date range, default today                      |
| `group_by`      | string  | Grouping period: `month` (default), `quarter`, `year` |

**Response `200`:** `HistoricalSalaryInsights`
