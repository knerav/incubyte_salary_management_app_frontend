import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SalaryUpdateForm from "@/components/employees/SalaryUpdateForm";

const mockOnSubmit = jest.fn();

function renderForm(overrides = {}) {
  return render(
    <SalaryUpdateForm
      currentSalary="90000.00"
      currentCurrency="USD"
      onSubmit={mockOnSubmit}
      {...overrides}
    />
  );
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe("SalaryUpdateForm", () => {
  it("renders a salary field pre-filled with the current salary", () => {
    renderForm();
    expect(screen.getByLabelText(/salary/i)).toHaveValue("90000.00");
  });

  it("renders a currency field pre-filled with the current currency", () => {
    renderForm();
    expect(screen.getByLabelText(/currency/i)).toHaveValue("USD");
  });

  it("renders a submit button", () => {
    renderForm();
    expect(screen.getByRole("button", { name: /update salary/i })).toBeInTheDocument();
  });

  it("calls onSubmit with the updated salary and currency", async () => {
    mockOnSubmit.mockResolvedValue(undefined);
    renderForm();

    const salaryInput = screen.getByLabelText(/salary/i);
    await userEvent.clear(salaryInput);
    await userEvent.type(salaryInput, "95000.00");
    await userEvent.click(screen.getByRole("button", { name: /update salary/i }));

    expect(mockOnSubmit).toHaveBeenCalledWith({
      salary: "95000.00",
      currency: "USD",
    });
  });

  it("shows validation errors when onSubmit rejects with errors", async () => {
    mockOnSubmit.mockRejectedValue({
      errors: { salary: ["must be greater than 0"] },
    });
    renderForm();

    await userEvent.click(screen.getByRole("button", { name: /update salary/i }));

    expect(await screen.findByText(/must be greater than 0/i)).toBeInTheDocument();
  });

  it("disables the submit button while submitting", async () => {
    mockOnSubmit.mockImplementation(() => new Promise(() => {})); // never resolves
    renderForm();

    await userEvent.click(screen.getByRole("button", { name: /update salary/i }));

    expect(screen.getByRole("button", { name: /updating/i })).toBeDisabled();
  });
});
