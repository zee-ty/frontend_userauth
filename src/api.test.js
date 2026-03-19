import { auth, getToken, setToken, API_URL } from "./api";

const originalFetch = global.fetch;
const originalLocalStorage = global.localStorage;

beforeEach(() => {
  global.fetch = jest.fn();
  Object.defineProperty(global, "localStorage", {
    value: {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
    },
    writable: true,
  });
});

afterEach(() => {
  global.fetch = originalFetch;
  global.localStorage = originalLocalStorage;
  jest.clearAllMocks();
});

describe("getToken / setToken", () => {
  it("getToken returns value from localStorage", () => {
    global.localStorage.getItem.mockReturnValue("abc123");
    expect(getToken()).toBe("abc123");
    expect(global.localStorage.getItem).toHaveBeenCalledWith("token");
  });

  it("setToken with value calls setItem", () => {
    setToken("xyz");
    expect(global.localStorage.setItem).toHaveBeenCalledWith("token", "xyz");
  });

  it("setToken with null/empty calls removeItem", () => {
    setToken(null);
    expect(global.localStorage.removeItem).toHaveBeenCalledWith("token");
  });
});

describe("auth.register", () => {
  it("POSTs to /api/auth/register and stores token from response", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ token: "jwt-here" }),
    });
    global.localStorage.setItem.mockImplementation(() => {});

    const result = await auth.register({
      email: "a@b.com",
      password: "secret",
      firstName: "Spongebob",
      lastName: "Squarepants",
    });

    expect(global.fetch).toHaveBeenCalledWith(
      `${API_URL}/api/auth/register`,
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ "Content-Type": "application/json" }),
        body: JSON.stringify({
          email: "a@b.com",
          password: "secret",
          firstName: "Spongebob",
          lastName: "Squarepants",
        }),
      })
    );
    expect(global.localStorage.setItem).toHaveBeenCalledWith("token", "jwt-here");
    expect(result).toEqual({ token: "jwt-here" });
  });

  it("supports accessToken and access_token in response", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ accessToken: "at-123" }),
    });
    await auth.register({
      email: "x@y.com",
      password: "p",
      firstName: "F",
      lastName: "L",
    });
    expect(global.localStorage.setItem).toHaveBeenCalledWith("token", "at-123");
  });
});

describe("auth.login", () => {
  it("POSTs to /api/auth/login and stores token", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ token: "login-token" }),
    });

    await auth.login("user@test.com", "pass123");

    expect(global.fetch).toHaveBeenCalledWith(
      `${API_URL}/api/auth/login`,
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ email: "user@test.com", password: "pass123" }),
      })
    );
    expect(global.localStorage.setItem).toHaveBeenCalledWith("token", "login-token");
  });
});

describe("auth.logout", () => {
  it("clears token even if request fails", async () => {
    global.localStorage.getItem.mockReturnValue("old-token");
    global.fetch.mockRejectedValueOnce(new Error("Network error"));

    await expect(auth.logout()).rejects.toThrow("Network error");

    expect(global.localStorage.removeItem).toHaveBeenCalledWith("token");
  });
});

describe("auth.getUser", () => {
  it("GETs /api/user with Bearer token", async () => {
    global.localStorage.getItem.mockReturnValue("bearer-token");
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ email: "u@u.com", firstName: "U" }),
    });

    const user = await auth.getUser();

    expect(global.fetch).toHaveBeenCalledWith(
      `${API_URL}/api/user`,
      expect.objectContaining({
        method: "GET",
        headers: expect.objectContaining({
          Authorization: "Bearer bearer-token",
        }),
      })
    );
    expect(user).toEqual({ email: "u@u.com", firstName: "U" });
  });
});
