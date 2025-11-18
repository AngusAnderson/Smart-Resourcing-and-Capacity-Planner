import React, { useState, useEffect } from 'react'
import { useCalendarApp, ScheduleXCalendar } from '@schedule-x/react'
import { createDragAndDropPlugin } from '@schedule-x/drag-and-drop'
import { createResizePlugin } from '@schedule-x/resize'
import {
  createViewDay,
  createViewMonthAgenda,
  createViewMonthGrid,
  createViewWeek,
} from '@schedule-x/calendar'
import { createEventsServicePlugin } from '@schedule-x/events-service'
import 'temporal-polyfill/global'
import '@schedule-x/theme-default/dist/index.css'
import '../css/Calendar.css'

function Calendar() {
  const eventsService = useState(() => createEventsServicePlugin())[0]

  const calendar = useCalendarApp({
    views: [createViewDay(), createViewWeek(), createViewMonthGrid(), createViewMonthAgenda()],
    plugins: [eventsService, 
      createDragAndDropPlugin(),
      createResizePlugin(),
    ],
  })

  const [showModal, setShowModal] = useState(false)

  const [newEventData, setNewEventData] = useState({
    title: '',
    start: '',
    end: ''
  })

  const handleAddButtonClick = () => {
    setShowModal(true)
    console.log(setShowModal)
  }

  const handleModalSubmit = () => {
    const startDateTime = Temporal.PlainDateTime.from(newEventData.start)
    const endDateTime = Temporal.PlainDateTime.from(newEventData.end)
  
    eventsService.add({
      id: String(Date.now()),
      title: newEventData.title,
      start: startDateTime,
      end: endDateTime
    })
  
    setShowModal(false)
    setNewEventData({ title: '', start: '', end: '' })
  }

  useEffect(() => {
    eventsService.getAll()
  }, [eventsService])

  return (

    
    <div className="hero">

      {showModal && (
        <div className="modal">
          <input
            type="text"
            placeholder="Event Title"
            value={newEventData.title}
            onChange={e => setNewEventData({ ...newEventData, title: e.target.value })}
          />
          <input
            type="datetime-local"
            value={newEventData.start}
            onChange={e => setNewEventData({ ...newEventData, start: e.target.value })}
          />
          <input
            type="datetime-local"
            value={newEventData.end}
            onChange={e => setNewEventData({ ...newEventData, end: e.target.value })}
          />
          <button onClick={handleModalSubmit}>Add Event</button>
          <button onClick={() => setShowModal(false)}>Cancel</button>
        </div>
      )}
      <div className="calendar-big-wrapper">
        <ScheduleXCalendar calendarApp={calendar}>
            
        </ScheduleXCalendar>
      </div>

      <button className='btn-1' onClick={handleAddButtonClick}>Add Event</button>
    </div>
  )
}

export default Calendar
