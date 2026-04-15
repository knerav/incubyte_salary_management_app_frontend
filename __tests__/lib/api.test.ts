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

  it("clears the token and throws on a 401 response", async () => {
    mockFetch(401, { error: "Unauthorized" });
    await expect(listEmployees({})).rejects.toThrow();
    expect(mockClearToken).toHaveBeenCalled();
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
