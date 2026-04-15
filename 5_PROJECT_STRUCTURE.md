# Project Structure

Two repositories — a Rails monolith and a Next.js frontend — each in their own repo. This document covers both, but the Next.js section reflects the actual structure of this repository.

---

## Rails App

_(Unchanged from the original document — see the Rails repo for details.)_

```
incubyte-salary-management/
├── app/
│   ├── controllers/
│   │   ├── application_controller.rb
│   │   ├── pages_controller.rb
│   │   ├── job_titles_controller.rb
│   │   ├── departments_controller.rb
│   │   ├── employees_controller.rb
│   │   ├── insights_controller.rb
│   │   └── api/
│   │       └── v1/
│   │           ├── base_controller.rb
│   │           ├── job_titles_controller.rb      ← to be added
│   │           ├── departments_controller.rb     ← to be added
│   │           ├── employees_controller.rb
│   │           ├── auth/
│   │           │   ├── sessions_controller.rb
│   │           │   └── registrations_controller.rb
│   │           └── insights/
│   │               └── salary_controller.rb
│   ├── models/
│   ├── serializers/
│   ├── services/
│   └── views/
└── ...
```

---

## Next.js App

```
salary-management-frontend-app/
├── app/                              ← Next.js App Router
│   ├── layout.tsx                    ← Root layout: wraps app in AuthProvider, renders Navbar
│   ├── page.tsx                      ← Redirects to /employees (or /sign-in if unauthenticated)
│   ├── sign-in/
│   │   └── page.tsx                  ← Sign-in form
│   ├── employees/
│   │   ├── page.tsx                  ← Employee list: search, filters, paginated table
│   │   ├── new/
│   │   │   └── page.tsx              ← Add employee form
│   │   └── [id]/
│   │       ├── page.tsx              ← Employee profile: details + salary update form
│   │       └── edit/
│   │           └── page.tsx          ← Edit employee form (general fields only)
│   ├── insights/
│   │   └── page.tsx                  ← Salary insights: filter bar, stats panel, history chart
│   └── settings/
│       ├── page.tsx                  ← Settings hub: cards linking to Job Titles and Departments
│       ├── job-titles/
│       │   └── page.tsx              ← Job title CRUD
│       └── departments/
│           └── page.tsx              ← Department CRUD
│
├── components/
│   ├── layout/
│   │   └── Navbar.tsx                ← Nav links + sign-out button (client component)
│   ├── employees/
│   │   ├── EmployeeTable.tsx         ← Paginated table with sort columns
│   │   ├── EmployeeFilters.tsx       ← Search + filter bar (name, country, dept, title, type)
│   │   ├── EmployeeForm.tsx          ← Shared create/edit form
│   │   ├── SalaryUpdateForm.tsx      ← Dedicated salary update form (own endpoint)
│   │   └── DeleteEmployeeButton.tsx  ← Confirms then soft-deletes
│   ├── insights/
│   │   ├── InsightsFilters.tsx       ← Country / dept / job title filter bar
│   │   ├── SalaryInsightsPanel.tsx   ← Min/max/avg + breakdown table
│   │   └── SalaryHistoryChart.tsx    ← Line chart via Chart.js (client component)
│   └── settings/
│       ├── JobTitleManager.tsx       ← Inline list with add/edit/delete
│       └── DepartmentManager.tsx     ← Inline list with add/edit/delete
│
├── contexts/
│   └── AuthContext.tsx               ← Provides { token, signIn, signOut } to the client tree
│
├── lib/
│   ├── auth.ts                       ← getToken / setToken / clearToken (localStorage wrapper)
│   └── api.ts                        ← Typed fetch wrappers for all API endpoints
│
├── types/
│   └── index.ts                      ← Shared TypeScript types (Employee, SalaryInsights, etc.)
│
├── middleware.ts                      ← Redirects unauthenticated requests to /sign-in
│
├── __tests__/
│   ├── lib/
│   │   ├── auth.test.ts
│   │   └── api.test.ts
│   └── components/
│       ├── employees/
│       │   ├── EmployeeTable.test.tsx
│       │   ├── EmployeeFilters.test.tsx
│       │   ├── EmployeeForm.test.tsx
│       │   └── SalaryUpdateForm.test.tsx
│       ├── insights/
│       │   ├── SalaryInsightsPanel.test.tsx
│       │   └── SalaryHistoryChart.test.tsx
│       └── settings/
│           ├── JobTitleManager.test.tsx
│           └── DepartmentManager.test.tsx
│
├── jest.config.ts
├── jest.setup.ts
├── next.config.ts
├── tsconfig.json
└── package.json
```

---

## Design notes

### All pages are Client Components

Every page in this app requires an authenticated user, and the JWT is stored client-side in `localStorage`. Rather than threading the token through server-side fetch calls, all data fetching happens in Client Components using the `api.ts` client. This is a deliberate tradeoff: it keeps the auth model simple and consistent at the cost of losing server-side rendering for these pages.

### `"use client"` boundary placement

The `"use client"` directive is placed at the component level, not the page level, wherever possible. For example, `Navbar.tsx` is a Client Component (it reads auth state and handles sign-out), but the layouts that render it remain Server Components and pass `children` through as a slot.

The exceptions are pages that manage their own data-fetching state — those are Client Components in their entirety.

### `params` and `searchParams` are Promises (Next.js 16)

Dynamic route segments (`[id]`) receive `params` as `Promise<{ id: string }>`. All dynamic pages unwrap them with `await params` before use.

### Centralised API client

All fetch calls go through `lib/api.ts`. The base URL, `Authorization` header injection, and error normalisation (including `401` → sign-out) are handled once rather than repeated across components.

### Middleware-based route protection

`middleware.ts` checks for the presence of an `auth_token` cookie on every request to a protected route (anything except `/sign-in`). If absent, it redirects to `/sign-in`. Client-side, `AuthContext` also guards against stale renders if the token is missing from `localStorage`.

> **Note on token storage:** The JWT is stored in `localStorage` and mirrored to a cookie solely so that `middleware.ts` can read it server-side for redirect protection. The cookie is not httpOnly — the security model here is appropriate for an internal HR tool on a trusted network, and trades simplicity for the marginally stronger XSS protection that httpOnly would provide.
