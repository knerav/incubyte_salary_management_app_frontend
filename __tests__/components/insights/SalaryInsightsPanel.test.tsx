import { render, screen } from "@testing-library/react";
import SalaryInsightsPanel from "@/components/insights/SalaryInsightsPanel";
import type { SalaryInsights } from "@/types";

const mockInsights: SalaryInsights = {
  filters: {},
  insights: {
    employee_count: 42,
    min_salary: "50000.00",
    max_salary: "150000.00",
    avg_salary: "95000.00",
    currency_code: "GBP",
    currency_symbol: "£",
    breakdowns: [
      { job_title: "Engineer", avg_salary: "100000.00" },
      { job_title: "Designer", avg_salary: "85000.00" },
    ],
  },
};

describe("SalaryInsightsPanel", () => {
  it("shows the employee count", () => {
    render(<SalaryInsightsPanel insights={mockInsights} />);
    expect(screen.getByText(/42/)).toBeInTheDocument();
  });

  it("shows the average salary prefixed with the currency symbol", () => {
    render(<SalaryInsightsPanel insights={mockInsights} />);
    expect(screen.getByText("£95000.00")).toBeInTheDocument();
  });

  it("shows the minimum salary prefixed with the currency symbol", () => {
    render(<SalaryInsightsPanel insights={mockInsights} />);
    expect(screen.getByText("£50000.00")).toBeInTheDocument();
  });

  it("shows the maximum salary prefixed with the currency symbol", () => {
    render(<SalaryInsightsPanel insights={mockInsights} />);
    expect(screen.getByText("£150000.00")).toBeInTheDocument();
  });

  it("shows a breakdown row for each job title", () => {
    render(<SalaryInsightsPanel insights={mockInsights} />);
    expect(screen.getByText("Engineer")).toBeInTheDocument();
    expect(screen.getByText("Designer")).toBeInTheDocument();
  });

  it("prefixes breakdown salary values with the currency symbol", () => {
    render(<SalaryInsightsPanel insights={mockInsights} />);
    expect(screen.getByText("£100000.00")).toBeInTheDocument();
    expect(screen.getByText("£85000.00")).toBeInTheDocument();
  });

  it("uses the correct symbol when currency differs from the default", () => {
    const usdInsights: SalaryInsights = {
      ...mockInsights,
      insights: { ...mockInsights.insights, currency_code: "USD", currency_symbol: "$" },
    };
    render(<SalaryInsightsPanel insights={usdInsights} />);
    expect(screen.getByText("$95000.00")).toBeInTheDocument();
  });
});
