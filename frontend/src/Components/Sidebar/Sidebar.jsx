import React from 'react'
import '../../css/Sidebar/Sidebar.css'
import Mini_Calendar from './Mini_Calendar'
import Filter_Box from './Filter_Box'

const Sidebar = ({ searchTerm, onSearchChange }) => {



    return (
        <div className="sidebar">
          {/* Code for mini calander in the sidebar */}
            <Mini_Calendar />
          

          {/* Code for filter box in the sidebar */}
          <Filter_Box searchTerm={searchTerm} onSearchChange={onSearchChange}/>
          
        </div>
    )
}

export default Sidebar
