jest.mock("@/lib/auth");

import { getToken, setToken, clearToken } from "@/lib/auth";
import {
  signIn,
  signOut,
  listEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  updateSalary,
  deleteEmployee,
  listJobTitles,
  createJobTitle,
  updateJobTitle,
  deleteJobTitle,
  listDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getSalaryInsights,
  getHistoricalSalaryInsights,
  _navigate,
} from "@/lib/api";
import type { EmployeeFormData, SalaryUpdateData } from "@/types";

const BASE_URL = "http://localhost:3000";

const mockEmployee = {
  id: 1,
  first_name: "Jane",
  last_name: "Smith",
  email: "jane@example.com",
  job_title: "Engineer",
  department: "Engineering",
  country: "US",
  salary: "90000.00",
  currency: "USD",
  employment_type: "full_time" as const,
  hired_on: "2022-01-01",
};

const mockGetToken = getToken as jest.MockedFunction<typeof getToken>;
const mockSetToken = setToken as jest.MockedFunction<typeof setToken>;
const mockClearToken = clearToken as jest.MockedFunction<typeof clearToken>;

beforeEach(() => {
  jest.clearAllMocks();
  mockGetToken.mockReturnValue("Bearer mock.jwt.token");
  mockSetToken.mockImplementation(() => {});
  mockClearToken.mockImplementation(() => {});
});

function mockFetch(status: number, body: unknown, headers?: Record<string, string>) {
  global.fetch = jest.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    headers: {
      get: (key: string) => (headers ?? {})[key] ?? null,
    },
    json: jest.fn().mockResolvedValue(body),
  });
}

describe("signIn", () => {
  it("sends credentials to the sign-in endpoint", async () => {
    mockFetch(200, {}, { Authorization: "Bearer new.token" });
    await signIn("hr@example.com", "Password1!");
    expect(fetch).toHaveBeenCalledWith(
      `${BASE_URL}/api/v1/users/sign_in`,
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ user: { email: "hr@example.com", password: "Password1!" } }),
      })
    );
  });

  it("stores the token returned in the Authorization response header", async () => {
    mockFetch(200, {}, { Authorization: "Bearer new.token" });
    await signIn("hr@example.com", "Password1!");
    expect(mockSetToken).toHaveBeenCalledWith("Bearer new.token");
  });

  it("throws when credentials are invalid", async () => {
    mockFetch(401, { error: "Invalid credentials" });
    await expect(signIn("bad@example.com", "wrong")).rejects.toThrow();
  });
});

describe("signOut", () => {
  it("sends a DELETE to the sign-out endpoint with the Bearer token", async () => {
    mockFetch(200, { message: "Signed out successfully." });
    await signOut();
    expect(fetch).toHaveBeenCalledWith(
      `${BASE_URL}/api/v1/users/sign_out`,
      expect.objectContaining({
        method: "DELETE",
        headers: expect.objectContaining({ Authorization: "Bearer mock.jwt.token" }),
      })
    );
  });

  it("clears the stored token after sign-out", async () => {
    mockFetch(200, { message: "Signed out successfully." });
    await signOut();
    expect(mockClearToken).toHaveBeenCalled();
  });
});

describe("listEmployees", () => {
  it("fetches the employee list with the Bearer token", async () => {
    mockFetch(200, { employees: [], meta: { total: 0, page: 1, per_page: 25, total_pages: 0 } });
    await listEmployees({});
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/v1/employees"),
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: "Bearer mock.jwt.token" }),
      })
    );
  });

  it("appends query parameters to the URL", async () => {
    mockFetch(200, { employees: [], meta: { total: 0, page: 1, per_page: 25, total_pages: 0 } });
    await listEmployees({ page: 2, q: "Jane", country: "US" });
    const url = (fetch as jest.Mock).mock.calls[0][0] as string;
    expect(url).toContain("page=2");
    expect(url).toContain("q=Jane");
    expect(url).toContain("country=US");
  });

  it("clears the token, redirects to /sign-in, and throws when both the request and refresh return 401", async () => {
    const mockNavigate = jest.spyOn(_navigate, "to").mockImplementation(() => {});
    mockFetch(401, { error: "Unauthorized" }); // all calls return 401 (refresh included)
    await expect(listEmployees({})).rejects.toThrow();
    expect(mockClearToken).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith("/sign-in");
    mockNavigate.mockRestore();
  });
});

describe("getEmployee", () => {
  it("fetches a single employee by id", async () => {
    mockFetch(200, mockEmployee);
    const result = await getEmployee(1);
    expect(fetch).toHaveBeenCalledWith(
      `${BASE_URL}/api/v1/employees/1`,
      expect.anything()
    );
    expect(result).toEqual(mockEmployee);
  });
});

describe("createEmployee", () => {
  it("posts a new employee and returns the created record", async () => {
    const formData: EmployeeFormData = {
      first_name: "Jane", last_name: "Smith", email: "jane@example.com",
      job_title_id: 1, department_id: 2, country: "US",
      salary: "90000.00", currency: "USD", employment_type: "full_time",
      hired_on: "2022-01-01",
    };
    mockFetch(201, mockEmployee);
    const result = await createEmployee(formData);
    expect(fetch).toHaveBeenCalledWith(
      `${BASE_URL}/api/v1/employees`,
      expect.objectContaining({ method: "POST", body: JSON.stringify(formData) })
    );
    expect(result).toEqual(mockEmployee);
  });

  it("throws a validation error on a 422 response", async () => {
    mockFetch(422, { errors: { email: ["has already been taken"] } });
    const formData = {} as EmployeeFormData;
    await expect(createEmployee(formData)).rejects.toMatchObject({
      errors: { email: ["has already been taken"] },
    });
  });
});

describe("updateEmployee", () => {
  it("sends a PATCH to the employee endpoint", async () => {
    mockFetch(200, mockEmployee);
    await updateEmployee(1, { first_name: "Janet" });
    expect(fetch).toHaveBeenCalledWith(
      `${BASE_URL}/api/v1/employees/1`,
      expect.objectContaining({ method: "PATCH" })
    );
  });
});

describe("updateSalary", () => {
  it("sends a PATCH to the dedicated salary endpoint", async () => {
    const data: SalaryUpdateData = { salary: "100000.00", currency: "USD" };
    mockFetch(200, mockEmployee);
    await updateSalary(1, data);
    expect(fetch).toHaveBeenCalledWith(
      `${BASE_URL}/api/v1/employees/1/salary`,
      expect.objectContaining({ method: "PATCH", body: JSON.stringify(data) })
    );
  });
});

describe("deleteEmployee", () => {
  it("sends a DELETE to the employee endpoint", async () => {
    mockFetch(204, null);
    await deleteEmployee(1);
    expect(fetch).toHaveBeenCalledWith(
      `${BASE_URL}/api/v1/employees/1`,
      expect.objectContaining({ method: "DELETE" })
    );
  });
});

describe("listJobTitles", () => {
  it("fetches all job titles", async () => {
    mockFetch(200, { job_titles: [{ id: 1, name: "Engineer" }] });
    const result = await listJobTitles();
    expect(fetch).toHaveBeenCalledWith(
      `${BASE_URL}/api/v1/job_titles`,
      expect.anything()
    );
    expect(result).toEqual([{ id: 1, name: "Engineer" }]);
  });
});

describe("createJobTitle", () => {
  it("posts a new job title", async () => {
    mockFetch(201, { id: 2, name: "Designer" });
    const result = await createJobTitle("Designer");
    expect(fetch).toHaveBeenCalledWith(
      `${BASE_URL}/api/v1/job_titles`,
      expect.objectContaining({ method: "POST", body: JSON.stringify({ name: "Designer" }) })
    );
    expect(result).toEqual({ id: 2, name: "Designer" });
  });
});

describe("updateJobTitle", () => {
  it("sends a PATCH to the job title endpoint", async () => {
    mockFetch(200, { id: 1, name: "Senior Engineer" });
    await updateJobTitle(1, "Senior Engineer");
    expect(fetch).toHaveBeenCalledWith(
      `${BASE_URL}/api/v1/job_titles/1`,
      expect.objectContaining({ method: "PATCH", body: JSON.stringify({ name: "Senior Engineer" }) })
    );
  });
});

describe("deleteJobTitle", () => {
  it("sends a DELETE to the job title endpoint", async () => {
    mockFetch(204, null);
    await deleteJobTitle(1);
    expect(fetch).toHaveBeenCalledWith(
      `${BASE_URL}/api/v1/job_titles/1`,
      expect.objectContaining({ method: "DELETE" })
    );
  });
});

describe("listDepartments", () => {
  it("fetches all departments", async () => {
    mockFetch(200, { departments: [{ id: 1, name: "Engineering" }] });
    const result = await listDepartments();
    expect(result).toEqual([{ id: 1, name: "Engineering" }]);
  });
});

describe("createDepartment", () => {
  it("posts a new department", async () => {
    mockFetch(201, { id: 2, name: "Design" });
    const result = await createDepartment("Design");
    expect(fetch).toHaveBeenCalledWith(
      `${BASE_URL}/api/v1/departments`,
      expect.objectContaining({ method: "POST", body: JSON.stringify({ name: "Design" }) })
    );
    expect(result).toEqual({ id: 2, name: "Design" });
  });
});

describe("updateDepartment", () => {
  it("sends a PATCH to the department endpoint", async () => {
    mockFetch(200, { id: 1, name: "Product Design" });
    await updateDepartment(1, "Product Design");
    expect(fetch).toHaveBeenCalledWith(
      `${BASE_URL}/api/v1/departments/1`,
      expect.objectContaining({ method: "PATCH" })
    );
  });
});

describe("deleteDepartment", () => {
  it("sends a DELETE to the department endpoint", async () => {
    mockFetch(204, null);
    await deleteDepartment(1);
    expect(fetch).toHaveBeenCalledWith(
      `${BASE_URL}/api/v1/departments/1`,
      expect.objectContaining({ method: "DELETE" })
    );
  });
});

describe("getSalaryInsights", () => {
  it("fetches salary insights with filter parameters", async () => {
    const mockInsights = {
      filters: { country: "US" },
      insights: { employee_count: 100, min_salary: "50000", max_salary: "150000", avg_salary: "100000", breakdowns: [] },
    };
    mockFetch(200, mockInsights);
    const result = await getSalaryInsights({ country: "US" });
    const url = (fetch as jest.Mock).mock.calls[0][0] as string;
    expect(url).toContain("/api/v1/insights/salary");
    expect(url).toContain("country=US");
    expect(result).toEqual(mockInsights);
  });
});

describe("getHistoricalSalaryInsights", () => {
  it("fetches historical salary insights with group_by parameter", async () => {
    const mockHistory = { filters: {}, group_by: "month" as const, series: [] };
    mockFetch(200, mockHistory);
    await getHistoricalSalaryInsights({ group_by: "month" });
    const url = (fetch as jest.Mock).mock.calls[0][0] as string;
    expect(url).toContain("/api/v1/insights/salary/history");
    expect(url).toContain("group_by=month");
  });
});

function mockFetchSequence(
  ...responses: Array<{ status: number; body: unknown; headers?: Record<string, string> }>
) {
  global.fetch = jest.fn();
  for (const { status, body, headers } of responses) {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: status >= 200 && status < 300,
      status,
      headers: { get: (key: string) => (headers ?? {})[key] ?? null },
      json: jest.fn().mockResolvedValue(body),
    });
  }
}

const successfulEmployeeList = {
  employees: [],
  meta: { total: 0, page: 1, per_page: 25, total_pages: 0 },
};

describe("token refresh on 401", () => {
  let mockNavigate: jest.SpyInstance;

  beforeEach(() => {
    mockNavigate = jest.spyOn(_navigate, "to").mockImplementation(() => {});
  });

  afterEach(() => {
    mockNavigate.mockRestore();
  });

  it("calls the refresh endpoint with credentials:include and no Authorization header when a request returns 401", async () => {
    mockFetchSequence(
      { status: 401, body: {} },
      { status: 200, body: {}, headers: { Authorization: "Bearer new.token" } },
      { status: 200, body: successfulEmployeeList },
    );

    await listEmployees({});

    const refreshCall = (fetch as jest.Mock).mock.calls[1];
    expect(refreshCall[0]).toBe(`${BASE_URL}/api/v1/users/refresh`);
    expect(refreshCall[1]).toMatchObject({ method: "POST", credentials: "include" });
    expect((refreshCall[1].headers ?? {})).not.toHaveProperty("Authorization");
  });

  it("calls the refresh endpoint even when no JWT is stored (cookie is the credential)", async () => {
    mockGetToken.mockReturnValue(null); // no JWT in localStorage
    mockFetchSequence(
      { status: 401, body: {} },
      { status: 200, body: {}, headers: { Authorization: "Bearer new.token" } },
      { status: 200, body: successfulEmployeeList },
    );

    await listEmployees({});

    const refreshCall = (fetch as jest.Mock).mock.calls[1];
    expect(refreshCall[0]).toBe(`${BASE_URL}/api/v1/users/refresh`);
    expect(refreshCall[1]).toMatchObject({ method: "POST", credentials: "include" });
  });

  it("stores the new token returned by the refresh endpoint", async () => {
    mockFetchSequence(
      { status: 401, body: {} },
      { status: 200, body: {}, headers: { Authorization: "Bearer new.token" } },
      { status: 200, body: successfulEmployeeList },
    );

    await listEmployees({});

    expect(mockSetToken).toHaveBeenCalledWith("Bearer new.token");
  });

  it("retries the original request with the refreshed token and returns the result", async () => {
    mockGetToken
      .mockReturnValueOnce("Bearer mock.jwt.token") // initial request
      .mockReturnValue("Bearer new.token");          // retry request (refresh no longer calls getToken)

    mockFetchSequence(
      { status: 401, body: {} },
      { status: 200, body: {}, headers: { Authorization: "Bearer new.token" } },
      { status: 200, body: successfulEmployeeList },
    );

    const result = await listEmployees({});

    expect(fetch).toHaveBeenNthCalledWith(
      3,
      expect.stringContaining("/api/v1/employees"),
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: "Bearer new.token" }),
      })
    );
    expect(result).toEqual(successfulEmployeeList);
  });

  it("clears the token and redirects to /sign-in when refresh also returns 401", async () => {
    mockFetchSequence(
      { status: 401, body: {} },
      { status: 401, body: {} },
    );

    await expect(listEmployees({})).rejects.toThrow();

    expect(mockClearToken).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith("/sign-in");
  });

  it("does not attempt a refresh when retrying (prevents infinite loop)", async () => {
    mockFetchSequence(
      { status: 401, body: {} },
      { status: 200, body: {}, headers: { Authorization: "Bearer new.token" } },
      { status: 401, body: {} }, // retry also 401
    );

    await expect(listEmployees({})).rejects.toThrow();

    expect(fetch).toHaveBeenCalledTimes(3); // original + refresh + retry only
    expect(mockClearToken).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith("/sign-in");
  });

  it("fires only one refresh request when concurrent calls all return 401", async () => {
    // 2 concurrent originals (both 401), 1 shared refresh, 2 retries
    global.fetch = jest.fn()
      .mockResolvedValueOnce({ ok: false, status: 401, headers: { get: () => null }, json: jest.fn().mockResolvedValue({}) })
      .mockResolvedValueOnce({ ok: false, status: 401, headers: { get: () => null }, json: jest.fn().mockResolvedValue({}) })
      .mockResolvedValueOnce({ ok: true,  status: 200, headers: { get: (k: string) => k === "Authorization" ? "Bearer new.token" : null }, json: jest.fn().mockResolvedValue({}) })
      .mockResolvedValue({ ok: true, status: 200, headers: { get: () => null }, json: jest.fn().mockResolvedValue(successfulEmployeeList) });

    await Promise.all([listEmployees({}), listEmployees({})]);

    const calls = (fetch as jest.Mock).mock.calls;
    const refreshCalls = calls.filter(([url]) => String(url).includes("/refresh"));
    expect(refreshCalls).toHaveLength(1);
  });
});
