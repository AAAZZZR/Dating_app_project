import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import LoginPage from './Component/LoginPage';
import RegisterPage from './Component/RegisterPage';
import UserPage from './Component/UserPage';
import Activities from './Component/Activities';
import './App.css';
import { generateColorFromId } from './utils/utils';

const App = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const handleLoginSuccess = (userData) => {
    setUser(userData);  
  };

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await axios.get('/api/@me', { withCredentials: true });
        setUser(response.data);
      } catch (error) {
        console.error('Auth check failed', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post('/api/logout', {}, { withCredentials: true });
      setUser(null);
      navigate('/login'); 
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  return (
    <div className="app-container">
      <nav className="navbar">
        <ul className="nav-list">
          <li className="nav-item"><Link to="/">Home</Link></li>
          {!user && <li className="nav-item"><Link to="/login">Login</Link></li>}
          {!user && <li className="nav-item"><Link to="/register">Sign up</Link></li>}
          {user && <li className="nav-item"><Link to="/user">User Account</Link></li>}
          {user && <li className="nav-item"><Link to="/activities">Activities</Link></li>}
          {user && (
            <li className="nav-item">
              <Link to="/user" className="avatar-link">
                <div className="user-avatar">
                  <div
                    className="avatar-circle"
                    style={{ backgroundColor: generateColorFromId(user.id) }}
                  >
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                </div>
              </Link>
            </li>
          )}
          {user && <li className="nav-item"><button className="logout-button" onClick={handleLogout}>Logout</button></li>}
        </ul>
      </nav>

      <div className="content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/login"
            element={<LoginPage onLoginSuccess={handleLoginSuccess} />}
          />
          <Route
            path="/register"
            element={<RegisterPage />}
          />
          <Route
            path="/user"
            element={user ? <UserPage user={user} /> : <Navigate to="/login" />}
          />
          <Route
            path="/activities"
            element={<Activities />}
          />
        </Routes>
      </div>
    </div>
  );
};

const Home = () => (
  <div>
    <h1>Dating App123</h1>
    <p className="welcome-message">Meet new friends now OKOK</p>
    <Link to="/register" className="cta-button">Register here</Link>
  </div>
);

export default App;
