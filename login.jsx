import React, { useState } from 'react';
import './Login.css';

import { loginUser } from './src/api/api'; // Assuming api.js exports a loginUser function
import apiService from '../src/api/api'; const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setError(null); // Clear previous errors on input change

    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Implement login logic here with the imported API service
    apiService
      .login(formData)
      .then((response) => {
        console.log("Login success:", response);
        // Handle successful login (e.g., redirect to dashboard)
        // window.location.href = '/dashboard'; // Example redirection
      })
      .catch((error) => {
        console.error("Login error:", error);
        setError(error.message || "Login failed. Please try again.");
      });
    console.log('Login attempt with:', formData);
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>Welcome to NyumbaSync</h1>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm mt-2">{error}</div>
          )}

          <button type="submit" className="login-button">
            Log In
          </button>
        </form>
        <div className="login-footer">
          <p>Don't have an account? <a href="/signup">Sign Up</a></p>
          <a href="/forgot-password">Forgot Password?</a>
        </div>
      </div>
    </div>
  );
};

export default Login;