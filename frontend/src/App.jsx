import React, { useState } from 'react';
import useToggle from './functions/useToggle';
import Header from './Components/Header';
import Sidebar from './Components/Sidebar/Sidebar';
import Calendar from './Components/Calendar';

function App() {
  const [isVisible, toggleVisibility] = useToggle(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);

  return (
    <>
      <Header isVisible={isVisible} toggleVisibility={toggleVisibility}/>
      <div className="container">
        <Sidebar searchTerm={searchTerm} onSearchChange={setSearchTerm} setSelectedDate={setSelectedDate}/>
        <div className="main">
          <Calendar searchTerm={searchTerm} selectedDate={selectedDate} />
        </div>
      </div>
    </>
  );
}

export default App;
