import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Navbar from "@/components/layout/Navbar";
import { AuthContext } from "@/contexts/AuthContext";

const mockSignOut = jest.fn();
const mockPathname = jest.fn(() => "/employees");

jest.mock("next/navigation", () => ({
  usePathname: () => mockPathname(),
}));

function renderNavbar(token: string | null = "Bearer mock.token") {
  return render(
    <AuthContext.Provider value={{ token, signIn: jest.fn(), signOut: mockSignOut }}>
      <Navbar />
    </AuthContext.Provider>
  );
}

async function openUserMenu() {
  await userEvent.click(screen.getByRole("button", { name: /user menu/i }));
}

beforeEach(() => {
  jest.clearAllMocks();
  mockPathname.mockReturnValue("/employees");
});

describe("Navbar", () => {
  describe("navigation links", () => {
    it("renders a link to the employees page", () => {
      renderNavbar();
      expect(screen.getAllByRole("link", { name: /employees/i })[0]).toBeInTheDocument();
    });

    it("renders a link to the insights page", () => {
      renderNavbar();
      expect(screen.getByRole("link", { name: /insights/i })).toBeInTheDocument();
    });

    it("applies an active style to the current page link", () => {
      mockPathname.mockReturnValue("/insights");
      renderNavbar();
      const insightsLink = screen.getByRole("link", { name: /insights/i });
      expect(insightsLink.className).toMatch(/bg-accent/);
    });

    it("does not apply an active style to inactive links", () => {
      mockPathname.mockReturnValue("/insights");
      renderNavbar();
      const employeesLinks = screen.getAllByRole("link", { name: /employees/i });
      employeesLinks.forEach((link) => {
        expect(link.className.split(" ")).not.toContain("bg-accent");
      });
    });
  });

  describe("user menu", () => {
    it("renders the user menu button when authenticated", () => {
      renderNavbar();
      expect(screen.getByRole("button", { name: /user menu/i })).toBeInTheDocument();
    });

    it("does not render the user menu button when unauthenticated", () => {
      renderNavbar(null);
      expect(screen.queryByRole("button", { name: /user menu/i })).not.toBeInTheDocument();
    });

    it("renders a link to the settings page in the dropdown", async () => {
      renderNavbar();
      await openUserMenu();
      expect(screen.getByRole("menuitem", { name: /settings/i })).toBeInTheDocument();
    });

    it("renders a sign out item in the dropdown", async () => {
      renderNavbar();
      await openUserMenu();
      expect(screen.getByRole("menuitem", { name: /sign out/i })).toBeInTheDocument();
    });

    it("calls signOut when the sign out item is clicked", async () => {
      renderNavbar();
      await openUserMenu();
      await userEvent.click(screen.getByRole("menuitem", { name: /sign out/i }));
      expect(mockSignOut).toHaveBeenCalledTimes(1);
    });
  });
});
