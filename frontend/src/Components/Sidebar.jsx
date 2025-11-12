import React from 'react'
import '../css/Sidebar.css'

const Sidebar = () => {
    return (
        <div className="sidebar">
          {/* Code for minit calander in the sidebar */}
          <div className="mini-calander">
            <div className="month">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-chevron-left" id="svg" viewBox="0 0 16 16">
                <path fill-rule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0"/>
              </svg>
              <h1>November</h1>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-chevron-right" id="svg" viewBox="0 0 16 16">
                <path fill-rule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708"/>
              </svg>
            </div>
            <div class="calendar">
            <div class="day-header">Sun</div>
            <div class="day-header">Mon</div>
            <div class="day-header">Tue</div>
            <div class="day-header"><b>Wed</b></div>
            <div class="day-header">Thu</div>
            <div class="day-header">Fri</div>
            <div class="day-header">Sat</div>

            <div class="date-cell" id='old'>27</div>
            <div class="date-cell" id='old'>28</div>
            <div class="date-cell" id='old'>29</div>
            <div class="date-cell" id='old'>30</div>
            <div class="date-cell">1</div>
            <div class="date-cell">2</div>
            <div class="date-cell">3</div>
            <div class="date-cell">4</div>
            <div class="date-cell">5</div>
            <div class="date-cell">6</div>
            <div class="date-cell">7</div>
            <div class="date-cell">8</div>
            <div class="date-cell">9</div>
            <div class="date-cell">10</div>
            <div class="date-cell">11</div>
            <div class="date-cell">12</div>
            <div class="date-cell">13</div>
            <div class="date-cell">14</div>
            <div class="date-cell">15</div>
            <div class="date-cell">16</div>
            <div class="date-cell">17</div>
            <div class="date-cell">18</div>
            <div class="date-cell">19</div>
            <div class="date-cell">20</div>
            <div class="date-cell">21</div>
            <div class="date-cell">22</div>
            <div class="date-cell">23</div>
            <div class="date-cell">24</div>
            <div class="date-cell">25</div>
            <div class="date-cell">26</div>
            <div class="date-cell">27</div>
            <div class="date-cell">28</div>
            <div class="date-cell">29</div>
            <div class="date-cell">30</div>
            <div class="date-cell" id='old'>31</div>
          </div>
          <hr className='heading-line'></hr>
            
          </div>

          {/* Code for filter box in the sidebar */}
          <div className="filter-box">
            <h1 className='h1-filter_box'>Filter</h1>

            {/* Filter search box */}
            <form class="search-box">
              <span class="search-icon">
                <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8" stroke="currentColor" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" stroke="currentColor" />
                </svg>
              </span>
              <div class="vertical-divider"></div>
              <input class="search-input" type="text" placeholder="Search Employees" />
            </form>

            <hr className='hr-filter_box'></hr>
            <div className="white-space-filter_box"></div>
            <hr className='hr-filter_box'></hr>
            <h1 className='h1-filter_box'>Overall Project Progress</h1>


            {/* Project Progress bar */}
            <div class="progress-bar-container">
              <div class="progress-bar">
                <div class="segment currently-allocated"></div>
                <div class="segment over-allocated"></div>
                <div class="segment under-allocated-1"></div>
                <div class="segment under-allocated-2"></div>
              </div>
              <div class="labels">
                <div class="label">Correctly Allocated - 25%</div>
                <div class="label">Over Allocated - 15%</div>
                <div class="label">Under Allocated - 40%</div><br></br>
                <div class="label">Under Allocated - 20%</div>
              </div>
            </div>
          </div>
          
        </div>
    )
}

export default Sidebar
