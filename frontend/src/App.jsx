import React, { useState, useEffect } from 'react';
import useToggle from './functions/useToggle';
import Header from './Components/Header';
import Sidebar from './Components/Sidebar/Sidebar';
import Calendar from './Components/Calendar';
import EmployeePage from './Components/EmployeePage';
import ProjectPage from './Components/ProjectPage';
import EmployeeList from './Components/EmployeeList';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { fetchJobcodesAsEvents } from '../src/services/Job_Codes_API';
import { saveFeedItems, loadFeedItems } from './utils/Storage';

function App() {
  const [isVisible, toggleVisibility] = useToggle(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);

  const [events, setEvents] = useState([]);

  const [feedItems, setFeedItems] = useState(() => loadFeedItems());

  const [dataRefreshKey, setDataRefreshKey] = useState(0);


  const addFeedItem = (item) => {
    setFeedItems((prev) => {
      const next = [item, ...prev].slice(0, 10);
      console.log("APP addFeedItem prev:", prev, "next:", next);
      saveFeedItems(next);
      return next;
    });
  };
  const loadEvents = async () => {
  try {
    const data = await fetchJobcodesAsEvents();
    setEvents(data);
    setDataRefreshKey(prev => prev + 1);
  } catch (e) {
    console.error('Error loading jobcodes', e);
  }
};


  useEffect(() => {
    loadEvents();
  }, []);


  useEffect(() => {
    saveFeedItems(feedItems);
  }, [feedItems]);

  

  return (
    <Router>
      <link rel="icon" href="../src/assets/favicon.ico" />
      <title>Comwrap Reply</title>

      <Header isVisible={isVisible} toggleVisibility={toggleVisibility} onDataChanged={loadEvents}/>


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
            <Route path="/projects/:id" element={<ProjectPage refreshKey={dataRefreshKey} />} />

          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
