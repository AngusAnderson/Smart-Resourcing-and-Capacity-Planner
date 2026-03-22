import React, { useEffect, useState } from 'react';
import { useCalendarApp, ScheduleXCalendar } from '@schedule-x/react';
import { createDragAndDropPlugin } from '@schedule-x/drag-and-drop';
import { createResizePlugin } from '@schedule-x/resize';
import { createCurrentTimePlugin } from '@schedule-x/current-time';
import {
  createViewDay,
  createViewMonthAgenda,
  createViewMonthGrid,
  createViewWeek,
} from '@schedule-x/calendar';
import { createEventsServicePlugin } from '@schedule-x/events-service';
import 'temporal-polyfill/global';
import '@schedule-x/theme-default/dist/index.css';
import '../css/Calendar.css';
import { createCalendarControlsPlugin } from '@schedule-x/calendar-controls';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
// import { fetchJobcodesAsEvents } from '../services/Job_Codes_API';
import { Temporal } from 'temporal-polyfill';

function Calendar({ searchTerm, selectedDate, events: appEvents, onFeedItem }) {

  const navigate = useNavigate()
  const calendarIds = ["Red", "Yellow", "Green", "Orange"];

  function getRandomCalendarId() {
    const randomIndex = Math.floor(Math.random() * calendarIds.length);
    return calendarIds[randomIndex];
  }

  const [error, setError] = useState(null);




  const eventsService = useState(() => createEventsServicePlugin())[0];
  const calendarControls = useState(() => createCalendarControlsPlugin())[0];

  const calendar = useCalendarApp({
    views: [
      createViewMonthAgenda(),
      createViewDay(),
      createViewWeek(),
      createViewMonthGrid(),
    ],
    calendars: {
      Red: {
        colorName: 'Red',
        lightColors: { main: '#f91c45', container: '#ffd2dc', onContainer: '#59000d' },
        darkColors: { main: '#ffc0cc', onContainer: '#ffdee6', container: '#a24258' },
      },
      Yellow: {
        colorName: 'Yellow',
        lightColors: { main: '#facc15', container: '#fef3c7', onContainer: '#78350f' },
        darkColors: { main: '#fde047', container: '#92400e', onContainer: '#fff7ed' }
      },
      Green: {
        colorName: 'Green',
        lightColors: { main: '#1cf9b0', container: '#dafff0', onContainer: '#004d3d' },
        darkColors: { main: '#c0fff5', onContainer: '#e6fff5', container: '#42a297' },
      },
      Orange: {
        colorName: 'Orange',
        lightColors: { main: '#fb923c', container: '#ffedd5', onContainer: '#7c2d12' },
        darkColors: { main: '#fdba74', container: '#9a3412', onContainer: '#fff7ed' }
      }
    },
    callbacks: {

      // updates events when user moves or resizes in calendar
      onEventUpdate: async (updatedEvent) => {
        console.log('CALENDAR onEventUpdate fired:', updatedEvent);

        // Capture the full OLD event before Schedule-X re-renders it
        const oldEvent =
          (eventsService.get && eventsService.get(updatedEvent.id)) ||
          (eventsService.getAll &&
            eventsService.getAll().find((e) => e.id === updatedEvent.id)) ||
          null;

        if (!oldEvent) {
          console.warn('No oldEvent found for', updatedEvent.id);
        } else {
          console.log(
            'Old event snapshot:',
            oldEvent.start.toString(),
            '->',
            oldEvent.end.toString()
          );
        }

        try {
          // Save new dates to backend
          await api.put(`/jobcodes/${updatedEvent.id}/`, {
            startDate: updatedEvent.start.toString(),
            endDate: updatedEvent.end.toString(),
          });

          const time = Temporal.Now.plainTimeISO().toString().slice(0, 5);

          if (onFeedItem) {
            onFeedItem({
              id: crypto.randomUUID(),
              projectId: updatedEvent.id,
              message: `Updated dates for project ${updatedEvent.id}`,
              completedAt: time,
              undo: async () => {
                if (!oldEvent) {
                  console.warn('Undo: no oldEvent for', updatedEvent.id);
                  return;
                }

                console.log(
                  'UNDO restoring',
                  updatedEvent.id,
                  oldEvent.start.toString(),
                  '->',
                  oldEvent.end.toString()
                );

                // Revert backend to old dates
                await api.put(`/jobcodes/${updatedEvent.id}/`, {
                  startDate: oldEvent.start.toString(),
                  endDate: oldEvent.end.toString(),
                });

                // IMPORTANT: restore the *entire* oldEvent, not updatedEvent with mixed dates
                if (eventsService.update) {
                  eventsService.update({ ...oldEvent });
                } else if (eventsService.remove && eventsService.add) {
                  eventsService.remove(oldEvent.id);
                  eventsService.add({ ...oldEvent });
                }
              },
            });
          }
        } catch (err) {
          console.error('Error updating jobcode:', err);
          setError(err.message);
        }

        console.log('Updated Event:', updatedEvent);
      },

      onEventClick: (calendarEvent) => {
        console.log('Event clicked:', calendarEvent);
        navigate(`/projects/${calendarEvent.id}`);
      },
    },
    plugins: [
      eventsService,
      createDragAndDropPlugin(),
      createResizePlugin(),
      createCurrentTimePlugin(),
      calendarControls,
    ],
    defaultView: 'month-grid',
  });

  useEffect(() => {
    if (eventsService.getAll) {
      eventsService.getAll().forEach((ev) => eventsService.remove(ev.id));
    }
    if (eventsService.clear) eventsService.clear();

    const eventsToRender = Array.isArray(appEvents) ? appEvents : [];
    const filteredEvents = searchTerm
      ? eventsToRender.filter((event) =>
          (event.title ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (event.customerName ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (event.businessUnit ?? '').toLowerCase().includes(searchTerm.toLowerCase())
        )
      : eventsToRender;

    filteredEvents.forEach((event) => {
      eventsService.add({ ...event, calendarId: getRandomCalendarId() });
    });
  }, [searchTerm, eventsService, appEvents]);

  useEffect(() => {
    if (selectedDate) {
      console.log('Big Calendar has received the date:', selectedDate.toString());
    }
  }, [selectedDate]);

  useEffect(() => {
    if (!selectedDate) return;
    console.log('Big Calendar navigating to:', selectedDate.toString());
    calendarControls.setDate(selectedDate);
  }, [selectedDate, calendarControls]);

  return (
    <div className="calendar-big-wrapper">
      <ScheduleXCalendar calendarApp={calendar} />
    </div>
  );

}

export default Calendar;
