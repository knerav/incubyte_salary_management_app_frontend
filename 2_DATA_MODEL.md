> Please note: This document is shared with the backend application and is an exact mirror. If you've read this document on the backend app you're up to date with it already.

# Data Model

From the event storm, I identified four structures that need persistence: the `User` aggregate, which owns authentication state for each HR Manager; the `JobTitle` aggregate, which is a managed reference table for canonical job titles; the `Employee` aggregate, which holds current employee state; and the `SalaryHistory` append-only log, which records salary changes over time to support historical insights.

---

### users

| Column                   | Type        | Constraints                 |
| ------------------------ | ----------- | --------------------------- |
| `id`                     | `bigint`    | Primary key, auto-increment |
| `email`                  | `varchar`   | NOT NULL, UNIQUE            |
| `encrypted_password`     | `varchar`   | NOT NULL                    |
| `jti`                    | `varchar`   | NOT NULL, UNIQUE            |
| `reset_password_token`   | `varchar`   | nullable, UNIQUE            |
| `reset_password_sent_at` | `timestamp` | nullable                    |
| `remember_created_at`    | `timestamp` | nullable                    |
| `sign_in_count`          | `integer`   | NOT NULL, default `0`       |
| `current_sign_in_at`     | `timestamp` | nullable                    |
| `last_sign_in_at`        | `timestamp` | nullable                    |
| `current_sign_in_ip`     | `inet`      | nullable                    |
| `last_sign_in_ip`        | `inet`      | nullable                    |
| `created_at`             | `timestamp` | NOT NULL                    |
| `updated_at`             | `timestamp` | NOT NULL                    |

The `jti` column supports the JTIMatcher revocation strategy from `devise-jwt`. Each sign-in rotates the `jti`, invalidating any previously issued token for that user. This means sign-out is honoured — a token cannot outlive its session.

The trackable columns (`sign_in_count`, `*_sign_in_at`, `*_sign_in_ip`) are included for operational visibility. For a tool managing sensitive salary data, knowing when and from where an HR Manager last accessed the system could be important to surface.

---

### job_titles

| Column       | Type        | Constraints                 |
| ------------ | ----------- | --------------------------- |
| `id`         | `bigint`    | Primary key, auto-increment |
| `name`       | `varchar`   | NOT NULL, UNIQUE            |
| `created_at` | `timestamp` | NOT NULL                    |
| `updated_at` | `timestamp` | NOT NULL                    |

Job titles are managed by HR Managers rather than stored as free-text on the employee record. This prevents data quality issues that would distort insight groupings — "Product Manager", "product manager", and "Prooduct Manager" would otherwise be treated as three distinct dimensions. The unique constraint on `name` enforces a single canonical form per title.

---

### departments

| Column       | Type        | Constraints                 |
| ------------ | ----------- | --------------------------- |
| `id`         | `bigint`    | Primary key, auto-increment |
| `name`       | `varchar`   | NOT NULL, UNIQUE            |
| `created_at` | `timestamp` | NOT NULL                    |
| `updated_at` | `timestamp` | NOT NULL                    |

Departments are managed by HR Managers rather than stored as free-text on the employee record, for the same reason as job titles — free-text department names would produce unreliable insight groupings. The unique constraint on `name` enforces a single canonical form per department.

---

### employees

| Column            | Type             | Constraints                                           |
| ----------------- | ---------------- | ----------------------------------------------------- |
| `id`              | `bigint`         | Primary key, auto-increment                           |
| `first_name`      | `varchar`        | NOT NULL                                              |
| `last_name`       | `varchar`        | NOT NULL                                              |
| `email`           | `varchar`        | NOT NULL, UNIQUE                                      |
| `job_title_id`    | `bigint`         | NOT NULL, FK → `job_titles.id`                        |
| `department_id`   | `bigint`         | NOT NULL, FK → `departments.id`                       |
| `country`         | `varchar(2)`     | NOT NULL — ISO 3166-1 alpha-2 code (e.g. `"US"`)      |
| `salary`          | `decimal(15, 2)` | NOT NULL                                              |
| `currency`        | `varchar(3)`     | NOT NULL, default `'USD'`                             |
| `employment_type` | `varchar`        | NOT NULL — enum: `full_time`, `part_time`, `contract` |
| `hired_on`        | `date`           | NOT NULL                                              |
| `deleted_at`      | `timestamp`      | nullable                                              |
| `created_at`      | `timestamp`      | NOT NULL                                              |
| `updated_at`      | `timestamp`      | NOT NULL                                              |

---

### salary_histories

| Column           | Type             | Constraints                   |
| ---------------- | ---------------- | ----------------------------- |
| `id`             | `bigint`         | Primary key, auto-increment   |
| `employee_id`    | `bigint`         | NOT NULL, FK → `employees.id` |
| `salary`         | `decimal(15, 2)` | NOT NULL                      |
| `currency`       | `varchar(3)`     | NOT NULL                      |
| `effective_from` | `date`           | NOT NULL                      |
| `created_at`     | `timestamp`      | NOT NULL                      |

Each record is written once when a salary changes and never updated. `effective_from` is the date the new salary took effect, which lets me answer point-in-time queries like "what was the average salary in Germany in Q1?".

---

### Indexes

**users indexes:**

| Index       | Columns                | Reason                                         |
| ----------- | ---------------------- | ---------------------------------------------- |
| Primary key | `id`                   | Row lookup                                     |
| Unique      | `email`                | Devise uniqueness constraint                   |
| Unique      | `jti`                  | JTIMatcher — token lookup on every API request |
| Unique      | `reset_password_token` | Password reset token lookup                    |

**job_titles indexes:**

| Index       | Columns | Reason                                      |
| ----------- | ------- | ------------------------------------------- |
| Primary key | `id`    | Row lookup                                  |
| Unique      | `name`  | Prevents duplicate titles at database level |

**departments indexes:**

| Index       | Columns | Reason                                           |
| ----------- | ------- | ------------------------------------------------ |
| Primary key | `id`    | Row lookup                                       |
| Unique      | `name`  | Prevents duplicate departments at database level |

**employees indexes:**

| Index                             | Columns                   | Reason                                                                                 |
| --------------------------------- | ------------------------- | -------------------------------------------------------------------------------------- |
| Primary key                       | `id`                      | Row lookup                                                                             |
| Unique                            | `email`                   | Uniqueness constraint                                                                  |
| `idx_employees_job_title_id`      | `job_title_id`            | FK lookup and insights queries group by job title                                      |
| `idx_employees_department_id`     | `department_id`           | FK lookup and insights queries filter and group by department                          |
| `idx_employees_country`           | `country`                 | Insights queries filter and group by country                                           |
| `idx_employees_country_job_title` | `(country, job_title_id)` | Composite — covers the "avg salary for job title in country" query without a full scan |
| `idx_employees_deleted_at`        | `deleted_at`              | Soft delete — default scope filters `WHERE deleted_at IS NULL` on every query          |

**salary_histories indexes:**

| Index                                     | Columns                         | Reason                                                                   |
| ----------------------------------------- | ------------------------------- | ------------------------------------------------------------------------ |
| Primary key                               | `id`                            | Row lookup                                                               |
| `idx_salary_histories_employee_id`        | `employee_id`                   | FK lookup — fetch history for a given employee                           |
| `idx_salary_histories_effective_from`     | `effective_from`                | Time-series queries filter and group by date                             |
| `idx_salary_histories_employee_effective` | `(employee_id, effective_from)` | Composite — covers "latest salary for employee as of date X" efficiently |

---

### Notes

The `jti` column on `users` is indexed with a unique constraint because JTIMatcher validates it on every authenticated API request — without an index, that's a full table scan per request.

`job_title_id` replaces the original free-text `job_title` column on `employees`. Storing a foreign key rather than a string ensures that all job titles in the system are canonical and HR Manager-managed, which makes insight groupings reliable.

`department_id` replaces the original free-text `department` column on `employees` for the same reason. Free-text department names produce unreliable insight groupings — "Engineering", "engineering", and "Engingeering" would be treated as three distinct dimensions. A foreign key to a managed reference table prevents this. Both job titles and departments are managed from a Company Settings area in the UI.

`country` is stored as an ISO 3166-1 alpha-2 code (`varchar(2)`) rather than a full country name. Codes are short, unambiguous, and consistent — the `countries` gem resolves the display name at runtime, so the UI can show "United States" while the database stores `"US"`. This prevents the same data quality issues as free-text job titles.

I store `first_name` and `last_name` separately rather than as a single `full_name`. The seed script generates names by combining values from `first_names.txt` and `last_names.txt`, so keeping them split avoids string manipulation at seed time and makes sorting by last name natural.

I use `decimal(15, 2)` for `salary` rather than `float`. Financial figures stored as floating point accumulate rounding errors in aggregate calculations — `decimal` gives exact representation.

I store `currency` alongside `salary` on every row. Salary without currency is ambiguous for a multi-country organisation, and keeping them together makes each record self-contained.

I constrain `employment_type` as an enum to `full_time`, `part_time`, and `contract`. This prevents data quality issues and makes it a reliable filter dimension for insights.

I use a nullable `deleted_at` timestamp rather than hard deleting employees. Permanently removing a row would silently distort historical insight calculations. The nullable timestamp retains the data while a Rails default scope excludes it from all queries automatically.
