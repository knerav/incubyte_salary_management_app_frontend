import { getToken, setToken, clearToken, getRefreshToken, setRefreshToken, clearRefreshToken } from "@/lib/auth";
import type {
  Employee,
  EmployeeListResponse,
  EmployeeFormData,
  SalaryUpdateData,
  JobTitle,
  Department,
  SalaryInsights,
  SalaryHistoryEntry,
  SalaryHistoryResponse,
  ApiValidationError,
  Country,
} from "@/types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

class AuthError extends Error {}

class ValidationError extends Error {
  errors: Record<string, string[]>;
  constructor(errors: Record<string, string[]>) {
    super("Validation failed");
    this.errors = errors;
  }
}

function authHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: token } : {};
}

let _refreshPromise: Promise<boolean> | null = null;

async function tryRefreshToken(): Promise<boolean> {
  if (_refreshPromise) return _refreshPromise;

  _refreshPromise = (async () => {
    const response = await fetch(`${BASE_URL}/api/v1/users/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ auth: { refresh_token: getRefreshToken() } }),
    });

    if (!response.ok) return false;

    const newJwt = response.headers.get("Authorization");
    const data = await response.json();

    if (newJwt) setToken(newJwt);
    if (data?.auth?.refresh_token) setRefreshToken(data.auth.refresh_token);

    return !!newJwt;
  })().finally(() => {
    _refreshPromise = null;
  });

  return _refreshPromise;
}

// Exported so tests can spy on it without touching window.location
export const _navigate = {
  to: (path: string) => {
    window.location.href = path;
  },
};

// Exported for tests only — resets the one-shot redirect guard between test cases
export function _resetRedirecting() {
  _redirecting = false;
}

let _redirecting = false;

function redirectToSignIn(): Promise<never> {
  if (!_redirecting) {
    _redirecting = true;
    clearToken();
    clearRefreshToken();
    _navigate.to("/sign-in");
  }
  // Return a promise that never settles so the calling async function
  // suspends until the page unloads. No AuthError propagates.
  return new Promise<never>(() => {});
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  isRetry = false,
): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...authHeaders(),
      ...(options.headers as Record<string, string>),
    },
  });

  if (response.status === 401) {
    if (!isRetry) {
      const refreshed = await tryRefreshToken();
      if (refreshed) {
        return request<T>(path, options, true);
      }
    }
    return redirectToSignIn();
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const body = await response.json();

  if (!response.ok) {
    const err = body as ApiValidationError;
    throw new ValidationError(err.errors ?? { base: ["An error occurred"] });
  }

  return body as T;
}

function toQueryString(
  params: Record<string, string | number | undefined>,
): string {
  const entries = Object.entries(params).filter(
    ([, v]) => v !== undefined && v !== "",
  );
  if (entries.length === 0) return "";
  return (
    "?" +
    entries.map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`).join("&")
  );
}

// Auth

export async function signIn(email: string, password: string): Promise<void> {
  const response = await fetch(`${BASE_URL}/api/v1/users/sign_in`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user: { email, password } }),
  });

  if (!response.ok) {
    throw new AuthError("Invalid credentials");
  }

  const token = response.headers.get("Authorization");
  const data = await response.json();
  if (token) setToken(token);
  if (data?.auth?.refresh_token) setRefreshToken(data.auth.refresh_token);
}

export async function signOut(): Promise<void> {
  await request("/api/v1/users/sign_out", {
    method: "DELETE",
    body: JSON.stringify({ auth: { refresh_token: getRefreshToken() } }),
  });
  clearToken();
  clearRefreshToken();
}

// Employees

export interface EmployeeFilters {
  page?: number;
  per_page?: number;
  q?: string;
  country?: string;
  department_id?: number;
  job_title_id?: number;
  employment_type?: string;
}

export async function listEmployees(
  filters: EmployeeFilters,
): Promise<EmployeeListResponse> {
  const qs = toQueryString(
    filters as Record<string, string | number | undefined>,
  );
  return request<EmployeeListResponse>(`/api/v1/employees${qs}`);
}

export async function getEmployee(id: number): Promise<Employee> {
  return request<Employee>(`/api/v1/employees/${id}`);
}

export async function createEmployee(
  data: EmployeeFormData,
): Promise<Employee> {
  return request<Employee>("/api/v1/employees", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateEmployee(
  id: number,
  data: Partial<Omit<EmployeeFormData, "salary" | "currency">>,
): Promise<Employee> {
  return request<Employee>(`/api/v1/employees/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function updateSalary(
  id: number,
  data: SalaryUpdateData,
): Promise<Employee> {
  return request<Employee>(`/api/v1/employees/${id}/salary`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteEmployee(id: number): Promise<void> {
  return request<void>(`/api/v1/employees/${id}`, { method: "DELETE" });
}

export async function getSalaryHistory(
  id: number,
): Promise<SalaryHistoryEntry[]> {
  const data = await request<SalaryHistoryResponse>(
    `/api/v1/employees/${id}/salary_history`,
  );
  return data.salary_history;
}

// Job Titles

export async function listJobTitles(): Promise<JobTitle[]> {
  const data = await request<{ job_titles: JobTitle[] }>("/api/v1/job_titles");
  return data.job_titles;
}

export async function createJobTitle(name: string): Promise<JobTitle> {
  return request<JobTitle>("/api/v1/job_titles", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
}

export async function updateJobTitle(
  id: number,
  name: string,
): Promise<JobTitle> {
  return request<JobTitle>(`/api/v1/job_titles/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ name }),
  });
}

export async function deleteJobTitle(id: number): Promise<void> {
  return request<void>(`/api/v1/job_titles/${id}`, { method: "DELETE" });
}

// Departments

export async function listDepartments(): Promise<Department[]> {
  const data = await request<{ departments: Department[] }>(
    "/api/v1/departments",
  );
  return data.departments;
}

export async function createDepartment(name: string): Promise<Department> {
  return request<Department>("/api/v1/departments", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
}

export async function updateDepartment(
  id: number,
  name: string,
): Promise<Department> {
  return request<Department>(`/api/v1/departments/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ name }),
  });
}

export async function deleteDepartment(id: number): Promise<void> {
  return request<void>(`/api/v1/departments/${id}`, { method: "DELETE" });
}

// Countries

export async function listCountries(): Promise<Country[]> {
  const data = await request<{ countries: Country[] }>("/api/v1/countries");
  return data.countries;
}

// Insights

export interface InsightFilters {
  country?: string;
  department_id?: number;
  job_title_id?: number;
}

export async function getSalaryInsights(
  filters: InsightFilters,
): Promise<SalaryInsights> {
  const qs = toQueryString(
    filters as Record<string, string | number | undefined>,
  );
  return request<SalaryInsights>(`/api/v1/insights/salary${qs}`);
}
