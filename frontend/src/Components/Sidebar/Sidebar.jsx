import React from 'react'
import '../../css/Sidebar/Sidebar.css'
import Filter_Box from './Filter_Box'
import EmployeeUtilisationCard from './EmployeeUtilisationCard'

const Sidebar = ({ searchTerm, onSearchChange, events, feedItems}) => {

    return (
        <div className="sidebar">
          {/* Code for mini calander in the sidebar */}
          <div className="sidebar-calendar-wrapper">
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
