import { render, screen } from "@testing-library/react";
import SalaryHistoryChart from "@/components/insights/SalaryHistoryChart";
import type { HistoricalSalaryInsights } from "@/types";

// Mock chart.js so tests don't need a canvas environment
jest.mock("react-chartjs-2", () => ({
  Line: ({ "aria-label": label }: { "aria-label"?: string }) => (
    <div data-testid="line-chart" aria-label={label ?? "Salary history chart"}>
      Chart
    </div>
  ),
}));

const mockHistory: HistoricalSalaryInsights = {
  filters: {},
  group_by: "month",
  series: [
    { period: "2024-01", avg_salary: "90000.00", employee_count: 10 },
    { period: "2024-02", avg_salary: "92000.00", employee_count: 12 },
  ],
};

describe("SalaryHistoryChart", () => {
  it("renders a chart when data is provided", () => {
    render(<SalaryHistoryChart history={mockHistory} />);
    expect(screen.getByTestId("line-chart")).toBeInTheDocument();
  });

  it("renders an accessible label on the chart", () => {
    render(<SalaryHistoryChart history={mockHistory} />);
    expect(screen.getByRole("img", { name: /salary history/i })).toBeInTheDocument();
  });

  it("shows an empty state message when there is no series data", () => {
    const empty: HistoricalSalaryInsights = { ...mockHistory, series: [] };
    render(<SalaryHistoryChart history={empty} />);
    expect(screen.getByText(/no data/i)).toBeInTheDocument();
  });
});
