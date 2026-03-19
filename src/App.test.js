import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";

const mockGetToken = jest.fn();
const mockGetUser = jest.fn();
const mockLogin = jest.fn();
const mockLogout = jest.fn();
const mockRegister = jest.fn();

jest.mock("./api", () => ({
  getToken: () => mockGetToken(),
  auth: {
    getUser: (...args) => mockGetUser(...args),
    login: (...args) => mockLogin(...args),
    logout: (...args) => mockLogout(...args),
    register: (...args) => mockRegister(...args),
  },
}));

beforeEach(() => {
  mockGetToken.mockReset();
  mockGetUser.mockReset();
  mockLogin.mockReset();
  mockLogout.mockReset();
  mockRegister.mockReset();
});

describe("App", () => {
  it("shows sign in/register when no token", async () => {
    mockGetToken.mockReturnValue(null);

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/sign in \/ register/i)).toBeInTheDocument();
    });
    expect(screen.getByRole("heading", { name: "Sign in" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Register" })).toBeInTheDocument();
  });

  it("shows dashboard when user is loaded", async () => {
    mockGetToken.mockReturnValue("token");
    mockGetUser.mockResolvedValueOnce({ email: "user@test.com", firstName: "Test" });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/welcome, test/i)).toBeInTheDocument();
    });
    expect(screen.getByText("user@test.com")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /log out/i })).toBeInTheDocument();
  });

  it("logout button calls auth.logout and clears user", async () => {
    mockGetToken.mockReturnValue("token");
    mockGetUser.mockResolvedValueOnce({ email: "u@u.com", firstName: "U" });
    mockLogout.mockResolvedValueOnce(undefined);

    render(<App />);
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /log out/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /log out/i }));

    await waitFor(() => {
      expect(mockLogout).toHaveBeenCalled();
    });
    await waitFor(() => {
      expect(screen.getByText(/sign in \/ register/i)).toBeInTheDocument();
    });
  });

  it("switches to register panel when overlay Register button clicked", async () => {
    mockGetToken.mockReturnValue(null);

    render(<App />);
    await waitFor(() => {
      expect(screen.getByText(/sign in \/ register/i)).toBeInTheDocument();
    });

    const overlayRegisterBtn = document.getElementById("register");
    fireEvent.click(overlayRegisterBtn);

    const container = document.getElementById("container");
    expect(container).toHaveClass("right-panel-active");
  });

  it("shows welcome without first name when user has no firstName", async () => {
    mockGetToken.mockReturnValue("token");
    mockGetUser.mockResolvedValueOnce({ email: "nofirst@test.com" });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/welcome!/i)).toBeInTheDocument();
    });
    expect(screen.getByText("nofirst@test.com")).toBeInTheDocument();
  });
});
