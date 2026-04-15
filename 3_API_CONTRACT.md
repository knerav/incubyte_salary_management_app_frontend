# API Contract

This document describes how the Next.js frontend consumes the Rails backend API.

All endpoints are prefixed with `/api/v1`. The base URL is configured via the `NEXT_PUBLIC_API_URL` environment variable (default: `http://localhost:3000`).

---

## Authentication

The backend uses JWT issued by `devise-jwt`. The token is returned in the `Authorization` **response header** on sign-in and must be sent as a Bearer token on every subsequent request:

```
Authorization: Bearer <token>
```

Tokens expire after 30 minutes. Requests without a valid token return `401 Unauthorized`.

### Token storage

The frontend stores the JWT in `localStorage` under the key `auth_token`. A thin `lib/auth.ts` module wraps all reads and writes so storage can be swapped without touching call sites, and so tests can mock it cleanly.

### TypeScript types

```ts
// lib/auth.ts interface
getToken(): string | null
setToken(token: string): void
clearToken(): void
```

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
The frontend clears the stored token and redirects to `/sign-in`.

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

**Response `200`:** Empty body. JWT is in the `Authorization` response header.

**Frontend behaviour:** Extract the token from the `Authorization` header, call `setToken()`, then redirect to `/employees`.

---

### Sign out

```
DELETE /api/v1/users/sign_out
```

**Request:** Bearer token in `Authorization` header.

**Response `200`:** `{ "message": "Signed out successfully." }`

**Frontend behaviour:** Call `clearToken()`, then redirect to `/sign-in`.

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

> **Note:** These endpoints need to be added to the Rails API layer alongside the existing Hotwire `resources :job_titles` routes.

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

> **Note:** These endpoints need to be added to the Rails API layer alongside the existing Hotwire `resources :departments` routes.

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
