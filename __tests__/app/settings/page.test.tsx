import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SettingsPage from "@/app/settings/page";

jest.mock("@/lib/api", () => ({
  listJobTitles: jest.fn(),
  listDepartments: jest.fn(),
  createJobTitle: jest.fn(),
  updateJobTitle: jest.fn(),
  deleteJobTitle: jest.fn(),
  createDepartment: jest.fn(),
  updateDepartment: jest.fn(),
  deleteDepartment: jest.fn(),
}));

import {
  listJobTitles,
  listDepartments,
  createJobTitle,
  deleteJobTitle,
  createDepartment,
  deleteDepartment,
} from "@/lib/api";

const mockListJobTitles = listJobTitles as jest.MockedFunction<typeof listJobTitles>;
const mockListDepartments = listDepartments as jest.MockedFunction<typeof listDepartments>;
const mockCreateJobTitle = createJobTitle as jest.MockedFunction<typeof createJobTitle>;
const mockDeleteJobTitle = deleteJobTitle as jest.MockedFunction<typeof deleteJobTitle>;
const mockCreateDepartment = createDepartment as jest.MockedFunction<typeof createDepartment>;
const mockDeleteDepartment = deleteDepartment as jest.MockedFunction<typeof deleteDepartment>;

beforeEach(() => {
  jest.clearAllMocks();
  mockListJobTitles.mockResolvedValue([
    { id: 1, name: "Engineer" },
    { id: 2, name: "Designer" },
  ]);
  mockListDepartments.mockResolvedValue([
    { id: 1, name: "Engineering" },
    { id: 2, name: "Design" },
  ]);
});

describe("SettingsPage", () => {
  it("renders a settings heading", async () => {
    render(<SettingsPage />);
    expect(await screen.findByRole("heading", { name: /settings/i })).toBeInTheDocument();
  });

  it("renders the job titles section", async () => {
    render(<SettingsPage />);
    expect(await screen.findByText("Engineer")).toBeInTheDocument();
    expect(screen.getByText("Designer")).toBeInTheDocument();
  });

  it("renders the departments section", async () => {
    render(<SettingsPage />);
    expect(await screen.findByText("Engineering")).toBeInTheDocument();
    expect(screen.getByText("Design")).toBeInTheDocument();
  });

  it("calls createJobTitle and refetches after adding a job title", async () => {
    mockCreateJobTitle.mockResolvedValue({ id: 3, name: "Manager" });
    render(<SettingsPage />);
    await screen.findByText("Engineer");

    await userEvent.type(screen.getByPlaceholderText(/new job title/i), "Manager");
    await userEvent.click(screen.getAllByRole("button", { name: /add/i })[0]);

    await waitFor(() => {
      expect(mockCreateJobTitle).toHaveBeenCalledWith("Manager");
      expect(mockListJobTitles).toHaveBeenCalledTimes(2);
    });
  });

  it("calls deleteJobTitle and refetches after deleting a job title", async () => {
    mockDeleteJobTitle.mockResolvedValue(undefined);
    render(<SettingsPage />);
    await screen.findByText("Engineer");

    await userEvent.click(screen.getAllByRole("button", { name: /delete/i })[0]);

    await waitFor(() => {
      expect(mockDeleteJobTitle).toHaveBeenCalledWith(1);
      expect(mockListJobTitles).toHaveBeenCalledTimes(2);
    });
  });

  it("calls createDepartment and refetches after adding a department", async () => {
    mockCreateDepartment.mockResolvedValue({ id: 3, name: "Marketing" });
    render(<SettingsPage />);
    await screen.findByText("Engineering");

    await userEvent.type(screen.getByPlaceholderText(/new department/i), "Marketing");
    await userEvent.click(screen.getAllByRole("button", { name: /add/i })[1]);

    await waitFor(() => {
      expect(mockCreateDepartment).toHaveBeenCalledWith("Marketing");
      expect(mockListDepartments).toHaveBeenCalledTimes(2);
    });
  });

  it("calls deleteDepartment and refetches after deleting a department", async () => {
    mockDeleteDepartment.mockResolvedValue(undefined);
    render(<SettingsPage />);
    await screen.findByText("Engineering");

    await userEvent.click(screen.getAllByRole("button", { name: /delete/i })[2]);

    await waitFor(() => {
      expect(mockDeleteDepartment).toHaveBeenCalledWith(1);
      expect(mockListDepartments).toHaveBeenCalledTimes(2);
    });
  });
});
