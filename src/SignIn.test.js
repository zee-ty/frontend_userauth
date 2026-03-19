import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SignInForm from "./SignIn";

const mockAuth = {
  login: jest.fn(),
};
jest.mock("./api", () => ({
  auth: {
    get login() {
      return mockAuth.login;
    },
  },
}));

beforeEach(() => {
  mockAuth.login.mockReset();
});

describe("SignInForm", () => {
  it("renders sign in heading and inputs", () => {
    render(<SignInForm />);
    expect(screen.getByRole("heading", { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
  });

  it("shows error when submitting with empty email and password", async () => {
    render(<SignInForm />);
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));
    await waitFor(() => {
      expect(screen.getByText(/please enter email and password/i)).toBeInTheDocument();
    });
    expect(mockAuth.login).not.toHaveBeenCalled();
  });

  it("calls auth.login and onSuccess on successful submit", async () => {
    mockAuth.login.mockResolvedValueOnce({});
    const onSuccess = jest.fn();
    render(<SignInForm onSuccess={onSuccess} />);

    await userEvent.type(screen.getByPlaceholderText(/email/i), "test@example.com");
    await userEvent.type(screen.getByPlaceholderText(/password/i), "password123");
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(mockAuth.login).toHaveBeenCalledWith("test@example.com", "password123");
    });
    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it("shows error message when login fails", async () => {
    mockAuth.login.mockRejectedValueOnce(new Error("Invalid credentials"));
    render(<SignInForm />);

    await userEvent.type(screen.getByPlaceholderText(/email/i), "bad@test.com");
    await userEvent.type(screen.getByPlaceholderText(/password/i), "wrong");
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });
  });

  it("disables button and shows loading text while submitting", async () => {
    let resolveLogin;
    mockAuth.login.mockImplementationOnce(
      () => new Promise((r) => { resolveLogin = r; })
    );
    render(<SignInForm />);

    await userEvent.type(screen.getByPlaceholderText(/email/i), "a@b.com");
    await userEvent.type(screen.getByPlaceholderText(/password/i), "pass");
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    expect(screen.getByRole("button", { name: /signing in/i })).toBeDisabled();
    resolveLogin({});
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
    });
  });
});
