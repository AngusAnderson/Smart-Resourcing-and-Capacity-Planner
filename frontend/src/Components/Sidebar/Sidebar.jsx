import React from 'react'
import '../../css/Sidebar/Sidebar.css'
import Mini_Calendar from './Mini_Calendar'
import Filter_Box from './Filter_Box'


const Sidebar = ({ searchTerm, onSearchChange, setSelectedDate, events, feedItems}) => {

    return (
        <div className="sidebar">
          {/* Code for mini calander in the sidebar */}
          <div className="sidebar-calendar-wrapper">
            <Mini_Calendar setSelectedDate={setSelectedDate}/>         
          </div>         
          {/* Code for filter box in the sidebar */}
          <Filter_Box searchTerm={searchTerm} onSearchChange={onSearchChange} events={events} feedItems={feedItems}/>
          
        </div>
    )
}

export default Sidebar
