import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SignUpForm from "@/components/auth/SignUpForm";
import { AuthContext } from "@/contexts/AuthContext";

const mockSignUp = jest.fn();
const mockPush = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

function renderForm(signUp = mockSignUp) {
  return render(
    <AuthContext.Provider value={{ token: null, signIn: jest.fn(), signUp, signOut: jest.fn() }}>
      <SignUpForm />
    </AuthContext.Provider>
  );
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe("SignUpForm", () => {
  it("renders an email field", () => {
    renderForm();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  });

  it("renders a password field", () => {
    renderForm();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
  });

  it("renders a confirm password field", () => {
    renderForm();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
  });

  it("renders a sign up submit button", () => {
    renderForm();
    expect(screen.getByRole("button", { name: /sign up/i })).toBeInTheDocument();
  });

  it("calls signUp with email, password, and confirmation on submit", async () => {
    mockSignUp.mockResolvedValue(undefined);
    renderForm();

    await userEvent.type(screen.getByLabelText(/email/i), "new@example.com");
    await userEvent.type(screen.getByLabelText(/^password$/i), "Password1!");
    await userEvent.type(screen.getByLabelText(/confirm password/i), "Password1!");
    await userEvent.click(screen.getByRole("button", { name: /sign up/i }));

    expect(mockSignUp).toHaveBeenCalledWith("new@example.com", "Password1!", "Password1!");
  });

  it("redirects to /employees after successful sign up", async () => {
    mockSignUp.mockResolvedValue(undefined);
    renderForm();

    await userEvent.type(screen.getByLabelText(/email/i), "new@example.com");
    await userEvent.type(screen.getByLabelText(/^password$/i), "Password1!");
    await userEvent.type(screen.getByLabelText(/confirm password/i), "Password1!");
    await userEvent.click(screen.getByRole("button", { name: /sign up/i }));

    expect(mockPush).toHaveBeenCalledWith("/employees");
  });

  it("shows a client-side error when passwords do not match", async () => {
    renderForm();

    await userEvent.type(screen.getByLabelText(/email/i), "new@example.com");
    await userEvent.type(screen.getByLabelText(/^password$/i), "Password1!");
    await userEvent.type(screen.getByLabelText(/confirm password/i), "Different1!");
    await userEvent.click(screen.getByRole("button", { name: /sign up/i }));

    expect(await screen.findByRole("alert")).toBeInTheDocument();
    expect(mockSignUp).not.toHaveBeenCalled();
  });

  it("shows an error message when registration fails", async () => {
    mockSignUp.mockRejectedValue(new Error("Email has already been taken"));
    renderForm();

    await userEvent.type(screen.getByLabelText(/email/i), "taken@example.com");
    await userEvent.type(screen.getByLabelText(/^password$/i), "Password1!");
    await userEvent.type(screen.getByLabelText(/confirm password/i), "Password1!");
    await userEvent.click(screen.getByRole("button", { name: /sign up/i }));

    expect(await screen.findByRole("alert")).toBeInTheDocument();
  });

  it("disables the submit button while sign up is in progress", async () => {
    mockSignUp.mockImplementation(() => new Promise(() => {}));
    renderForm();

    await userEvent.type(screen.getByLabelText(/email/i), "new@example.com");
    await userEvent.type(screen.getByLabelText(/^password$/i), "Password1!");
    await userEvent.type(screen.getByLabelText(/confirm password/i), "Password1!");
    await userEvent.click(screen.getByRole("button", { name: /sign up/i }));

    expect(screen.getByRole("button", { name: /signing up/i })).toBeDisabled();
  });
});
