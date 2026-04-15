import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DepartmentManager from "@/components/settings/DepartmentManager";
import type { Department } from "@/types";

const mockDepartments: Department[] = [
  { id: 1, name: "Engineering" },
  { id: 2, name: "Design" },
];

const mockOnCreate = jest.fn();
const mockOnUpdate = jest.fn();
const mockOnDelete = jest.fn();

function renderManager(overrides = {}) {
  return render(
    <DepartmentManager
      departments={mockDepartments}
      onCreate={mockOnCreate}
      onUpdate={mockOnUpdate}
      onDelete={mockOnDelete}
      {...overrides}
    />
  );
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe("DepartmentManager", () => {
  it("renders a list of departments", () => {
    renderManager();
    expect(screen.getByText("Engineering")).toBeInTheDocument();
    expect(screen.getByText("Design")).toBeInTheDocument();
  });

  it("renders an add form with a name input and submit button", () => {
    renderManager();
    expect(screen.getByPlaceholderText(/new department/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /add/i })).toBeInTheDocument();
  });

  it("calls onCreate with the name when the add form is submitted", async () => {
    mockOnCreate.mockResolvedValue(undefined);
    renderManager();
    await userEvent.type(screen.getByPlaceholderText(/new department/i), "Marketing");
    await userEvent.click(screen.getByRole("button", { name: /add/i }));
    expect(mockOnCreate).toHaveBeenCalledWith("Marketing");
  });

  it("clears the input after successful create", async () => {
    mockOnCreate.mockResolvedValue(undefined);
    renderManager();
    const input = screen.getByPlaceholderText(/new department/i);
    await userEvent.type(input, "Marketing");
    await userEvent.click(screen.getByRole("button", { name: /add/i }));
    await waitFor(() => {
      expect(input).toHaveValue("");
    });
  });

  it("renders a delete button for each department", () => {
    renderManager();
    expect(screen.getAllByRole("button", { name: /delete/i })).toHaveLength(2);
  });

  it("calls onDelete with the department id when delete is clicked", async () => {
    mockOnDelete.mockResolvedValue(undefined);
    renderManager();
    await userEvent.click(screen.getAllByRole("button", { name: /delete/i })[0]);
    expect(mockOnDelete).toHaveBeenCalledWith(1);
  });

  it("renders an edit button for each department", () => {
    renderManager();
    expect(screen.getAllByRole("button", { name: /edit/i })).toHaveLength(2);
  });

  it("shows an inline edit input when edit is clicked", async () => {
    renderManager();
    await userEvent.click(screen.getAllByRole("button", { name: /edit/i })[0]);
    expect(screen.getByDisplayValue("Engineering")).toBeInTheDocument();
  });

  it("calls onUpdate with id and new name when the edit form is saved", async () => {
    mockOnUpdate.mockResolvedValue(undefined);
    renderManager();
    await userEvent.click(screen.getAllByRole("button", { name: /edit/i })[0]);
    const editInput = screen.getByDisplayValue("Engineering");
    await userEvent.clear(editInput);
    await userEvent.type(editInput, "Platform Engineering");
    await userEvent.click(screen.getByRole("button", { name: /save/i }));
    expect(mockOnUpdate).toHaveBeenCalledWith(1, "Platform Engineering");
  });
});
