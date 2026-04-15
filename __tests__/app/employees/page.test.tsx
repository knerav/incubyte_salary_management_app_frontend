import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import EmployeesPage from "@/app/employees/page";
import type { EmployeeListResponse, JobTitle, Department } from "@/types";

jest.mock("@/lib/api", () => ({
  listEmployees: jest.fn(),
  listJobTitles: jest.fn(),
  listDepartments: jest.fn(),
  deleteEmployee: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/employees",
}));

import {
  listEmployees,
  listJobTitles,
  listDepartments,
  deleteEmployee,
} from "@/lib/api";

const mockListEmployees = listEmployees as jest.MockedFunction<typeof listEmployees>;
const mockListJobTitles = listJobTitles as jest.MockedFunction<typeof listJobTitles>;
const mockListDepartments = listDepartments as jest.MockedFunction<typeof listDepartments>;
const mockDeleteEmployee = deleteEmployee as jest.MockedFunction<typeof deleteEmployee>;

const mockResponse: EmployeeListResponse = {
  employees: [
    {
      id: 1,
      first_name: "Jane",
      last_name: "Smith",
      email: "jane@example.com",
      job_title: "Engineer",
      department: "Engineering",
      country: "US",
      salary: "90000.00",
      currency: "USD",
      employment_type: "full_time",
      hired_on: "2022-01-01",
    },
  ],
  meta: { total: 1, page: 1, per_page: 25, total_pages: 1 },
};

const mockJobTitles: JobTitle[] = [{ id: 1, name: "Engineer" }];
const mockDepartments: Department[] = [{ id: 1, name: "Engineering" }];

beforeEach(() => {
  jest.clearAllMocks();
  mockListEmployees.mockResolvedValue(mockResponse);
  mockListJobTitles.mockResolvedValue(mockJobTitles);
  mockListDepartments.mockResolvedValue(mockDepartments);
});

describe("EmployeesPage", () => {
  it("renders a heading for the employees list", async () => {
    render(<EmployeesPage />);
    expect(await screen.findByRole("heading", { name: /employees/i })).toBeInTheDocument();
  });

  it("shows the employee table after loading", async () => {
    render(<EmployeesPage />);
    expect(await screen.findByText("Jane Smith")).toBeInTheDocument();
  });

  it("renders a link to add a new employee", async () => {
    render(<EmployeesPage />);
    expect(await screen.findByRole("link", { name: /add employee/i })).toHaveAttribute(
      "href",
      "/employees/new"
    );
  });

  it("calls listEmployees on mount", async () => {
    render(<EmployeesPage />);
    await waitFor(() => {
      expect(mockListEmployees).toHaveBeenCalledTimes(1);
    });
  });

  it("refetches employees after a delete", async () => {
    mockDeleteEmployee.mockResolvedValue(undefined);
    render(<EmployeesPage />);
    await screen.findByText("Jane Smith");

    await userEvent.click(screen.getByRole("button", { name: /delete/i }));
    await userEvent.click(screen.getByRole("button", { name: /confirm/i }));

    await waitFor(() => {
      expect(mockListEmployees).toHaveBeenCalledTimes(2);
    });
  });
});
