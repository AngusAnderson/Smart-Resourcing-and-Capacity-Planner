import React from 'react'
import '../../css/Sidebar/Sidebar.css'
import Mini_Calendar from './Mini_Calendar'
import Filter_Box from './Filter_Box'
import EmployeeUtilisationCard from './EmployeeUtilisationCard'

const Sidebar = ({ searchTerm, onSearchChange, setSelectedDate, events, feedItems}) => {

    return (
        <div className="sidebar">
          {/* Code for mini calander in the sidebar */}
          <div className="sidebar-calendar-wrapper">
            {/* <Mini_Calendar setSelectedDate={setSelectedDate}/>          */}
            <EmployeeUtilisationCard />
          </div>         
          {/* Code for filter box in the sidebar */}
          <div>
          <Filter_Box searchTerm={searchTerm} onSearchChange={onSearchChange} events={events} feedItems={feedItems}/>
          </div>
          {/* Code for export button in the sidebar */}
          
        </div>
    )
}

export default Sidebar
