import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SignInForm from "@/components/auth/SignInForm";
import { AuthContext } from "@/contexts/AuthContext";

const mockSignIn = jest.fn();
const mockPush = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

function renderForm(signIn = mockSignIn) {
  return render(
    <AuthContext.Provider value={{ token: null, signIn, signOut: jest.fn() }}>
      <SignInForm />
    </AuthContext.Provider>
  );
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe("SignInForm", () => {
  it("renders an email field", () => {
    renderForm();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  });

  it("renders a password field", () => {
    renderForm();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it("renders a sign in submit button", () => {
    renderForm();
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
  });

  it("calls signIn with the entered email and password on submit", async () => {
    mockSignIn.mockResolvedValue(undefined);
    renderForm();

    await userEvent.type(screen.getByLabelText(/email/i), "hr@example.com");
    await userEvent.type(screen.getByLabelText(/password/i), "Password1!");
    await userEvent.click(screen.getByRole("button", { name: /sign in/i }));

    expect(mockSignIn).toHaveBeenCalledWith("hr@example.com", "Password1!");
  });

  it("redirects to /employees after successful sign in", async () => {
    mockSignIn.mockResolvedValue(undefined);
    renderForm();

    await userEvent.type(screen.getByLabelText(/email/i), "hr@example.com");
    await userEvent.type(screen.getByLabelText(/password/i), "Password1!");
    await userEvent.click(screen.getByRole("button", { name: /sign in/i }));

    expect(mockPush).toHaveBeenCalledWith("/employees");
  });

  it("shows an error message when sign in fails", async () => {
    mockSignIn.mockRejectedValue(new Error("Invalid credentials"));
    renderForm();

    await userEvent.type(screen.getByLabelText(/email/i), "bad@example.com");
    await userEvent.type(screen.getByLabelText(/password/i), "wrong");
    await userEvent.click(screen.getByRole("button", { name: /sign in/i }));

    expect(await screen.findByRole("alert")).toBeInTheDocument();
  });

  it("disables the submit button while sign in is in progress", async () => {
    mockSignIn.mockImplementation(() => new Promise(() => {})); // never resolves
    renderForm();

    await userEvent.type(screen.getByLabelText(/email/i), "hr@example.com");
    await userEvent.type(screen.getByLabelText(/password/i), "Password1!");
    await userEvent.click(screen.getByRole("button", { name: /sign in/i }));

    expect(screen.getByRole("button", { name: /sign in/i })).toBeDisabled();
  });
});
