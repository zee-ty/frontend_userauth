import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SignUpForm from "./SignUp";

const mockAuth = {
  register: jest.fn(),
};
jest.mock("./api", () => ({
  auth: {
    get register() {
      return mockAuth.register;
    },
  },
}));

beforeEach(() => {
  mockAuth.register.mockReset();
});

describe("SignUpForm", () => {
  it("renders register heading and all fields", () => {
    render(<SignUpForm />);
    expect(screen.getByRole("heading", { name: /register/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/first name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/last name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /register/i })).toBeInTheDocument();
  });

  it("shows error when submitting with missing fields", async () => {
    render(<SignUpForm />);
    fireEvent.click(screen.getByRole("button", { name: /register/i }));
    await waitFor(() => {
      expect(screen.getByText(/please fill in all fields/i)).toBeInTheDocument();
    });
    expect(mockAuth.register).not.toHaveBeenCalled();
  });

  it("calls auth.register and onSuccess when all fields filled", async () => {
    mockAuth.register.mockResolvedValueOnce({});
    const onSuccess = jest.fn();
    render(<SignUpForm onSuccess={onSuccess} />);

    await userEvent.type(screen.getByPlaceholderText(/first name/i), "Spongebob");
    await userEvent.type(screen.getByPlaceholderText(/last name/i), "Squarepants");
    await userEvent.type(screen.getByPlaceholderText(/email/i), "spongebob@example.com");
    await userEvent.type(screen.getByPlaceholderText(/password/i), "secret123");
    fireEvent.click(screen.getByRole("button", { name: /register/i }));

    await waitFor(() => {
      expect(mockAuth.register).toHaveBeenCalledWith({
        email: "spongebob@example.com",
        password: "secret123",
        firstName: "Spongebob",
        lastName: "Squarepants",
      });
    });
    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it("shows error when registration fails", async () => {
    mockAuth.register.mockRejectedValueOnce(
      Object.assign(new Error("Email taken"), { data: { message: "Email already in use" } })
    );
    render(<SignUpForm />);

    await userEvent.type(screen.getByPlaceholderText(/first name/i), "A");
    await userEvent.type(screen.getByPlaceholderText(/last name/i), "B");
    await userEvent.type(screen.getByPlaceholderText(/email/i), "a@b.com");
    await userEvent.type(screen.getByPlaceholderText(/password/i), "p");
    fireEvent.click(screen.getByRole("button", { name: /register/i }));

    await waitFor(() => {
      expect(screen.getByText(/email already in use/i)).toBeInTheDocument();
    });
  });
});
