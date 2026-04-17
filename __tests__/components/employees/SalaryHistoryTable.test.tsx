import { render, screen } from "@testing-library/react";
import SalaryHistoryTable from "@/components/employees/SalaryHistoryTable";
import type { SalaryHistoryEntry } from "@/types";

const mockHistory: SalaryHistoryEntry[] = [
  { effective_from: "2022-03-14", salary: "95000.00", currency: "USD", change: null },
  { effective_from: "2023-01-01", salary: "105000.00", currency: "USD", change: "+10.53%" },
  { effective_from: "2024-06-01", salary: "110000.00", currency: "USD", change: "+4.76%" },
];

describe("SalaryHistoryTable", () => {
  it("renders a row for each salary history entry", () => {
    render(<SalaryHistoryTable history={mockHistory} />);
    expect(screen.getByText("2022-03-14")).toBeInTheDocument();
    expect(screen.getByText("2023-01-01")).toBeInTheDocument();
    expect(screen.getByText("2024-06-01")).toBeInTheDocument();
  });

  it("renders the salary and currency for each entry", () => {
    render(<SalaryHistoryTable history={mockHistory} />);
    expect(screen.getByText("95000.00 USD")).toBeInTheDocument();
    expect(screen.getByText("105000.00 USD")).toBeInTheDocument();
  });

  it("renders the percentage change for entries after the first", () => {
    render(<SalaryHistoryTable history={mockHistory} />);
    expect(screen.getByText("+10.53%")).toBeInTheDocument();
    expect(screen.getByText("+4.76%")).toBeInTheDocument();
  });

  it("renders a dash for the first entry where change is null", () => {
    render(<SalaryHistoryTable history={mockHistory} />);
    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("renders an empty state when there is no history", () => {
    render(<SalaryHistoryTable history={[]} />);
    expect(screen.getByText(/no salary history/i)).toBeInTheDocument();
  });
});
