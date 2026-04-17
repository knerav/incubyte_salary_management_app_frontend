import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import EmployeeForm from "@/components/employees/EmployeeForm";
import type { Department, Employee, JobTitle } from "@/types";

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

const mockOnSubmit = jest.fn();

const mockJobTitles: JobTitle[] = [
  { id: 1, name: "Engineer" },
  { id: 2, name: "Designer" },
];

const mockDepartments: Department[] = [
  { id: 1, name: "Engineering" },
  { id: 2, name: "Design" },
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

function renderForm(overrides = {}) {
  return render(
    <EmployeeForm
      jobTitles={mockJobTitles}
      departments={mockDepartments}
      onSubmit={mockOnSubmit}
      {...overrides}
    />
  );
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe("EmployeeForm", () => {
  it("renders first name and last name fields", () => {
    renderForm();
    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
  });

  it("renders an email field", () => {
    renderForm();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  });

  it("renders a job title select with the provided options", async () => {
    renderForm();
    const trigger = screen.getByRole("combobox", { name: /job title/i });
    expect(trigger).toBeInTheDocument();
    await userEvent.click(trigger);
    expect(await screen.findByRole("option", { name: "Engineer" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Designer" })).toBeInTheDocument();
  });

  it("renders a department select with the provided options", async () => {
    renderForm();
    const trigger = screen.getByRole("combobox", { name: /department/i });
    expect(trigger).toBeInTheDocument();
    await userEvent.click(trigger);
    expect(await screen.findByRole("option", { name: "Engineering" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Design" })).toBeInTheDocument();
  });

  it("renders country and currency as dropdowns, salary and hired on as inputs", () => {
    renderForm();
    expect(screen.getByRole("combobox", { name: /country/i })).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: /currency/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/salary/i)).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: /employment type/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/hired on/i)).toBeInTheDocument();
  });

  it("populates the country dropdown with all country options", async () => {
    renderForm();
    await userEvent.click(screen.getByRole("combobox", { name: /country/i }));
    expect(await screen.findByRole("option", { name: "United Kingdom" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "United States" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "India" })).toBeInTheDocument();
  });

  it("populates the currency dropdown with all currency options", async () => {
    renderForm();
    await userEvent.click(screen.getByRole("combobox", { name: /currency/i }));
    expect(await screen.findByRole("option", { name: "GBP" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "USD" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "INR" })).toBeInTheDocument();
  });

  it("auto-populates the currency when a country is selected", async () => {
    renderForm();
    await userEvent.click(screen.getByRole("combobox", { name: /country/i }));
    await userEvent.click(await screen.findByRole("option", { name: "United Kingdom" }));
    expect(screen.getByRole("combobox", { name: /currency/i })).toHaveTextContent("GBP");
  });

  it("allows changing the currency independently after auto-population", async () => {
    renderForm();
    await userEvent.click(screen.getByRole("combobox", { name: /country/i }));
    await userEvent.click(await screen.findByRole("option", { name: "United Kingdom" }));
    await userEvent.click(screen.getByRole("combobox", { name: /currency/i }));
    await userEvent.click(await screen.findByRole("option", { name: "USD" }));
    expect(screen.getByRole("combobox", { name: /currency/i })).toHaveTextContent("USD");
  });

  it("renders a submit button", () => {
    renderForm();
    expect(screen.getByRole("button", { name: /save/i })).toBeInTheDocument();
  });

  it("pre-fills the form when an employee is provided (edit mode)", () => {
    renderForm({ employee: mockEmployee });
    expect(screen.getByLabelText(/first name/i)).toHaveValue("Jane");
    expect(screen.getByLabelText(/last name/i)).toHaveValue("Smith");
    expect(screen.getByLabelText(/email/i)).toHaveValue("jane@example.com");
    expect(screen.getByRole("combobox", { name: /country/i })).toHaveTextContent("United States");
    expect(screen.getByRole("combobox", { name: /currency/i })).toHaveTextContent("USD");
  });

  it("calls onSubmit with form data when submitted", async () => {
    mockOnSubmit.mockResolvedValue(undefined);
    renderForm();

    await userEvent.type(screen.getByLabelText(/first name/i), "Alice");
    await userEvent.type(screen.getByLabelText(/last name/i), "Brown");
    await userEvent.type(screen.getByLabelText(/email/i), "alice@example.com");

    await userEvent.click(screen.getByRole("combobox", { name: /job title/i }));
    await userEvent.click(await screen.findByRole("option", { name: "Engineer" }));

    await userEvent.click(screen.getByRole("combobox", { name: /department/i }));
    await userEvent.click(await screen.findByRole("option", { name: "Engineering" }));

    await userEvent.click(screen.getByRole("combobox", { name: /country/i }));
    await userEvent.click(await screen.findByRole("option", { name: "United States" }));

    await userEvent.type(screen.getByLabelText(/salary/i), "80000");

    // currency is auto-populated to USD by the country selection; keep it

    await userEvent.click(screen.getByRole("combobox", { name: /employment type/i }));
    await userEvent.click(await screen.findByRole("option", { name: /full time/i }));

    await userEvent.type(screen.getByLabelText(/hired on/i), "2023-01-01");
    await userEvent.click(screen.getByRole("button", { name: /save/i }));

    expect(mockOnSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        first_name: "Alice",
        last_name: "Brown",
        email: "alice@example.com",
        job_title_id: 1,
        department_id: 1,
        employment_type: "full_time",
      })
    );
  });

  it("shows validation errors when onSubmit rejects with errors", async () => {
    mockOnSubmit.mockRejectedValue({
      errors: { email: ["has already been taken"] },
    });
    renderForm();

    await userEvent.type(screen.getByLabelText(/first name/i), "Alice");
    await userEvent.click(screen.getByRole("button", { name: /save/i }));

    expect(await screen.findByText(/has already been taken/i)).toBeInTheDocument();
  });

  it("disables the submit button while submitting", async () => {
    mockOnSubmit.mockImplementation(() => new Promise(() => {})); // never resolves
    renderForm();

    await userEvent.type(screen.getByLabelText(/first name/i), "Alice");
    await userEvent.click(screen.getByRole("button", { name: /save/i }));

    expect(screen.getByRole("button", { name: /saving/i })).toBeDisabled();
  });
});
