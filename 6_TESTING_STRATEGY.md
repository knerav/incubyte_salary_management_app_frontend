# Testing Strategy

The assignment asks for tests that are fast, deterministic, and easy to understand. For the Next.js frontend I'm following the same strict TDD cycle as the Rails backend — red, green, refactor — using Jest and React Testing Library.

---

## Framework and tooling

| Tool                              | Role                                                                                |
| --------------------------------- | ----------------------------------------------------------------------------------- |
| **Jest 30**                       | Test runner and assertion library                                                   |
| **React Testing Library (RTL)**   | Component rendering and user interaction                                            |
| **`@testing-library/user-event`** | Realistic user interaction simulation (preferred over `fireEvent`)                  |
| **`@testing-library/jest-dom`**   | DOM-specific matchers (`toBeInTheDocument`, `toHaveValue`, etc.)                    |
| **`jest-environment-jsdom`**      | Browser-like DOM environment for component tests                                    |
| **`next/jest`**                   | Next.js transformer — handles path aliases, SWC compilation, and CSS module mocking |

Tests live in `__tests__/`, mirroring the source structure (`__tests__/lib/`, `__tests__/components/`, `__tests__/app/`).

---

## TDD cycle

Every piece of behaviour is written test-first:

1. **Red** — write a test that describes the desired behaviour and watch it fail.
2. **Green** — write the minimum code to make the test pass.
3. **Refactor** — clean up the implementation without breaking the test.

---

## What I'm testing and in what order

### 1. `lib/auth.ts` — token storage utility

The simplest unit: pure functions wrapping `localStorage`. Tests mock `localStorage` and verify all six functions (`getToken`, `setToken`, `clearToken`, `getRefreshToken`, `setRefreshToken`, `clearRefreshToken`) behave correctly, including the case where `localStorage` is unavailable (SSR guard).

### 2. `lib/api.ts` — typed API client

The API client is tested by mocking the global `fetch`. Tests verify:

- The correct URL and method are called for each endpoint.
- The `Authorization` header is included when a token is present and absent when it is not.
- A `401` response triggers a refresh attempt (`POST /api/v1/users/refresh`) with the stored refresh token in the request body.
- On a successful refresh, the new JWT and rotated refresh token are stored and the original request is retried.
- A `401` on the refresh itself calls `clearToken`, `clearRefreshToken`, and redirects to `/sign-in`.
- Concurrent `401` responses only trigger one refresh attempt, not multiple.
- A `422` response surfaces the `errors` object.
- On sign-in, the JWT is extracted from the `Authorization` response header and the refresh token is extracted from `data.auth.refresh_token`.
- Sign-out sends the refresh token in the request body and calls `clearRefreshToken`.

Redirects are asserted by spying on the `_navigate.to` export rather than `window.location` (which jsdom does not allow reassignment of).

These tests do not hit the network. They are fast and deterministic.

### 3. Components — `components/`

Components are tested with RTL, rendering them with controlled props and simulating user interactions with `userEvent`.

**What component tests cover:**

- The component renders the expected content given its props (snapshot-free: assertions use `getByRole`, `getByText`, `getByLabelText` etc. — not class names or IDs).
- User interactions trigger the correct callbacks (e.g. clicking "Delete" calls the `onDelete` prop).
- Loading and error states are rendered correctly.
- Form components show validation errors when the server returns a `422`.
- Filter components call `onChange` with updated filter values on each interaction.

**What component tests do not cover:**

- CSS and visual correctness — Tailwind classes are not asserted on.

### 4. Pages — `app/`

Pages are tested with the same RTL setup as components, but the API module is mocked with `jest.mock("@/lib/api", ...)` so that data-fetching calls can be stubbed and verified.

**What page tests cover:**

- The page renders the expected heading and primary UI after the initial data fetch resolves.
- `useEffect` data-fetching calls are made with the correct arguments on mount.
- Mutations (create, update, delete) trigger a refetch so that the UI stays in sync with the server.
- Modal open/close behaviour — for example, the add/edit employee dialogs on the employees list page.
- Navigation after a mutation where applicable — for example, a successful salary update on the employee profile page.

**Mocking patterns:**

- `next/navigation` is mocked to provide `useRouter` (`push`, `replace`) and `useParams` (returns the relevant `id`). This avoids Suspense complications that arise from using `use(params)` in a test environment.
- `@/lib/countries` is mocked in any test that renders `EmployeeForm` to avoid loading the full 250-country ISO dataset. The mock returns a small fixed list (`GB`, `IN`, `US`) and a matching currency map, keeping tests fast and deterministic.

### 5. What I'm not testing

- Next.js routing — the framework guarantees that `app/employees/page.tsx` is served at `/employees`.
- Third-party library internals — `chart.js`, `react-chartjs-2`, fetch behaviour.
- Anything already covered by TypeScript — if a type error would catch it, a test adds no value.

---

## Test naming

Test names are plain descriptions of behaviour, not implementation details:

```ts
// Good
it("shows a validation error when the email is already taken");

// Less useful
it("renders error state");
```

Each test sets up only what it needs. A test for filtering employees by country does not need a salary or hire date — only the fields the filter logic touches.

---

## Running tests

```bash
npm test              # run all tests once
npm run test:watch    # watch mode — re-runs affected tests on save
npm run test:coverage # coverage report
```
