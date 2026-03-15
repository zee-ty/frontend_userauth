import React from "react";
import { auth } from "./api";

function SignUpForm({ onSuccess, onError }) {
  const [state, setState] = React.useState({
    name: "",
    lastName: "",
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
    const { name, lastName, email, password } = state;
    if (!email || !password || !name || !lastName) {
      setError("Please fill in all fields.");
      return;
    }
    setLoading(true);
    try {
      await auth.register({
        email,
        password,
        firstName: name,
        lastName
      });
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.data?.message || err.message || "Registration failed.");
      if (onError) onError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container sign-up-container">
      <form onSubmit={handleOnSubmit}>
        <h1>Register</h1>
        {error && <p className="form-error">{error}</p>}
        <input
          type="text"
          name="name"
          value={state.name}
          onChange={handleChange}
          placeholder="First Name"
          disabled={loading}
        />
        <input
          type="text"
          name="lastName"
          value={state.lastName}
          onChange={handleChange}
          placeholder="Last Name"
          disabled={loading}
        />
        <input
          type="email"
          name="email"
          value={state.email}
          onChange={handleChange}
          placeholder="Email"
          disabled={loading}
        />
        <input
          type="password"
          name="password"
          value={state.password}
          onChange={handleChange}
          placeholder="Password"
          disabled={loading}
        />
        <button type="submit" disabled={loading}>
          {loading ? "Registering…" : "Register"}
        </button>
      </form>
    </div>
  );
}

export default SignUpForm;
