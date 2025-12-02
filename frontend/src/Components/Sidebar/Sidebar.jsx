import React from 'react'
import '../../css/Sidebar/Sidebar.css'
import Mini_Calendar from './Mini_Calendar'
import Filter_Box from './Filter_Box'

const Sidebar = ({ searchTerm, onSearchChange, setSelectedDate }) => {

   console.log("Sidebar got setSelectedDate:", setSelectedDate);

    return (
        <div className="sidebar">
          {/* Code for mini calander in the sidebar */}
            <Mini_Calendar setSelectedDate={setSelectedDate}/>         
          {/* Code for filter box in the sidebar */}
          <Filter_Box searchTerm={searchTerm} onSearchChange={onSearchChange}/>
          
        </div>
    )
}

export default Sidebar
