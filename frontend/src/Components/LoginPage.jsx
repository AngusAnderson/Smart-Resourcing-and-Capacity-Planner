import React, { useState } from 'react';
import replyLogo from '../assets/ReplyLogo.png';
import '../css/LoginPage.css'; 
import { login } from '../services/authService';
import api from '../services/api';

const LoginPage = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    
    try {
      const response = await api.post('/login/', {
        email: email, // ensure this matches the key in your views.py
        password: password
      });
  
      if (response.status === 200) {
        console.log("Login Success:", response.data);
        
        // 1. Tell App.jsx we are logged in
        onLogin(); 
        
        // 2. (Optional) Store session info
        localStorage.setItem('userEmail', response.data.email);
      }
    } catch (error) {
      const message = error.response?.data?.error || "Connection failed";
      alert(message);
    }
  };

  const [showPassword, setShowPassword] = useState(false);
  
  return (
    <div className="login-container">
      {/* Left Section: Welcome Text & Brand Color */}
      <div className="left-panel">
        <h1 className="welcome-text">
          Hello, <br />
          <span>Welcome back</span>
        </h1>
      </div>

      <div className="right-panel">
        <div className="header-section">
        <div className="brand-logo">
          <img 
            src={replyLogo}
            alt="Reply Logo" 
            className="logo-image" 
          />
          </div>
        </div>

        <form className="login-form" onSubmit={handleLogin}>
        <div className="input-group">
  <input 
    type="email" 
    id="email" 
    placeholder=" " 
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    required 
  />
  <label htmlFor="email">Email address</label>
</div>

<div className="input-group">
  <input 
    type={showPassword ? "text" : "password"} 
    id="password" 
    placeholder=" " 
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    required
  />
  <label htmlFor="password">Password</label>
  <button 
    type="button"
    className="password-toggle"
    onClick={() => setShowPassword(!showPassword)}
  >
    {showPassword ? "Hide" : "Show"}
  </button>
</div>

          <div className="form-footer">
            <label className="checkbox-container">
              <input className='RM-Checkbox' type="checkbox" />
              <span className="checkmark"></span>
              Remember me
            </label>
            <a href="#" className="forgot-link">Forgot Password?</a>
          </div>

          <div className="action-buttons">
          <button type="submit" className="login-btn">Login</button>
            <button type="button" className="signup-btn">Sign Up</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;