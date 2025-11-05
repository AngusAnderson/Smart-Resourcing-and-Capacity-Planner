import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {

  return (
    <>
      {/* Header Section */}
      <div className='Header'>
        <div className="Text-top_left">
          <h1>Reply <span className='span-1_Comwrap'>Comwrap</span></h1>
        </div>
        <div className="Text-top_right">
          <h1>John Doe</h1>
        </div>

        <div className="Text-middle">
          <button class="button-access-ai">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-plus-lg" viewBox="0 0 16 16">
            <path fill-rule="evenodd" d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2"/>
          </svg>
            Access AI
          </button>
        </div>
        
      </div>

      <div className="main">
        <div className="sidebar">
          {/* Code for minit calander in the sidebar */}
          <div className="mini-calander">
            <div className="month">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-chevron-left" id="chevron" viewBox="0 0 16 16">
                <path fill-rule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0"/>
              </svg>
              <h1>October</h1>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-chevron-right" id="chevron" viewBox="0 0 16 16">
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
            <div className="search-box">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-search" id='svg' viewBox="0 0 16 16">
                <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0"/>
              </svg>
              <p className='search-text'>Search Employees</p>
            </div>
          </div>
        </div>
        <div className="hero">

        </div>
      </div>


      
      <div className="card">

      </div>
    </>
  )
}

export default App
