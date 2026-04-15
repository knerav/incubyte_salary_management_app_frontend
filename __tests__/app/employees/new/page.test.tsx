import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import NewEmployeePage from "@/app/employees/new/page";
import type { JobTitle, Department } from "@/types";

jest.mock("@/lib/api", () => ({
  listJobTitles: jest.fn(),
  listDepartments: jest.fn(),
  createEmployee: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

const mockPush = jest.fn();

import { listJobTitles, listDepartments, createEmployee } from "@/lib/api";

const mockListJobTitles = listJobTitles as jest.MockedFunction<typeof listJobTitles>;
const mockListDepartments = listDepartments as jest.MockedFunction<typeof listDepartments>;
const mockCreateEmployee = createEmployee as jest.MockedFunction<typeof createEmployee>;

const mockJobTitles: JobTitle[] = [{ id: 1, name: "Engineer" }];
const mockDepartments: Department[] = [{ id: 1, name: "Engineering" }];

beforeEach(() => {
  jest.clearAllMocks();
  mockListJobTitles.mockResolvedValue(mockJobTitles);
  mockListDepartments.mockResolvedValue(mockDepartments);
});

describe("NewEmployeePage", () => {
  it("renders a heading for new employee", async () => {
    render(<NewEmployeePage />);
    expect(await screen.findByRole("heading", { name: /new employee/i })).toBeInTheDocument();
  });

  it("renders the employee form with job titles and departments loaded", async () => {
    render(<NewEmployeePage />);
    expect(await screen.findByRole("option", { name: "Engineer" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Engineering" })).toBeInTheDocument();
  });

  it("calls createEmployee on form submit and redirects to /employees", async () => {
    mockCreateEmployee.mockResolvedValue({
      id: 42,
      first_name: "Alice",
      last_name: "Brown",
      email: "alice@example.com",
      job_title: "Engineer",
      department: "Engineering",
      country: "US",
      salary: "80000.00",
      currency: "USD",
      employment_type: "full_time",
      hired_on: "2023-01-01",
    });
    render(<NewEmployeePage />);
    await screen.findByRole("option", { name: "Engineer" });

    await userEvent.type(screen.getByLabelText(/first name/i), "Alice");
    await userEvent.type(screen.getByLabelText(/last name/i), "Brown");
    await userEvent.type(screen.getByLabelText(/email/i), "alice@example.com");
    await userEvent.selectOptions(screen.getByRole("combobox", { name: /job title/i }), "1");
    await userEvent.selectOptions(screen.getByRole("combobox", { name: /department/i }), "1");
    await userEvent.type(screen.getByLabelText(/country/i), "US");
    await userEvent.type(screen.getByLabelText(/salary/i), "80000");
    await userEvent.type(screen.getByLabelText(/currency/i), "USD");
    await userEvent.selectOptions(
      screen.getByRole("combobox", { name: /employment type/i }),
      "full_time"
    );
    await userEvent.type(screen.getByLabelText(/hired on/i), "2023-01-01");
    await userEvent.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => {
      expect(mockCreateEmployee).toHaveBeenCalledTimes(1);
      expect(mockPush).toHaveBeenCalledWith("/employees");
    });
  });
});
