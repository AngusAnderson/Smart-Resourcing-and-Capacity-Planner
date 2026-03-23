import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import useToggle from './functions/useToggle';
import Header from './Components/Header';
import Sidebar from './Components/Sidebar/Sidebar';
import Calendar from './Components/Calendar';
import EmployeePage from './Components/EmployeePage';
import ProjectPage from './Components/ProjectPage';
import EmployeeList from './Components/EmployeeList';
import ProjectList from './Components/ProjectList';
import LoginPage from './Components/LoginPage';
import { fetchJobcodesAsEvents } from '../src/services/Job_Codes_API';
import { saveFeedItems, loadFeedItems } from './utils/Storage';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('isLoggedIn') === 'true';
  });

  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const [isVisible, toggleVisibility] = useToggle(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [events, setEvents] = useState([]);
  const [feedItems, setFeedItems] = useState(() => loadFeedItems());
  const [dataRefreshKey, setDataRefreshKey] = useState(0);

  const handleLoginSuccess = (userData) => {
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('user', JSON.stringify(userData));
    setCurrentUser(userData);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setCurrentUser(null);
  };

  const addFeedItem = (item) => {
    setFeedItems((prev) => {
      const next = [item, ...prev].slice(0, 10);
      saveFeedItems(next);
      return next;
    });
  };

  const loadEvents = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      const data = await fetchJobcodesAsEvents();
      setEvents(data);
      setDataRefreshKey((prev) => prev + 1);
    } catch (e) {
      console.error('Error loading jobcodes', e);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  useEffect(() => {
    saveFeedItems(feedItems);
  }, [feedItems]);

  useEffect(() => {
    document.title = 'Comwrap Reply';
    const link = document.querySelector("link[rel='icon']") || document.createElement('link');
    link.rel = 'icon';
    link.href = '../src/assets/favicon.ico';
    document.head.appendChild(link);
  }, []);

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate replace to="/" />
            ) : (
              <LoginPage onLogin={handleLoginSuccess} />
            )
          }
        />

        <Route
          path="/*"
          element={
            isAuthenticated ? (
              <div className="app-wrapper">
                <Header
                  isVisible={isVisible}
                  toggleVisibility={toggleVisibility}
                  onDataChanged={loadEvents}
                  onLogout={handleLogout}
                  user={currentUser}
                />
                <div className="container">
                  <Sidebar
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    setSelectedDate={setSelectedDate}
                    events={events}
                    feedItems={feedItems}
                  />
                  <div className="main">
                    <Routes>
                      <Route
                        path="/"
                        element={
                          <Calendar
                            searchTerm={searchTerm}
                            selectedDate={selectedDate}
                            events={events}
                            onFeedItem={addFeedItem}
                          />
                        }
                      />
                      <Route path="/employees/:id" element={<EmployeePage />} />
                      <Route path="/employees" element={<EmployeeList />} />
                      <Route
                        path="/projects/:code"
                        element={<ProjectPage refreshKey={dataRefreshKey} />}
                      />
                      <Route path="/projects" element={<ProjectList />} />
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </div>
                </div>
              </div>
            ) : (
              <Navigate replace to="/login" />
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default App;