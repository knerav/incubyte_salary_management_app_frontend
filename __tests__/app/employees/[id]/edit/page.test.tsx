import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import EditEmployeePage from "@/app/employees/[id]/edit/page";
import type { Employee, JobTitle, Department } from "@/types";

jest.mock("@/lib/api", () => ({
  getEmployee: jest.fn(),
  listJobTitles: jest.fn(),
  listDepartments: jest.fn(),
  updateEmployee: jest.fn(),
  updateSalary: jest.fn(),
}));

jest.mock("@/lib/countries", () => ({
  getCountryOptions: () => [
    { code: "GB", name: "United Kingdom" },
    { code: "IN", name: "India" },
    { code: "US", name: "United States" },
  ],
  getCurrencyForCountry: (code: string) =>
    ({ GB: "GBP", IN: "INR", US: "USD" } as Record<string, string>)[code] ?? "",
  getCurrencyOptions: () => ["GBP", "INR", "USD"],
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  useParams: () => ({ id: "1" }),
}));

const mockPush = jest.fn();

import { getEmployee, listJobTitles, listDepartments, updateEmployee } from "@/lib/api";

const mockGetEmployee = getEmployee as jest.MockedFunction<typeof getEmployee>;
const mockListJobTitles = listJobTitles as jest.MockedFunction<typeof listJobTitles>;
const mockListDepartments = listDepartments as jest.MockedFunction<typeof listDepartments>;
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

const mockJobTitles: JobTitle[] = [{ id: 1, name: "Engineer" }];
const mockDepartments: Department[] = [{ id: 1, name: "Engineering" }];

beforeEach(() => {
  jest.clearAllMocks();
  mockGetEmployee.mockResolvedValue(mockEmployee);
  mockListJobTitles.mockResolvedValue(mockJobTitles);
  mockListDepartments.mockResolvedValue(mockDepartments);
});

describe("EditEmployeePage", () => {
  it("renders a heading for edit employee", async () => {
    render(<EditEmployeePage />);
    expect(await screen.findByRole("heading", { name: /edit employee/i })).toBeInTheDocument();
  });

  it("pre-fills the form with the employee's current data", async () => {
    render(<EditEmployeePage />);
    expect(await screen.findByLabelText(/first name/i)).toHaveValue("Jane");
    expect(screen.getByLabelText(/last name/i)).toHaveValue("Smith");
    expect(screen.getByLabelText(/email/i)).toHaveValue("jane@example.com");
  });

  it("calls updateEmployee on submit and redirects to the employee profile", async () => {
    mockUpdateEmployee.mockResolvedValue({ ...mockEmployee, first_name: "Janet" });
    render(<EditEmployeePage />);
    await screen.findByLabelText(/first name/i);

    const firstNameInput = screen.getByLabelText(/first name/i);
    await userEvent.clear(firstNameInput);
    await userEvent.type(firstNameInput, "Janet");
    await userEvent.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => {
      expect(mockUpdateEmployee).toHaveBeenCalledWith(
        1,
        expect.objectContaining({ first_name: "Janet" })
      );
      expect(mockPush).toHaveBeenCalledWith("/employees/1");
    });
  });
});
