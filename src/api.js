const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5050";

const getToken = () => localStorage.getItem("token");
const setToken = (token) => {
  if (token) localStorage.setItem("token", token);
  else localStorage.removeItem("token");
};

function isNetworkError(err) {
  const msg = (err && err.message) || "";
  return (
    msg === "Failed to fetch" ||
    msg === "NetworkError when attempting to fetch resource" ||
    err instanceof TypeError
  );
}

async function request(path, options = {}) {
  const url = `${API_URL}${path}`;
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };
  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  let res;
  try {
    res = await fetch(url, { ...options, headers });
  } catch (err) {
    if (isNetworkError(err)) {
      throw new Error(
        `Cannot reach server at ${API_URL}. Check that the backend is running and CORS allows origin ${window.location.origin}`
      );
    }
    throw err;
  }
  let data;
  try {
    data = await res.json();
  } catch {
    data = {};
  }
  if (!res.ok) {
    let msg = data.message || data.error || `Request failed: ${res.status}`;
    if (res.status === 405) {
      msg += " (405 = Method Not Allowed — check backend allows POST for this path)";
    }
    const err = new Error(msg);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

function getTokenFromResponse(data) {
  if (data.token) setToken(data.token);
  else if (data.accessToken) setToken(data.accessToken);
  else if (data.access_token) setToken(data.access_token);
}

export const auth = {
  async register({ email, password, firstName, lastName }) {
    const data = await request("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, firstName, lastName }),
    });
    getTokenFromResponse(data);
    return data;
  },

  async login(email, password) {
    const data = await request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    getTokenFromResponse(data);
    return data;
  },

  async logout() {
    try {
      await request("/api/auth/logout", { method: "POST" });
    } finally {
      setToken(null);
    }
  },

  async getUser() {
    return request("/api/user", { method: "GET" });
  },
};

export { API_URL, getToken, setToken };
