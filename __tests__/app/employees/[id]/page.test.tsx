import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import EmployeePage from "@/app/employees/[id]/page";
import type { Employee } from "@/types";

jest.mock("@/lib/api", () => ({
  getEmployee: jest.fn(),
  deleteEmployee: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

const mockPush = jest.fn();

import { getEmployee, deleteEmployee } from "@/lib/api";

const mockGetEmployee = getEmployee as jest.MockedFunction<typeof getEmployee>;
const mockDeleteEmployee = deleteEmployee as jest.MockedFunction<typeof deleteEmployee>;

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
});

describe("EmployeePage", () => {
  it("shows the employee's full name as a heading", async () => {
    render(<EmployeePage params={Promise.resolve({ id: "1" })} />);
    expect(await screen.findByRole("heading", { name: /jane smith/i })).toBeInTheDocument();
  });

  it("shows the employee's email, job title, and department", async () => {
    render(<EmployeePage params={Promise.resolve({ id: "1" })} />);
    await screen.findByText(/jane@example.com/i);
    expect(screen.getByText(/engineer/i)).toBeInTheDocument();
    expect(screen.getByText(/engineering/i)).toBeInTheDocument();
  });

  it("shows the employee's salary and currency", async () => {
    render(<EmployeePage params={Promise.resolve({ id: "1" })} />);
    expect(await screen.findByText(/90000/)).toBeInTheDocument();
    expect(screen.getByText(/USD/)).toBeInTheDocument();
  });

  it("renders a link to edit the employee", async () => {
    render(<EmployeePage params={Promise.resolve({ id: "1" })} />);
    expect(
      await screen.findByRole("link", { name: /edit/i })
    ).toHaveAttribute("href", "/employees/1/edit");
  });

  it("calls deleteEmployee and redirects to /employees after deletion", async () => {
    mockDeleteEmployee.mockResolvedValue(undefined);
    render(<EmployeePage params={Promise.resolve({ id: "1" })} />);
    await screen.findByRole("heading", { name: /jane smith/i });

    await userEvent.click(screen.getByRole("button", { name: /delete/i }));
    await userEvent.click(screen.getByRole("button", { name: /confirm/i }));

    await waitFor(() => {
      expect(mockDeleteEmployee).toHaveBeenCalledWith(1);
      expect(mockPush).toHaveBeenCalledWith("/employees");
    });
  });
});
