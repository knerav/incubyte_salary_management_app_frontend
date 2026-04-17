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
│   │           ├── job_titles_controller.rb
│   │           ├── departments_controller.rb
│   │           ├── employees_controller.rb
│   │           ├── auth/
│   │           │   ├── sessions_controller.rb    ← sign-in (issues JWT + refresh token in body), sign-out (invalidates refresh token), refresh (rotates refresh token)
│   │           │   └── registrations_controller.rb
│   │           └── insights/
│   │               └── salary_controller.rb
│   ├── models/
│   │   ├── refresh_token.rb                      ← stores SHA-256 digest, belongs_to :user
│   │   └── ...
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
│   ├── page.tsx                      ← Redirects to /employees via useRouter().replace
│   ├── sign-in/
│   │   └── page.tsx                  ← Sign-in form
│   ├── employees/
│   │   ├── page.tsx                  ← Employee list: filter bar, table, pagination, add/edit/show modals, two-step delete
│   │   ├── new/
│   │   │   └── page.tsx              ← Standalone add employee form (route exists; add is also available as a modal from the list)
│   │   └── [id]/
│   │       ├── page.tsx              ← Employee profile: details, salary history table, salary update form
│   │       └── edit/
│   │           └── page.tsx          ← Standalone edit employee form (route exists; edit is also available as a modal from the list)
│   ├── insights/
│   │   └── page.tsx                  ← Salary insights: filter bar, stats panel (aggregate view only)
│   └── settings/
│       └── page.tsx                  ← Job title and department CRUD in a single page
│
├── components/
│   ├── layout/
│   │   └── Navbar.tsx                ← Nav links + sign-out button (client component)
│   ├── employees/
│   │   ├── EmployeeTable.tsx         ← Table; accepts onSelect/onEdit callbacks (render buttons) or falls back to Links
│   │   ├── EmployeeFilters.tsx       ← Labelled search + filter bar (q, dept, title, employment type)
│   │   ├── EmployeeForm.tsx          ← Shared create/edit form with validation errors (ShadCN components)
│   │   ├── SalaryUpdateForm.tsx      ← Dedicated salary update form (PATCH /salary endpoint)
│   │   ├── SalaryHistoryTable.tsx    ← Chronological salary history table (GET /employees/:id/salary_history)
│   │   └── DeleteEmployeeButton.tsx  ← Delete button with inline confirmation dialog
│   ├── insights/
│   │   └── SalaryInsightsPanel.tsx   ← Min/max/avg stats + breakdown table
│   ├── settings/
│   │   ├── JobTitleManager.tsx       ← Inline list with add/edit/delete
│   │   └── DepartmentManager.tsx     ← Inline list with add/edit/delete
│   └── ui/
│       └── pagination.tsx            ← Previous/Next + page number buttons; hidden when totalPages ≤ 1
│
├── contexts/
│   └── AuthContext.tsx               ← Provides { token, signIn, signOut } to the client tree
│
├── lib/
│   ├── auth.ts                       ← JWT and refresh token storage (getToken/setToken/clearToken + getRefreshToken/setRefreshToken/clearRefreshToken)
│   └── api.ts                        ← Typed fetch wrappers for all API endpoints
│
├── types/
│   └── index.ts                      ← Shared TypeScript types (Employee, SalaryInsights, etc.)
│
├── proxy.ts                          ← Redirects unauthenticated requests to /sign-in
│
├── __tests__/
│   ├── lib/
│   │   ├── auth.test.ts
│   │   └── api.test.ts
│   ├── components/
│   │   ├── layout/
│   │   │   └── Navbar.test.tsx
│   │   ├── auth/
│   │   │   └── SignInForm.test.tsx
│   │   ├── employees/
│   │   │   ├── EmployeeTable.test.tsx
│   │   │   ├── EmployeeFilters.test.tsx
│   │   │   ├── EmployeeForm.test.tsx
│   │   │   ├── SalaryUpdateForm.test.tsx
│   │   │   ├── SalaryHistoryTable.test.tsx
│   │   │   └── DeleteEmployeeButton.test.tsx
│   │   ├── insights/
│   │   │   └── SalaryInsightsPanel.test.tsx
│   │   └── settings/
│   │       ├── JobTitleManager.test.tsx
│   │       └── DepartmentManager.test.tsx
│   └── app/
│       ├── page.test.tsx
│       ├── employees/
│       │   ├── page.test.tsx
│       │   ├── new/
│       │   │   └── page.test.tsx
│       │   └── [id]/
│       │       ├── page.test.tsx
│       │       └── edit/
│       │           └── page.test.tsx
│       ├── insights/
│       │   └── page.test.tsx
│       └── settings/
│           └── page.test.tsx
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

### Dynamic route params in Client Components

Next.js 16 delivers `params` as a `Promise<{ id: string }>`. Since all pages in this app are Client Components, params are accessed via `useParams()` from `next/navigation` rather than `use(params)`. This keeps the components straightforward and easier to test — the `next/navigation` mock simply returns the id directly without needing Suspense boundaries.

### Centralised API client

All fetch calls go through `lib/api.ts`. The base URL, `Authorization` header injection, and error normalisation are handled once rather than repeated across components. On a `401` response, `api.ts` automatically attempts a token refresh via `POST /api/v1/users/refresh`. If the refresh succeeds, the original request is retried with the new JWT. If it fails, `clearToken()` is called and the user is redirected to `/sign-in`. Concurrent `401`s trigger only one refresh attempt — subsequent requests queue and replay after the refresh resolves.

The `_navigate` export (`{ to: (path: string) => void }`) wraps `window.location.href` assignment so tests can spy on redirects without touching jsdom's non-configurable `window.location`.

### Middleware-based route protection

`proxy.ts` checks for the presence of an `auth_token` cookie on every request to a protected route (anything except `/sign-in`). If absent, it redirects to `/sign-in`. Client-side, `AuthContext` also guards against stale renders if the token is missing from `localStorage`.

> **Note on token storage:** The JWT is stored in `localStorage` under `auth_token` and mirrored to a readable cookie of the same name so that `proxy.ts` can check it server-side (middleware cannot access `localStorage`). The refresh token is stored in `localStorage` under `refresh_token` and is read and written explicitly by `lib/auth.ts`. Both tokens are in JavaScript-readable storage — see `4_ARCHITECTURE_DECISIONS.md` for the trade-off discussion.
