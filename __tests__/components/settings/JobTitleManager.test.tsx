import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import JobTitleManager from "@/components/settings/JobTitleManager";
import type { JobTitle } from "@/types";

const mockJobTitles: JobTitle[] = [
  { id: 1, name: "Engineer" },
  { id: 2, name: "Designer" },
];

const mockOnCreate = jest.fn();
const mockOnUpdate = jest.fn();
const mockOnDelete = jest.fn();

function renderManager(overrides = {}) {
  return render(
    <JobTitleManager
      jobTitles={mockJobTitles}
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

describe("JobTitleManager", () => {
  it("renders a list of job titles", () => {
    renderManager();
    expect(screen.getByText("Engineer")).toBeInTheDocument();
    expect(screen.getByText("Designer")).toBeInTheDocument();
  });

  it("renders an add form with a name input and submit button", () => {
    renderManager();
    expect(screen.getByPlaceholderText(/new job title/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /add/i })).toBeInTheDocument();
  });

  it("calls onCreate with the name when the add form is submitted", async () => {
    mockOnCreate.mockResolvedValue(undefined);
    renderManager();
    await userEvent.type(screen.getByPlaceholderText(/new job title/i), "Manager");
    await userEvent.click(screen.getByRole("button", { name: /add/i }));
    expect(mockOnCreate).toHaveBeenCalledWith("Manager");
  });

  it("clears the input after successful create", async () => {
    mockOnCreate.mockResolvedValue(undefined);
    renderManager();
    const input = screen.getByPlaceholderText(/new job title/i);
    await userEvent.type(input, "Manager");
    await userEvent.click(screen.getByRole("button", { name: /add/i }));
    await waitFor(() => {
      expect(input).toHaveValue("");
    });
  });

  it("renders a delete button for each job title", () => {
    renderManager();
    expect(screen.getAllByRole("button", { name: /delete/i })).toHaveLength(2);
  });

  it("calls onDelete with the job title id when delete is clicked", async () => {
    mockOnDelete.mockResolvedValue(undefined);
    renderManager();
    await userEvent.click(screen.getAllByRole("button", { name: /delete/i })[0]);
    expect(mockOnDelete).toHaveBeenCalledWith(1);
  });

  it("renders an edit button for each job title", () => {
    renderManager();
    expect(screen.getAllByRole("button", { name: /edit/i })).toHaveLength(2);
  });

  it("shows an inline edit input when edit is clicked", async () => {
    renderManager();
    await userEvent.click(screen.getAllByRole("button", { name: /edit/i })[0]);
    expect(screen.getByDisplayValue("Engineer")).toBeInTheDocument();
  });

  it("calls onUpdate with id and new name when the edit form is saved", async () => {
    mockOnUpdate.mockResolvedValue(undefined);
    renderManager();
    await userEvent.click(screen.getAllByRole("button", { name: /edit/i })[0]);
    const editInput = screen.getByDisplayValue("Engineer");
    await userEvent.clear(editInput);
    await userEvent.type(editInput, "Senior Engineer");
    await userEvent.click(screen.getByRole("button", { name: /save/i }));
    expect(mockOnUpdate).toHaveBeenCalledWith(1, "Senior Engineer");
  });
});
