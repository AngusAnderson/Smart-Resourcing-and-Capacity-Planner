import React, { useState, useEffect } from 'react';
import useToggle from './functions/useToggle';
import Header from './Components/Header';
import Sidebar from './Components/Sidebar/Sidebar';
import Calendar from './Components/Calendar';
import EmployeePage from './Components/EmployeePage';
import ProjectPage from './Components/ProjectPage';
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { fetchJobcodesAsEvents } from '../src/services/Job_Codes_API';

function App() {
  const [isVisible, toggleVisibility] = useToggle(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);

  const [events, setEvents] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchJobcodesAsEvents();
        setEvents(data);
      } catch (e) {
        console.error('Error loading jobcodes', e);
      }
    };
    load();
  }, []);

  return (
    <Router>
      <link rel="icon" href="../src/assets/favicon.ico" />
      <title>Comwrap Reply</title>

      <Header isVisible={isVisible} toggleVisibility={toggleVisibility} />

      <div className="container">
        <Sidebar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          setSelectedDate={setSelectedDate}
          events={events}              // <-- new
        />
        <div className="main">
          <Routes>
            <Route
              path="/"
              element={
                <Calendar
                  searchTerm={searchTerm}
                  selectedDate={selectedDate}
                  events={events}      // <-- new
                />
              }
            />
            <Route path="/employees/:id" element={<EmployeePage />} />
            <Route path="/projects/:id" element={<ProjectPage />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
