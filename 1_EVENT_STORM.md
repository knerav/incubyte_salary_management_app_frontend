> Please note: This document is shared with the backend application and is an exact mirror. If you've read this document on the backend app you're up to date with it already.

# Event Storm

In this document, I'd like share how I translate business requirements into the broad design of the system. I like following a mix of BDUF (Big design up front), and event storming to give an initial "shape" to the project. This approach has always helped me talk through business requirements and translate them to specs effectively, especially with a physical audience.

To recap my understanding of the system at hand, it's is a salary management tool for an organisation with 10,000 employees. The sole user persona is an **HR Manager** who needs to manage employee records and derive salary insights across countries and job titles.

---

### Domain Events

**Authentication domain:**

- `UserRegistered`
- `UserSignedIn`
- `UserSignedOut`
- `UserPasswordResetRequested`
- `UserPasswordReset`

**Job Title domain:**

- `JobTitleAdded`
- `JobTitleUpdated`
- `JobTitleDeleted`

**Department domain:**

- `DepartmentAdded`
- `DepartmentUpdated`
- `DepartmentDeleted`

**Employee domain:**

- `EmployeeAdded`
- `EmployeeUpdated`
- `EmployeeSalaryUpdated`
- `EmployeeDeleted`
- `EmployeeProfileViewed`
- `EmployeeListViewed`
- `EmployeeListFiltered`

**Insights domain:**

- `SalaryInsightsViewed`
- `HistoricalSalaryInsightsViewed`

**System:**

- `SalaryHistoryRecorded`
- `EmployeeDataSeeded`
- `DefaultUserSeeded`

> Please note: I separated `EmployeeSalaryUpdated` from `EmployeeUpdated` deliberately as I feel that salary changes carry more business significance than other field updates.

---

### Event Timeline

```
[DefaultUserSeeded] ──► [UserRegistered]
        │                      │
        └──────────┬───────────┘
                   ▼
             [UserSignedIn]
                   │
                   ▼
[JobTitleAdded] ──► [JobTitleUpdated]
                    [JobTitleDeleted]
[DepartmentAdded] ─► [DepartmentUpdated]
                    [DepartmentDeleted]
                   │
                   ▼
[EmployeeDataSeeded]
        │
        ▼
[EmployeeAdded] ──► [EmployeeListViewed] ──► [EmployeeProfileViewed]
        │                    │
        ▼                    ▼
[EmployeeUpdated]    [EmployeeListFiltered] ──► [SalaryInsightsViewed]
[EmployeeDeleted]                               [HistoricalSalaryInsightsViewed]

[EmployeeSalaryUpdated] ──► [SalaryHistoryRecorded]

[UserSignedOut]
[UserPasswordResetRequested] ──► [UserPasswordReset]
```

The authentication domain is a prerequisite — no job title, employee, or insight commands are reachable without a signed-in user. Job titles and departments are a prerequisite for adding employees — an employee must be assigned to an existing job title. `SalaryHistoryRecorded` is fired automatically as a side effect of `EmployeeSalaryUpdated` (most likely through a callback).

---

### Commands

| Command                        | Triggers Event                   | Actor            |
| ------------------------------ | -------------------------------- | ---------------- |
| `RegisterUser`                 | `UserRegistered`                 | _HR Manager_     |
| `SignIn`                       | `UserSignedIn`                   | _HR Manager_     |
| `SignOut`                      | `UserSignedOut`                  | _HR Manager_     |
| `RequestPasswordReset`         | `UserPasswordResetRequested`     | _HR Manager_     |
| `ResetPassword`                | `UserPasswordReset`              | _HR Manager_     |
| `AddJobTitle`                  | `JobTitleAdded`                  | _HR Manager_     |
| `UpdateJobTitle`               | `JobTitleUpdated`                | _HR Manager_     |
| `DeleteJobTitle`               | `JobTitleDeleted`                | _HR Manager_     |
| `AddDepartment`                | `DepartmentAdded`                | _HR Manager_     |
| `UpdateDepartment`             | `DepartmentUpdated`              | _HR Manager_     |
| `DeleteDepartment`             | `DepartmentDeleted`              | _HR Manager_     |
| `AddEmployee`                  | `EmployeeAdded`                  | _HR Manager_     |
| `UpdateEmployee`               | `EmployeeUpdated`                | _HR Manager_     |
| `UpdateSalary`                 | `EmployeeSalaryUpdated`          | _HR Manager_     |
| `DeleteEmployee`               | `EmployeeDeleted`                | _HR Manager_     |
| `ViewEmployee`                 | `EmployeeProfileViewed`          | _HR Manager_     |
| `ListEmployees`                | `EmployeeListViewed`             | _HR Manager_     |
| `FilterEmployees`              | `EmployeeListFiltered`           | _HR Manager_     |
| `ViewSalaryInsights`           | `SalaryInsightsViewed`           | _HR Manager_     |
| `ViewHistoricalSalaryInsights` | `HistoricalSalaryInsightsViewed` | _HR Manager_     |
| `RunSeedScript`                | `EmployeeDataSeeded`             | _Engineer / CLI_ |
| `RunSeedScript`                | `DefaultUserSeeded`              | _Engineer / CLI_ |

With only one user-facing role, RBAC is not needed. Multiple HR managers can hold accounts — the `User` aggregate enforces authentication but not authorisation.

---

### Aggregates & Read Models

**Aggregate: User**

The authentication aggregate. Owns identity and session state for each HR Manager.

Owns:

- Identity (email, encrypted password)
- Session tracking (sign-in count, last sign-in at, last sign-in IP, current sign-in at, current sign-in IP)
- JWT identity (jti — rotated on each sign-in and sign-out, used by JTIMatcher for token revocation)
- Password recovery token

**Aggregate: JobTitle**

A managed reference aggregate. HR Managers maintain the canonical list of job titles for the organisation. Employees are associated to a job title via a foreign key, ensuring that all job titles used in employee records and insight queries are consistent and free of data entry errors.

Owns:

- Name

**Aggregate: Department**

A managed reference aggregate, parallel to `JobTitle`. HR Managers maintain the canonical list of departments. Employees are associated to a department via a foreign key, preventing the same data quality issues that free-text department names would introduce in insight groupings.

Owns:

- Name

**Aggregate: Employee**

The primary mutable domain object within the employee domain. It handles all write commands and is the source of truth for all employee state.

Owns:

- Identity (name, email)
- Employment details (job title, department, country, employment type, hire date)
- Compensation (salary, currency)

**Read Model: SalaryInsights**

Not a mutable aggregate — derived on demand from `Employee` data via SQL aggregations, with no separate data store. Everything is computed at query time.

Exposes:

- Minimum, maximum, and average salary by country
- Average salary by job title within a country
- Average salary by department within a country

**Append-only Log: SalaryHistory**

Not a mutable aggregate — each record is written once when a salary changes and never updated. It backs the `HistoricalSalaryInsights` read model, enabling time-series queries across all insight dimensions: country, department, and job title.
