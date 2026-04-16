import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import EmployeesPage from "@/app/employees/page";
import type { Employee, EmployeeListResponse, JobTitle, Department } from "@/types";

jest.mock("@/lib/api", () => ({
  listEmployees: jest.fn(),
  listJobTitles: jest.fn(),
  listDepartments: jest.fn(),
  deleteEmployee: jest.fn(),
  createEmployee: jest.fn(),
  getEmployee: jest.fn(),
  updateEmployee: jest.fn(),
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
  createEmployee,
  getEmployee,
  updateEmployee,
} from "@/lib/api";

const mockListEmployees = listEmployees as jest.MockedFunction<typeof listEmployees>;
const mockListJobTitles = listJobTitles as jest.MockedFunction<typeof listJobTitles>;
const mockListDepartments = listDepartments as jest.MockedFunction<typeof listDepartments>;
const mockDeleteEmployee = deleteEmployee as jest.MockedFunction<typeof deleteEmployee>;
const mockCreateEmployee = createEmployee as jest.MockedFunction<typeof createEmployee>;
const mockGetEmployee = getEmployee as jest.MockedFunction<typeof getEmployee>;
const mockUpdateEmployee = updateEmployee as jest.MockedFunction<typeof updateEmployee>;

const mockEmployee: Employee = {
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
};

const mockResponse: EmployeeListResponse = {
  employees: [mockEmployee],
  meta: { total: 1, page: 1, per_page: 25, total_pages: 1 },
};

const mockJobTitles: JobTitle[] = [{ id: 1, name: "Engineer" }];
const mockDepartments: Department[] = [{ id: 1, name: "Engineering" }];

beforeEach(() => {
  jest.clearAllMocks();
  mockListEmployees.mockResolvedValue(mockResponse);
  mockListJobTitles.mockResolvedValue(mockJobTitles);
  mockListDepartments.mockResolvedValue(mockDepartments);
  mockGetEmployee.mockResolvedValue(mockEmployee);
  mockUpdateEmployee.mockResolvedValue(mockEmployee);
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

  it("renders an add employee button", async () => {
    render(<EmployeesPage />);
    expect(await screen.findByRole("button", { name: /add employee/i })).toBeInTheDocument();
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

  describe("employee show modal", () => {
    it("opens a modal with employee details when an employee name is clicked", async () => {
      render(<EmployeesPage />);
      await userEvent.click(await screen.findByRole("button", { name: "Jane Smith" }));
      expect(await screen.findByRole("dialog")).toBeInTheDocument();
      expect(await screen.findByText("jane@example.com")).toBeInTheDocument();
    });

    it("closes the modal when the close button is clicked", async () => {
      render(<EmployeesPage />);
      await userEvent.click(await screen.findByRole("button", { name: "Jane Smith" }));
      await screen.findByRole("dialog");
      await userEvent.click(screen.getByRole("button", { name: /close/i }));
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  describe("edit employee modal", () => {
    it("opens an edit form modal when the edit button is clicked on a row", async () => {
      render(<EmployeesPage />);
      await screen.findByText("Jane Smith");
      await userEvent.click(screen.getByRole("button", { name: /edit jane smith/i }));
      expect(await screen.findByRole("dialog")).toBeInTheDocument();
      expect(screen.getByLabelText(/first name/i)).toHaveValue("Jane");
    });

    it("calls updateEmployee and refetches on successful edit submission", async () => {
      render(<EmployeesPage />);
      await screen.findByText("Jane Smith");
      await userEvent.click(screen.getByRole("button", { name: /edit jane smith/i }));
      await screen.findByRole("dialog");
      await userEvent.click(screen.getByRole("button", { name: /save/i }));
      await waitFor(() => {
        expect(mockUpdateEmployee).toHaveBeenCalledTimes(1);
        expect(mockListEmployees).toHaveBeenCalledTimes(2);
      });
    });

    it("closes the edit modal after a successful save", async () => {
      render(<EmployeesPage />);
      await screen.findByText("Jane Smith");
      await userEvent.click(screen.getByRole("button", { name: /edit jane smith/i }));
      await screen.findByRole("dialog");
      await userEvent.click(screen.getByRole("button", { name: /save/i }));
      await waitFor(() => {
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      });
    });
  });

  describe("pagination", () => {
    it("does not show pagination when there is only one page", async () => {
      render(<EmployeesPage />);
      await screen.findByText("Jane Smith");
      expect(screen.queryByRole("navigation", { name: /pagination/i })).not.toBeInTheDocument();
    });

    it("shows pagination when there are multiple pages", async () => {
      mockListEmployees.mockResolvedValue({
        employees: [mockEmployee],
        meta: { total: 50, page: 1, per_page: 25, total_pages: 2 },
      });
      render(<EmployeesPage />);
      await screen.findByText("Jane Smith");
      expect(screen.getByRole("navigation", { name: /pagination/i })).toBeInTheDocument();
    });

    it("fetches the next page when the next button is clicked", async () => {
      mockListEmployees.mockResolvedValue({
        employees: [mockEmployee],
        meta: { total: 50, page: 1, per_page: 25, total_pages: 2 },
      });
      render(<EmployeesPage />);
      await screen.findByText("Jane Smith");
      await userEvent.click(screen.getByRole("link", { name: /next/i }));
      await waitFor(() => {
        expect(mockListEmployees).toHaveBeenCalledWith(expect.objectContaining({ page: 2 }));
      });
    });
  });

  describe("add employee dialog", () => {
    it("opens the dialog when the add employee button is clicked", async () => {
      render(<EmployeesPage />);
      await userEvent.click(await screen.findByRole("button", { name: /add employee/i }));
      expect(await screen.findByRole("dialog")).toBeInTheDocument();
    });

    it("shows a success message after an employee is created", async () => {
      mockCreateEmployee.mockResolvedValue(mockEmployee);
      render(<EmployeesPage />);
      await userEvent.click(await screen.findByRole("button", { name: /add employee/i }));
      await screen.findByRole("dialog");
      await userEvent.click(screen.getByRole("button", { name: /save/i }));
      expect(await screen.findByText(/employee added/i)).toBeInTheDocument();
    });

    it("shows an error message when employee creation fails unexpectedly", async () => {
      mockCreateEmployee.mockRejectedValue(new Error("Server error"));
      render(<EmployeesPage />);
      await userEvent.click(await screen.findByRole("button", { name: /add employee/i }));
      await screen.findByRole("dialog");
      await userEvent.click(screen.getByRole("button", { name: /save/i }));
      expect(await screen.findByText(/something went wrong/i)).toBeInTheDocument();
    });

    it("closes the dialog when done is clicked after a successful creation", async () => {
      mockCreateEmployee.mockResolvedValue(mockEmployee);
      render(<EmployeesPage />);
      await userEvent.click(await screen.findByRole("button", { name: /add employee/i }));
      await screen.findByRole("dialog");
      await userEvent.click(screen.getByRole("button", { name: /save/i }));
      await userEvent.click(await screen.findByRole("button", { name: /done/i }));
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("refetches employees after a successful creation", async () => {
      mockCreateEmployee.mockResolvedValue(mockEmployee);
      render(<EmployeesPage />);
      await userEvent.click(await screen.findByRole("button", { name: /add employee/i }));
      await screen.findByRole("dialog");
      await userEvent.click(screen.getByRole("button", { name: /save/i }));
      await screen.findByText(/employee added/i);
      await waitFor(() => {
        expect(mockListEmployees).toHaveBeenCalledTimes(2);
      });
    });
  });
});
