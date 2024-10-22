import React, { useState } from 'react';
import axios from 'axios';
import './RegisterPage.css';  // Import the CSS file

const RegisterPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsError(false);
    try {
      const response = await axios.post('/api/register', { email, password, username }, { withCredentials: true });
      console.log('Registration successful', response.data);
      setMessage('Registration successful! You can now log in.');
      setEmail('');
      setPassword('');
      setUsername('');
    } catch (error) {
      console.error('Registration failed', error.response?.data);
      setIsError(true);
      if (error.response?.status === 409) {
        setMessage('User already exists. Please try a different email or username.');
      } else {
        setMessage(error.response?.data?.message || 'Registration failed. Please try again.');
      }
    }
  };

  return (
    <div className="register-container">
      <h2 className="register-title">Register</h2>
      {message && (
        <div className={`message ${isError ? 'message-error' : 'message-success'}`}>
          {message}
        </div>
      )}
      <form onSubmit={handleRegister}>
        <div className="form-group">
          <label htmlFor="username" className="form-label">Username:</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="form-input"
          />
        </div>
        <div className="form-group">
          <label htmlFor="email" className="form-label">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="form-input"
          />
        </div>
        <div className="form-group">
          <label htmlFor="password" className="form-label">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="form-input"
          />
        </div>
        <button type="submit" className="submit-button">
          Register
        </button>
      </form>
    </div>
  );
};

export default RegisterPage;