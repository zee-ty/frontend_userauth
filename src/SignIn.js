import React from "react";
import { auth } from "./api";

function SignInForm({ onSuccess, onError }) {
  const [state, setState] = React.useState({
    email: "",
    password: ""
  });
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  const handleChange = evt => {
    const value = evt.target.value;
    setState({
      ...state,
      [evt.target.name]: value
    });
    setError("");
  };

  const handleOnSubmit = async evt => {
    evt.preventDefault();
    setError("");
    const { email, password } = state;
    if (!email || !password) {
      setError("Please enter email and password.");
      return;
    }
    setLoading(true);
    try {
      await auth.login(email, password);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.data?.message || err.message || "Login failed.");
      if (onError) onError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container sign-in-container">
      <form onSubmit={handleOnSubmit}>
        <h1>Sign in</h1>
        {error && <p className="form-error">{error}</p>}
        <input
          type="email"
          placeholder="Email"
          name="email"
          value={state.email}
          onChange={handleChange}
          disabled={loading}
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={state.password}
          onChange={handleChange}
          disabled={loading}
        />
        <button type="submit" disabled={loading}>
          {loading ? "Signing in…" : "Sign In"}
        </button>
      </form>
    </div>
  );
}

export default SignInForm;
