import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DeleteEmployeeButton from "@/components/employees/DeleteEmployeeButton";

const mockOnDelete = jest.fn();

function renderButton(overrides = {}) {
  return render(
    <DeleteEmployeeButton employeeId={1} onDelete={mockOnDelete} {...overrides} />
  );
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe("DeleteEmployeeButton", () => {
  it("renders a delete button", () => {
    renderButton();
    expect(screen.getByRole("button", { name: /delete/i })).toBeInTheDocument();
  });

  it("shows a confirmation dialog when delete is clicked", async () => {
    renderButton();
    await userEvent.click(screen.getByRole("button", { name: /delete/i }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("shows a confirm and cancel button in the dialog", async () => {
    renderButton();
    await userEvent.click(screen.getByRole("button", { name: /delete/i }));
    expect(screen.getByRole("button", { name: /confirm/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
  });

  it("calls onDelete with the employee id when confirmed", async () => {
    mockOnDelete.mockResolvedValue(undefined);
    renderButton();
    await userEvent.click(screen.getByRole("button", { name: /delete/i }));
    await userEvent.click(screen.getByRole("button", { name: /confirm/i }));
    expect(mockOnDelete).toHaveBeenCalledWith(1);
  });

  it("does not call onDelete when cancel is clicked", async () => {
    renderButton();
    await userEvent.click(screen.getByRole("button", { name: /delete/i }));
    await userEvent.click(screen.getByRole("button", { name: /cancel/i }));
    expect(mockOnDelete).not.toHaveBeenCalled();
  });

  it("closes the dialog after cancel", async () => {
    renderButton();
    await userEvent.click(screen.getByRole("button", { name: /delete/i }));
    await userEvent.click(screen.getByRole("button", { name: /cancel/i }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("disables the confirm button while deletion is in progress", async () => {
    mockOnDelete.mockImplementation(() => new Promise(() => {})); // never resolves
    renderButton();
    await userEvent.click(screen.getByRole("button", { name: /delete/i }));
    await userEvent.click(screen.getByRole("button", { name: /confirm/i }));
    expect(screen.getByRole("button", { name: /deleting/i })).toBeDisabled();
  });
});
