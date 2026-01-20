import React, { useState } from 'react';
import useToggle from './functions/useToggle';
import Header from './Components/Header';
import Sidebar from './Components/Sidebar/Sidebar';
import Calendar from './Components/Calendar';
import EmployeePage from './Components/EmployeePage';
import ProjectPage from './Components/ProjectPage';
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";


function App() {
  const [isVisible, toggleVisibility] = useToggle(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);

  return (
    <Router>
      <Header isVisible={isVisible} toggleVisibility={toggleVisibility}/>
      <div className="container">
        <Sidebar searchTerm={searchTerm} onSearchChange={setSearchTerm} setSelectedDate={setSelectedDate}/>
        <div className="main">
           <Routes>

          <Route path="/" element={<Calendar searchTerm={searchTerm} selectedDate={selectedDate} />}/>
          <Route path = "/employees/:id" element = {<EmployeePage />} />
          <Route path = "/projects/:id" element = {<ProjectPage />} />

          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
