import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Navbar from "@/components/layout/Navbar";
import { AuthContext } from "@/contexts/AuthContext";

const mockSignOut = jest.fn();
const mockPush = jest.fn();
const mockPathname = jest.fn(() => "/employees");

jest.mock("next/navigation", () => ({
  usePathname: () => mockPathname(),
  useRouter: () => ({ push: mockPush }),
}));

function renderNavbar(token: string | null = "Bearer mock.token") {
  return render(
    <AuthContext.Provider value={{ token, signIn: jest.fn(), signUp: jest.fn(), signOut: mockSignOut }}>
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
  mockSignOut.mockResolvedValue(undefined);
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

    it("renders a link to the settings page", () => {
      renderNavbar();
      expect(screen.getByRole("link", { name: /settings/i })).toBeInTheDocument();
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

    it("does not render a standalone settings item in the dropdown (it is a nav link)", async () => {
      renderNavbar();
      // Settings nav link exists in the document
      expect(screen.getByRole("link", { name: /settings/i })).toBeInTheDocument();
      // The dropdown only has sign out as an action item
      await openUserMenu();
      expect(screen.queryByRole("menuitem", { name: /sign out/i })).toBeInTheDocument();
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

    it("redirects to /sign-in after sign out completes", async () => {
      renderNavbar();
      await openUserMenu();
      await userEvent.click(screen.getByRole("menuitem", { name: /sign out/i }));
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/sign-in");
      });
    });
  });

  describe("auth pages", () => {
    it("does not render on the sign-in page", () => {
      mockPathname.mockReturnValue("/sign-in");
      renderNavbar();
      expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
    });

    it("does not render on the sign-up page", () => {
      mockPathname.mockReturnValue("/sign-up");
      renderNavbar();
      expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
    });
  });
});
