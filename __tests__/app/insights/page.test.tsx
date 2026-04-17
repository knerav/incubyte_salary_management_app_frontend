import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import InsightsPage from "@/app/insights/page";
import type { SalaryInsights } from "@/types";

jest.mock("@/lib/api", () => ({
  getSalaryInsights: jest.fn(),
  listJobTitles: jest.fn(),
  listDepartments: jest.fn(),
  listCountries: jest.fn(),
}));

import {
  getSalaryInsights,
  listJobTitles,
  listDepartments,
  listCountries,
} from "@/lib/api";

const mockGetSalaryInsights = getSalaryInsights as jest.MockedFunction<typeof getSalaryInsights>;
const mockListJobTitles = listJobTitles as jest.MockedFunction<typeof listJobTitles>;
const mockListDepartments = listDepartments as jest.MockedFunction<typeof listDepartments>;
const mockListCountries = listCountries as jest.MockedFunction<typeof listCountries>;

const mockInsights: SalaryInsights = {
  filters: {},
  insights: {
    employee_count: 10,
    min_salary: "50000.00",
    max_salary: "120000.00",
    avg_salary: "85000.00",
    currency_code: "GBP",
    currency_symbol: "£",
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
    currency_code: "GBP",
    currency_symbol: "£",
    breakdowns: [],
  },
};

beforeEach(() => {
  jest.clearAllMocks();
  mockGetSalaryInsights.mockResolvedValue(mockInsights);
  mockListJobTitles.mockResolvedValue([{ id: 1, name: "Engineer" }]);
  mockListDepartments.mockResolvedValue([{ id: 1, name: "Engineering" }]);
  mockListCountries.mockResolvedValue([
    { code: "GB", name: "United Kingdom" },
    { code: "US", name: "United States" },
  ]);
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

  it("renders a country filter select", async () => {
    render(<InsightsPage />);
    expect(await screen.findByRole("combobox", { name: /country/i })).toBeInTheDocument();
  });

  it("populates the country dropdown with results from listCountries", async () => {
    render(<InsightsPage />);
    await userEvent.click(await screen.findByRole("combobox", { name: /country/i }));
    expect(await screen.findByRole("option", { name: "United Kingdom" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "United States" })).toBeInTheDocument();
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

  it("refetches insights when country filter changes", async () => {
    render(<InsightsPage />);
    await screen.findByRole("combobox", { name: /country/i });

    await userEvent.click(screen.getByRole("combobox", { name: /country/i }));
    await userEvent.click(await screen.findByRole("option", { name: "United States" }));

    await waitFor(() => {
      expect(mockGetSalaryInsights).toHaveBeenCalledTimes(2);
    });
    expect(mockGetSalaryInsights).toHaveBeenLastCalledWith(
      expect.objectContaining({ country: "US" })
    );
  });

  it("seeds the filter state from the backend default on initial load", async () => {
    mockGetSalaryInsights.mockResolvedValue({
      ...mockInsights,
      filters: { country: "IN" },
    });
    mockListCountries.mockResolvedValue([
      { code: "IN", name: "India" },
      { code: "GB", name: "United Kingdom" },
    ]);

    render(<InsightsPage />);

    // Change an unrelated filter — the request must carry the backend-seeded country
    await screen.findByRole("combobox", { name: /department/i });
    await userEvent.click(screen.getByRole("combobox", { name: /department/i }));
    await userEvent.click(await screen.findByRole("option", { name: "Engineering" }));

    await waitFor(() => {
      expect(mockGetSalaryInsights).toHaveBeenCalledTimes(2);
    });
    expect(mockGetSalaryInsights).toHaveBeenLastCalledWith(
      expect.objectContaining({ country: "IN" })
    );
  });

  it("refetches insights when a filter changes", async () => {
    render(<InsightsPage />);
    await screen.findByRole("combobox", { name: /department/i });

    await userEvent.click(screen.getByRole("combobox", { name: /department/i }));
    await userEvent.click(await screen.findByRole("option", { name: "Engineering" }));

    await waitFor(() => {
      expect(mockGetSalaryInsights).toHaveBeenCalledTimes(2);
    });
  });
});
