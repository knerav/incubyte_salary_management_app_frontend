import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import InsightsPage from "@/app/insights/page";
import type { SalaryInsights, HistoricalSalaryInsights } from "@/types";

jest.mock("@/lib/api", () => ({
  getSalaryInsights: jest.fn(),
  getHistoricalSalaryInsights: jest.fn(),
  listJobTitles: jest.fn(),
  listDepartments: jest.fn(),
}));

jest.mock("react-chartjs-2", () => ({
  Line: () => <div data-testid="line-chart">Chart</div>,
}));

import {
  getSalaryInsights,
  getHistoricalSalaryInsights,
  listJobTitles,
  listDepartments,
} from "@/lib/api";

const mockGetSalaryInsights = getSalaryInsights as jest.MockedFunction<typeof getSalaryInsights>;
const mockGetHistoricalSalaryInsights = getHistoricalSalaryInsights as jest.MockedFunction<
  typeof getHistoricalSalaryInsights
>;
const mockListJobTitles = listJobTitles as jest.MockedFunction<typeof listJobTitles>;
const mockListDepartments = listDepartments as jest.MockedFunction<typeof listDepartments>;

const mockInsights: SalaryInsights = {
  filters: {},
  insights: {
    employee_count: 10,
    min_salary: "50000.00",
    max_salary: "120000.00",
    avg_salary: "85000.00",
    breakdowns: [{ job_title: "Engineer", avg_salary: "90000.00" }],
  },
};

const emptyInsights: SalaryInsights = {
  filters: {},
  insights: {
    employee_count: 0,
    min_salary: "0.00",
    max_salary: "0.00",
    avg_salary: "0.00",
    breakdowns: [],
  },
};

const mockHistory: HistoricalSalaryInsights = {
  filters: {},
  group_by: "month",
  series: [{ period: "2024-01", avg_salary: "85000.00", employee_count: 10 }],
};

beforeEach(() => {
  jest.clearAllMocks();
  mockGetSalaryInsights.mockResolvedValue(mockInsights);
  mockGetHistoricalSalaryInsights.mockResolvedValue(mockHistory);
  mockListJobTitles.mockResolvedValue([{ id: 1, name: "Engineer" }]);
  mockListDepartments.mockResolvedValue([{ id: 1, name: "Engineering" }]);
});

describe("InsightsPage", () => {
  it("renders a heading for insights", async () => {
    render(<InsightsPage />);
    expect(await screen.findByRole("heading", { name: /insights/i })).toBeInTheDocument();
  });

  it("calls getSalaryInsights and shows results", async () => {
    render(<InsightsPage />);
    await waitFor(() => {
      expect(mockGetSalaryInsights).toHaveBeenCalledTimes(1);
    });
    expect(await screen.findByText(/85000/)).toBeInTheDocument();
  });

  it("calls getHistoricalSalaryInsights and shows the chart", async () => {
    render(<InsightsPage />);
    await waitFor(() => {
      expect(mockGetHistoricalSalaryInsights).toHaveBeenCalledTimes(1);
    });
    expect(await screen.findByTestId("line-chart")).toBeInTheDocument();
  });

  it("renders a department filter select", async () => {
    render(<InsightsPage />);
    expect(await screen.findByRole("combobox", { name: /department/i })).toBeInTheDocument();
  });

  it("renders a job title filter select", async () => {
    render(<InsightsPage />);
    expect(await screen.findByRole("combobox", { name: /job title/i })).toBeInTheDocument();
  });

  it("shows an empty state when no employees match the current filters", async () => {
    mockGetSalaryInsights.mockResolvedValue(emptyInsights);
    render(<InsightsPage />);
    expect(await screen.findByText(/no data to display/i)).toBeInTheDocument();
  });

  it("refetches insights when a filter changes", async () => {
    render(<InsightsPage />);
    await screen.findByRole("combobox", { name: /department/i });

    await userEvent.click(screen.getByRole("combobox", { name: /department/i }));
    await userEvent.click(await screen.findByRole("option", { name: "Engineering" }));

    await waitFor(() => {
      expect(mockGetSalaryInsights).toHaveBeenCalledTimes(2);
      expect(mockGetHistoricalSalaryInsights).toHaveBeenCalledTimes(2);
    });
  });
});
