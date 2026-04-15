import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import EmployeeTable from "@/components/employees/EmployeeTable";
import type { Employee, PaginationMeta } from "@/types";

const mockOnDelete = jest.fn();

const mockEmployees: Employee[] = [
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
  {
    id: 2,
    first_name: "John",
    last_name: "Doe",
    email: "john@example.com",
    job_title: "Designer",
    department: "Design",
    country: "GB",
    salary: "75000.00",
    currency: "GBP",
    employment_type: "part_time",
    hired_on: "2021-06-15",
  },
];

const mockMeta: PaginationMeta = {
  total: 2,
  page: 1,
  per_page: 25,
  total_pages: 1,
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("EmployeeTable", () => {
  it("renders a row for each employee", () => {
    render(
      <EmployeeTable
        employees={mockEmployees}
        meta={mockMeta}
        onDelete={mockOnDelete}
      />
    );
    expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    expect(screen.getByText("John Doe")).toBeInTheDocument();
  });

  it("renders the employee's job title, department, and country", () => {
    render(
      <EmployeeTable
        employees={mockEmployees}
        meta={mockMeta}
        onDelete={mockOnDelete}
      />
    );
    expect(screen.getByText("Engineer")).toBeInTheDocument();
    expect(screen.getByText("Engineering")).toBeInTheDocument();
    expect(screen.getByText("US")).toBeInTheDocument();
  });

  it("renders a link to the employee profile for each row", () => {
    render(
      <EmployeeTable
        employees={mockEmployees}
        meta={mockMeta}
        onDelete={mockOnDelete}
      />
    );
    expect(screen.getByRole("link", { name: "Jane Smith" })).toHaveAttribute(
      "href",
      "/employees/1"
    );
    expect(screen.getByRole("link", { name: "John Doe" })).toHaveAttribute(
      "href",
      "/employees/2"
    );
  });

  it("renders a delete button for each employee", () => {
    render(
      <EmployeeTable
        employees={mockEmployees}
        meta={mockMeta}
        onDelete={mockOnDelete}
      />
    );
    expect(screen.getAllByRole("button", { name: /delete/i })).toHaveLength(2);
  });

  it("calls onDelete with the employee id when delete is clicked", async () => {
    render(
      <EmployeeTable
        employees={mockEmployees}
        meta={mockMeta}
        onDelete={mockOnDelete}
      />
    );
    await userEvent.click(screen.getAllByRole("button", { name: /delete/i })[0]);
    expect(mockOnDelete).toHaveBeenCalledWith(1);
  });

  it("shows an empty state message when there are no employees", () => {
    render(
      <EmployeeTable
        employees={[]}
        meta={{ ...mockMeta, total: 0 }}
        onDelete={mockOnDelete}
      />
    );
    expect(screen.getByText(/no employees found/i)).toBeInTheDocument();
  });

  it("shows the total employee count and current page", () => {
    render(
      <EmployeeTable
        employees={mockEmployees}
        meta={mockMeta}
        onDelete={mockOnDelete}
      />
    );
    expect(screen.getByText(/2 employees/i)).toBeInTheDocument();
  });
});
