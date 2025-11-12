import React from "react";
import '../css/Big_Calendar.css'

const Big_Calendar = () => {
    return (
        <div className="hero">
            <div className="calendar-big-wrapper">
            <div className="month-big">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" className="bi bi-chevron-left" id="svg-big" viewBox="0 0 16 16">
                <path fillRule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0"/>
                </svg>
                <h1>November</h1>
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" className="bi bi-chevron-right" id="svg-big" viewBox="0 0 16 16">
                <path fillRule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708"/>
                </svg>
            </div>
            <div className="calendar-big">
                <div class="day-header-big">Sunday</div>
                <div class="day-header-big">Monday</div>
                <div class="day-header-big">Tuesday</div>
                <div class="day-header-big"><b>Wednesday</b></div>
                <div class="day-header-big">Thursday</div>
                <div class="day-header-big">Friday</div>
                <div class="day-header-big">Saturday</div>

                <div class="date-cell-big" id='old'>27</div>
                <div class="date-cell-big" id='old'>28</div>
                <div class="date-cell-big" id='old'>29</div>
                <div class="date-cell-big" id='old'>30</div>
                <div class="date-cell-big">1</div>
                <div class="date-cell-big">2</div>
                <div class="date-cell-big">3</div>
                <div class="date-cell-big">4</div>
                <div class="date-cell-big">5</div>
                <div class="date-cell-big">6</div>
                <div class="date-cell-big">7</div>
                <div class="date-cell-big">8</div>
                <div class="date-cell-big">9</div>
                <div class="date-cell-big">10</div>
                <div class="date-cell-big">11</div>
                <div class="date-cell-big">12</div>
                <div class="date-cell-big">13</div>
                <div class="date-cell-big">14</div>
                <div class="date-cell-big">15</div>
                <div class="date-cell-big">16</div>
                <div class="date-cell-big">17</div>
                <div class="date-cell-big">18</div>
                <div class="date-cell-big">19</div>
                <div class="date-cell-big">20</div>
                <div class="date-cell-big">21</div>
                <div class="date-cell-big">22</div>
                <div class="date-cell-big">23</div>
                <div class="date-cell-big">24</div>
                <div class="date-cell-big">25</div>
                <div class="date-cell-big">26</div>
                <div class="date-cell-big">27</div>
                <div class="date-cell-big">28</div>
                <div class="date-cell-big">29</div>
                <div class="date-cell-big">30</div>
                <div class="date-cell-big" id='old'>31</div>
                </div>
            </div>
        </div>
    )
}

export default Big_Calendar