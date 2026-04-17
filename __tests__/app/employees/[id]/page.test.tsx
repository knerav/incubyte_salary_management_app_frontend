import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import EmployeePage from "@/app/employees/[id]/page";
import type { Employee } from "@/types";

jest.mock("@/lib/api", () => ({
  getEmployee: jest.fn(),
  deleteEmployee: jest.fn(),
  updateSalary: jest.fn(),
  getSalaryHistory: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  useParams: () => ({ id: "1" }),
}));

const mockPush = jest.fn();

import { getEmployee, deleteEmployee, updateSalary, getSalaryHistory } from "@/lib/api";
import type { SalaryHistoryEntry } from "@/types";

const mockGetEmployee = getEmployee as jest.MockedFunction<typeof getEmployee>;
const mockDeleteEmployee = deleteEmployee as jest.MockedFunction<typeof deleteEmployee>;
const mockUpdateSalary = updateSalary as jest.MockedFunction<typeof updateSalary>;
const mockGetSalaryHistory = getSalaryHistory as jest.MockedFunction<typeof getSalaryHistory>;

const mockHistory: SalaryHistoryEntry[] = [
  { effective_from: "2022-01-01", salary: "90000.00", currency: "USD", change: null },
  { effective_from: "2023-06-01", salary: "95000.00", currency: "USD", change: "+5.56%" },
];

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

beforeEach(() => {
  jest.clearAllMocks();
  mockGetEmployee.mockResolvedValue(mockEmployee);
  mockGetSalaryHistory.mockResolvedValue(mockHistory);
});

describe("EmployeePage", () => {
  it("shows the employee's full name as a heading", async () => {
    render(<EmployeePage />);
    expect(await screen.findByRole("heading", { name: /jane smith/i })).toBeInTheDocument();
  });

  it("shows the employee's email, job title, and department", async () => {
    render(<EmployeePage />);
    await screen.findByText(/jane@example.com/i);
    expect(screen.getByText("Engineer")).toBeInTheDocument();
    expect(screen.getByText("Engineering")).toBeInTheDocument();
  });

  it("shows the employee's salary and currency", async () => {
    render(<EmployeePage />);
    expect(await screen.findAllByText(/90000/)).not.toHaveLength(0);
    expect(screen.getAllByText(/USD/)).not.toHaveLength(0);
  });

  it("renders a link to edit the employee", async () => {
    render(<EmployeePage />);
    expect(
      await screen.findByRole("link", { name: /edit/i })
    ).toHaveAttribute("href", "/employees/1/edit");
  });

  it("renders a salary update form pre-filled with the current salary", async () => {
    render(<EmployeePage />);
    expect(await screen.findByLabelText(/salary/i)).toHaveValue("90000.00");
    expect(screen.getByLabelText(/currency/i)).toHaveValue("USD");
  });

  it("calls updateSalary with the new values when the salary form is submitted", async () => {
    mockUpdateSalary.mockResolvedValue({ ...mockEmployee, salary: "95000.00" });
    render(<EmployeePage />);
    await screen.findByLabelText(/salary/i);

    const salaryInput = screen.getByLabelText(/salary/i);
    await userEvent.clear(salaryInput);
    await userEvent.type(salaryInput, "95000.00");
    await userEvent.click(screen.getByRole("button", { name: /update salary/i }));

    await waitFor(() => {
      expect(mockUpdateSalary).toHaveBeenCalledWith(1, {
        salary: "95000.00",
        currency: "USD",
      });
    });
  });

  it("calls deleteEmployee and redirects to /employees after deletion", async () => {
    mockDeleteEmployee.mockResolvedValue(undefined);
    render(<EmployeePage />);
    await screen.findByRole("heading", { name: /jane smith/i });

    await userEvent.click(screen.getByRole("button", { name: /delete/i }));
    await userEvent.click(screen.getByRole("button", { name: /confirm/i }));

    await waitFor(() => {
      expect(mockDeleteEmployee).toHaveBeenCalledWith(1);
      expect(mockPush).toHaveBeenCalledWith("/employees");
    });
  });

  describe("salary history", () => {
    it("fetches salary history for the employee on mount", async () => {
      render(<EmployeePage />);
      await screen.findByRole("heading", { name: /jane smith/i });
      await waitFor(() => {
        expect(mockGetSalaryHistory).toHaveBeenCalledWith(1);
      });
    });

    it("renders a salary history section heading", async () => {
      render(<EmployeePage />);
      expect(await screen.findByRole("heading", { name: /salary history/i })).toBeInTheDocument();
    });

    it("renders a row for each salary history entry", async () => {
      render(<EmployeePage />);
      // 2022-01-01 also appears as hired_on in the details section
      expect(await screen.findAllByText("2022-01-01")).toHaveLength(2);
      expect(screen.getByText("2023-06-01")).toBeInTheDocument();
    });

    it("renders the change percentage for entries after the first", async () => {
      render(<EmployeePage />);
      expect(await screen.findByText("+5.56%")).toBeInTheDocument();
    });
  });
});
