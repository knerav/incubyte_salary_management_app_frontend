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

  it("shows the average salary", () => {
    render(<SalaryInsightsPanel insights={mockInsights} />);
    expect(screen.getByText(/95000/)).toBeInTheDocument();
  });

  it("shows the minimum salary", () => {
    render(<SalaryInsightsPanel insights={mockInsights} />);
    expect(screen.getByText("50000.00")).toBeInTheDocument();
  });

  it("shows the maximum salary", () => {
    render(<SalaryInsightsPanel insights={mockInsights} />);
    expect(screen.getByText("150000.00")).toBeInTheDocument();
  });

  it("shows a breakdown row for each job title", () => {
    render(<SalaryInsightsPanel insights={mockInsights} />);
    expect(screen.getByText("Engineer")).toBeInTheDocument();
    expect(screen.getByText("Designer")).toBeInTheDocument();
  });
});
