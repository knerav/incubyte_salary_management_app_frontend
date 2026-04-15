import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Navbar from "@/components/layout/Navbar";
import { AuthContext } from "@/contexts/AuthContext";

const mockSignOut = jest.fn();

function renderNavbar(token: string | null = "Bearer mock.token") {
  return render(
    <AuthContext.Provider value={{ token, signIn: jest.fn(), signOut: mockSignOut }}>
      <Navbar />
    </AuthContext.Provider>
  );
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe("Navbar", () => {
  it("renders a link to the employees page", () => {
    renderNavbar();
    expect(screen.getByRole("link", { name: /employees/i })).toBeInTheDocument();
  });

  it("renders a link to the insights page", () => {
    renderNavbar();
    expect(screen.getByRole("link", { name: /insights/i })).toBeInTheDocument();
  });

  it("renders a link to the settings page", () => {
    renderNavbar();
    expect(screen.getByRole("link", { name: /settings/i })).toBeInTheDocument();
  });

  it("renders a sign out button when authenticated", () => {
    renderNavbar();
    expect(screen.getByRole("button", { name: /sign out/i })).toBeInTheDocument();
  });

  it("calls signOut when the sign out button is clicked", async () => {
    renderNavbar();
    await userEvent.click(screen.getByRole("button", { name: /sign out/i }));
    expect(mockSignOut).toHaveBeenCalledTimes(1);
  });

  it("does not render the sign out button when unauthenticated", () => {
    renderNavbar(null);
    expect(screen.queryByRole("button", { name: /sign out/i })).not.toBeInTheDocument();
  });
});
