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
import api from '../services/api'

function Calendar({ searchTerm }) {
  const calendarIds = ["Red", "Blue", "Green", "Black"];
  function getRandomCalendarId() {
    return calendarIds[Math.floor(Math.random() * calendarIds.length)];
  }

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchJobCodes = async () => {
      try {
        const response = await api.get('/jobcodes/');
        console.log('API Response:', response.data); // Debug log
        const eventData = response.data.map((jobcode) => ({
          id: jobcode.code,
          title: jobcode.title,
          start: Temporal.PlainDate.from(jobcode.startDate),
          end: Temporal.PlainDate.from(jobcode.endDate),
          calendarId: getRandomCalendarId(),
        }));
        setEvents(eventData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching jobcodes:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchJobCodes();
  }, []);

  const eventsService = useState(() => createEventsServicePlugin())[0];

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
      createCurrentTimePlugin()
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
      ? events.filter(event =>
          event.title.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : events;

    filteredEvents.forEach(event => eventsService.add(event));
  }, [searchTerm, eventsService, events]);

  return (
    <div className="calendar-big-wrapper">
      <ScheduleXCalendar calendarApp={calendar} />
    </div>
  );
}

export default Calendar;
