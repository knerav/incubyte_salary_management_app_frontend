import { render, waitFor } from "@testing-library/react";
import Home from "@/app/page";

const mockReplace = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mockReplace }),
}));

beforeEach(() => {
  jest.clearAllMocks();
});

describe("Home (root page)", () => {
  it("redirects to /employees on mount", async () => {
    render(<Home />);
    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/employees");
    });
  });

  it("renders nothing visible", () => {
    const { container } = render(<Home />);
    expect(container.firstChild).toBeNull();
  });
});
