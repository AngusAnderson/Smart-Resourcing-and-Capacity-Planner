import React, { useState, useEffect } from 'react'
import api from '../../services/api'
import '../../css/Sidebar/Mini_Calendar.css'

import { useCalendarApp, ScheduleXCalendar } from '@schedule-x/react'
import {
  createViewDay,
  createViewMonthAgenda,
  createViewMonthGrid,
  createViewWeek,
} from '@schedule-x/calendar'
import { createEventsServicePlugin } from '@schedule-x/events-service'
import 'temporal-polyfill/global'
import '@schedule-x/theme-default/dist/index.css'


function Mini_Calendar({ setSelectedDate }) {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const eventsService = useState(() => createEventsServicePlugin())[0]

 
  useEffect(() => {
    const fetchJobCodes = async () => {
      try {
        const response = await api.get('/jobcodes/')
        console.log('API Response:', response.data) // Debug log
        const eventData = response.data.map((jobcode) => ({
          id: jobcode.code,
          start: Temporal.PlainDate.from(jobcode.startDate),
          end: Temporal.PlainDate.from(jobcode.endDate),
        }))
        setEvents(eventData)
        setLoading(false)
      } catch (err) {
        console.error('Error fetching jobcodes:', err)
        setError(err.message)
        setLoading(false)
      }
    }
    
    fetchJobCodes()
  }, [])

  const calendar = useCalendarApp({
    views: [
        createViewMonthAgenda() // Keep this if you want it as another view
    ],
    events: events,
    callbacks: {
      onClickAgendaDate: (date) => {
        console.log("Date clicked:", date.toString());
        if (setSelectedDate) {
          console.log("Mini_Calendar sees setSelectedDate exists");
          setSelectedDate(date);
        } else {
          console.error("setSelectedDate does not exist");
        }
    }},
    plugins: [eventsService]
  })

  if (loading) return <div className="mini-calander">Loading...</div>
  if (error) return <div className="mini-calander">Error: {error}</div>
 
  return (
    <div className="mini-calander">
      <ScheduleXCalendar calendarApp={calendar} />
      <hr className='heading-line'></hr>
      
    </div>
  )


}
 
export default Mini_Calendar