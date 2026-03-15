import React, { useState, useEffect } from "react";
import "./styles.css";
import SignInForm from "./SignIn";
import SignUpForm from "./SignUp";
import { auth, getToken } from "./api";

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState("signIn");

  const loadUser = async () => {
    if (!getToken()) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const data = await auth.getUser();
      setUser(data);
    } catch (err) {
      if (err.status === 401) auth.logout();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  const handleLogout = async () => {
    await auth.logout();
    setUser(null);
  };

  const containerClass =
    "container " + (type === "register" ? "right-panel-active" : "");

  const handleOnClick = text => {
    if (text !== type) {
      setType(text);
      return;
    }
  };

  if (loading) {
    return (
      <div className="App">
        <p>Loading…</p>
      </div>
    );
  }

  if (user) {
    return (
      <div className="App">
        <div className="dashboard">
          <h2>Welcome{user.firstName ? `, ${user.firstName}` : ""}!</h2>
          <p className="user-email">{user.email}</p>
          <button onClick={handleLogout}>Log out</button>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <h2>Sign in / Register</h2>
      <div className={containerClass} id="container">
        <SignUpForm onSuccess={loadUser} />
        <SignInForm onSuccess={loadUser} />
        <div className="overlay-container">
          <div className="overlay">
            <div className="overlay-panel overlay-left">
              <h1>Welcome Back!</h1>
              <p>
                To keep connected with us please login with your personal info
              </p>
              <button
                className="ghost"
                id="signIn"
                onClick={() => handleOnClick("signIn")}
              >
                Sign In
              </button>
            </div>
            <div className="overlay-panel overlay-right">
              <h1>Hello, Friend!</h1>
              <p>Enter your personal details and start journey with us</p>
              <button
                className="ghost "
                id="register"
                onClick={() => handleOnClick("register")}
              >
                Register
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
