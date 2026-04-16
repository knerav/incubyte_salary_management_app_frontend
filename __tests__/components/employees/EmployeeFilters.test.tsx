import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import EmployeeFilters from "@/components/employees/EmployeeFilters";
import type { Department, JobTitle } from "@/types";

const mockOnChange = jest.fn();

const mockJobTitles: JobTitle[] = [
  { id: 1, name: "Engineer" },
  { id: 2, name: "Designer" },
];

const mockDepartments: Department[] = [
  { id: 1, name: "Engineering" },
  { id: 2, name: "Design" },
];

function renderFilters(overrides = {}) {
  return render(
    <EmployeeFilters
      filters={{}}
      jobTitles={mockJobTitles}
      departments={mockDepartments}
      onChange={mockOnChange}
      {...overrides}
    />
  );
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe("EmployeeFilters", () => {
  it("renders a search input", () => {
    renderFilters();
    expect(screen.getByRole("searchbox")).toBeInTheDocument();
  });

  it("renders an employment type select", () => {
    renderFilters();
    expect(screen.getByRole("combobox", { name: /employment type/i })).toBeInTheDocument();
  });

  it("renders a department select with the provided departments", async () => {
    renderFilters();
    await userEvent.click(screen.getByRole("combobox", { name: /department/i }));
    expect(await screen.findByRole("option", { name: "Engineering" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Design" })).toBeInTheDocument();
  });

  it("renders a job title select with the provided job titles", async () => {
    renderFilters();
    await userEvent.click(screen.getByRole("combobox", { name: /job title/i }));
    expect(await screen.findByRole("option", { name: "Engineer" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Designer" })).toBeInTheDocument();
  });

  it("calls onChange with updated q when search input changes", async () => {
    renderFilters();
    await userEvent.type(screen.getByRole("searchbox"), "Jane");
    expect(mockOnChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ q: "Jane" })
    );
  });

  it("calls onChange with updated employment_type when select changes", async () => {
    renderFilters();
    await userEvent.click(screen.getByRole("combobox", { name: /employment type/i }));
    await userEvent.click(await screen.findByRole("option", { name: /full time/i }));
    expect(mockOnChange).toHaveBeenCalledWith(
      expect.objectContaining({ employment_type: "full_time" })
    );
  });

  it("calls onChange with updated department_id when department changes", async () => {
    renderFilters();
    await userEvent.click(screen.getByRole("combobox", { name: /department/i }));
    await userEvent.click(await screen.findByRole("option", { name: "Engineering" }));
    expect(mockOnChange).toHaveBeenCalledWith(
      expect.objectContaining({ department_id: 1 })
    );
  });

  it("calls onChange with updated job_title_id when job title changes", async () => {
    renderFilters();
    await userEvent.click(screen.getByRole("combobox", { name: /job title/i }));
    await userEvent.click(await screen.findByRole("option", { name: "Engineer" }));
    expect(mockOnChange).toHaveBeenCalledWith(
      expect.objectContaining({ job_title_id: 1 })
    );
  });

  it("pre-fills inputs with the provided filter values", () => {
    renderFilters({
      filters: { q: "Alice", employment_type: "part_time" },
    });
    expect(screen.getByRole("searchbox")).toHaveValue("Alice");
    expect(screen.getByRole("combobox", { name: /employment type/i })).toHaveTextContent("Part Time");
  });
});
