import React, { useState, useEffect } from 'react'
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
  const eventsService = useState(() => createEventsServicePlugin())[0]

 
  const calendar = useCalendarApp({
    views: [
        createViewMonthAgenda() // Keep this if you want it as another view
    ],
    events: [
      {
        id: '1',
        title: 'Event 1',
        start: Temporal.PlainDate.from('2025-11-11'),
        end: Temporal.PlainDate.from('2025-11-15'),
      },
    ],
    callbacks: {
      onClickAgendaDate: (date) => {
        console.log("Date clicked:", date.toString());
        if (setSelectedDate) {
          console.log("Mini_Calendar sees setSelectedDate exists");
          setSelectedDate(date);
        } else {
          console.error("setSelectedDate does not exist");
        }
 //   onSelectedDateUpdate: (date) => {


    },
  },
    plugins: [eventsService]
  })
 
  useEffect(() => {
    eventsService.getAll()
  }, [])
 
  return (
    <div className="mini-calander">
      <ScheduleXCalendar calendarApp={calendar} />
      <hr className='heading-line'></hr>
    </div>
  )


}
 
export default Mini_Calendar