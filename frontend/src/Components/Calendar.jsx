import React, { useEffect, useState } from 'react'
import { useCalendarApp, ScheduleXCalendar } from '@schedule-x/react'
import { createDragAndDropPlugin } from '@schedule-x/drag-and-drop'
import { createResizePlugin } from '@schedule-x/resize'
import { createCurrentTimePlugin } from '@schedule-x/current-time'
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
import { createCalendarControlsPlugin } from '@schedule-x/calendar-controls'

function Calendar({ searchTerm, selectedDate }) {
  const calendarIds = ["Red", "Blue", "Green", "Black"];

  function getRandomCalendarId() {
    return calendarIds[Math.floor(Math.random() * calendarIds.length)];
  }

  const testEvents = [
    {
      id: '1',
      title: 'Project A',
      start: Temporal.PlainDate.from('2025-11-19'),
      end: Temporal.PlainDate.from('2025-11-25'),
      calendarId: getRandomCalendarId(),
    },
    {
      id: '2',
      title: 'Project B',
      start: Temporal.PlainDate.from('2025-11-15'),
      end: Temporal.PlainDate.from('2025-11-22'),
      calendarId: getRandomCalendarId(),
    },
  ];

  const eventsService = useState(() => createEventsServicePlugin())[0];
  const calendarControls = useState(() => createCalendarControlsPlugin())[0];


  const calendar = useCalendarApp({
    views: [
      createViewMonthAgenda(),
      createViewDay(),
      createViewWeek(),
      createViewMonthGrid()
    ],
    calendars: {
      Red: {
        colorName: 'Red',
        lightColors: { main: '#f91c45', container: '#ffd2dc', onContainer: '#59000d' },
        darkColors: { main: '#ffc0cc', onContainer: '#ffdee6', container: '#a24258' }
      },
      Blue: {
        colorName: 'Blue',
        lightColors: { main: '#1c7df9', container: '#d2e7ff', onContainer: '#002859' },
        darkColors: { main: '#c0dfff', onContainer: '#dee6ff', container: '#426aa2' }
      },
      Green: {
        colorName: 'Green',
        lightColors: { main: '#1cf9b0', container: '#dafff0', onContainer: '#004d3d' },
        darkColors: { main: '#c0fff5', onContainer: '#e6fff5', container: '#42a297' }
      },
      Black: {
        colorName: 'Black',
        lightColors: { main: '#222', container: '#eee', onContainer: '#555' },
        darkColors: { main: '#444', onContainer: '#999', container: '#222' }
      }
    },
    plugins: [
      eventsService,
      createDragAndDropPlugin(),
      createResizePlugin(),
      createCurrentTimePlugin(),
      calendarControls
    ],
    defaultView: 'monthGrid',
    callbacks: {
      onEventUpdate(updatedEvent) {
        console.log('Updated Event:', updatedEvent);
      }
    }
  });

  useEffect(() => {

    if (eventsService.getAll) {
      eventsService.getAll().forEach(ev => eventsService.remove(ev.id));
    }
    if (eventsService.clear) eventsService.clear();

    const filteredEvents = searchTerm
      ? testEvents.filter(event =>
          event.title.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : testEvents;

    filteredEvents.forEach(event => eventsService.add(event));
  }, [searchTerm, eventsService, testEvents]);


  useEffect(() => {
    if (selectedDate) {
      console.log("Big Calendar has received the date:", selectedDate.toString());
    }
  }, [selectedDate]);
  

  useEffect(() => {
    if (!selectedDate) return
    console.log("Big Calendar navigating to:", selectedDate.toString())

    calendarControls.setDate(selectedDate)

  }, [selectedDate, calendarControls])


  return (
    <div className="calendar-big-wrapper">
      <ScheduleXCalendar calendarApp={calendar} />
    </div>
  );
}

export default Calendar;
