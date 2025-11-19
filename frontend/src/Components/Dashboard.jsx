import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Calendar from './Calendar';

function Dashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  return (
    <div style={{ display: 'flex' }}>
      <Sidebar searchTerm={searchTerm} onSearchChange={setSearchTerm} />
      <Calendar searchTerm={searchTerm} />
    </div>
  );
}
export default Dashboard;