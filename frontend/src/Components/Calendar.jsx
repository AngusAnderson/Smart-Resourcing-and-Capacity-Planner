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
import api from '../services/api'
import { useNavigate } from 'react-router-dom'

function Calendar({ searchTerm, selectedDate }) {
  const navigate = useNavigate()
  const calendarIds = ["Red", "Yellow", "Green", "Orange"];

  function getCalendarIdForAllocation(actualDaysWorked, targetAllocatedDays, workingDaysInMonth) {
    
    if (actualDaysWorked === targetAllocatedDays){
      return calendarIds[2]
    } else if (actualDaysWorked > targetAllocatedDays && actualDaysWorked <= workingDaysInMonth){
      return calendarIds[3]
    } else if (actualDaysWorked < targetAllocatedDays){
      return calendarIds[0]
    } else if (actualDaysWorked > workingDaysInMonth){
      return calendarIds[1]
    }
  }

  function getWorkingDaysInMonth(monthDate) {
    const firstDay = Temporal.PlainDate.from({
      year: monthDate.year,
      month: monthDate.month,
      day: 1
    })

    const lastDay = firstDay
      .add({ months: 1 })
      .subtract({ days: 1 })

    let workingDays = 0
    let current = firstDay

    while (Temporal.PlainDate.compare(current, lastDay) <= 0) {
      const dayOfWeek = current.dayOfWeek // 1 = Monday, 7 = Sunday

      if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        workingDays++
      }

      current = current.add({ days: 1 })
    }

    return workingDays
  }


  function getActualDaysWorkedInMonth(events, monthDate) {
    const days = new Set();

    //for each event (jobcode)
    events.forEach((event) => {
      let start = event.start;
      let end = event.end;

      // Ensure Temporal.PlainDate
      if (!(start instanceof Temporal.PlainDate)) {
        start = Temporal.PlainDate.from(start);
      }
      if (!(end instanceof Temporal.PlainDate)) {
        end = Temporal.PlainDate.from(end);
      }

      let current = start;

      while (Temporal.PlainDate.compare(current, end) <= 0) {
        // Check if this day is within the month we're calculating
        if (
          current.year === monthDate.year &&
          current.month === monthDate.month
        ) {
          const dow = current.dayOfWeek; // 1 = Monday, 7 = Sunday
            days.add(current.toString());
        }

        current = current.add({ days: 1 });
      }
    });

    return days.size;
  }




  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeDate, setActiveDate] = useState(selectedDate ?? Temporal.Now.plainDateISO());
  const [targetAllocatedDays, setTargetAllocatedDays] = useState(null);
  const monthDate = activeDate

  useEffect(() => {
    console.log("Active month for calculations:", activeDate.toString());
  }, [activeDate]);



  const workingDaysInMonth = getWorkingDaysInMonth(monthDate);
  const options = [];
  for (let v = 0; v <= workingDaysInMonth; v += 0.5){
    options.push(Number(v.toFixed(1)));
  }

  const actualDaysWorked = getActualDaysWorkedInMonth(events, monthDate);



  useEffect(() => {
    const fetchJobCodes = async () => {
      try {
        const response = await api.get('/jobcodes/');
        console.log('API Response:', response.data); // Debug log
        const eventData = response.data.map((jobcode) => ({
          id: jobcode.code,
          title: jobcode.code,
          start: Temporal.PlainDate.from(jobcode.startDate),
          end: Temporal.PlainDate.from(jobcode.endDate),
          customerName: jobcode.customerName,
          businessUnit: jobcode.businessUnit,
        }));
        setEvents(eventData);
        setLoading(false);
        //log the jobcode data for debugging
        response.data.forEach(jobcode => {
          console.log('Jobcode:', jobcode);
        });
      } catch (err) {
        console.error('Error fetching jobcodes:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchJobCodes();
  }, []);

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
      Yellow: {
        colorName: 'Yellow',
        lightColors: { main: '#facc15', container: '#fef3c7', onContainer: '#78350f' },
        darkColors: { main: '#fde047', container: '#92400e', onContainer: '#fff7ed' }
      },
      Green: {
        colorName: 'Green',
        lightColors: { main: '#1cf9b0', container: '#dafff0', onContainer: '#004d3d' },
        darkColors: { main: '#c0fff5', onContainer: '#e6fff5', container: '#42a297' }
      },
      Orange: {
        colorName: 'Orange',
        lightColors: { main: '#fb923c', container: '#ffedd5', onContainer: '#7c2d12' },
        darkColors: { main: '#fdba74', container: '#9a3412', onContainer: '#fff7ed' }
      }
    },
    callbacks: {

      //Refreshes colour logic when arrows used to navigate to a different date
      onRangeUpdate: ({ start }) => {
        const startPlain = start.toPlainDate()
        const inMonth = startPlain.add({ days: 14 })

        setActiveDate(
          Temporal.PlainDate.from({ year: inMonth.year, month: inMonth.month, day: 1 })
        )
      },

      // updates events when user moves or resizes in calendar
      onEventUpdate: async (updatedEvent) => {
        try {
          await api.put(`/jobcodes/${updatedEvent.id}/`, {
            startDate: updatedEvent.start.toString(),
            endDate: updatedEvent.end.toString(),
          });

        // Update the event object when it is dragged on the calendar
        setEvents((prevEvents) =>
        prevEvents.map((ev) =>
          ev.id === updatedEvent.id
            ? { ...ev, start: updatedEvent.start, end: updatedEvent.end }
            : ev
          )
        );

        //logging for debugging
        } catch (err) {
          console.error('Error updating jobcode:', err);
          setError(err.message);
        }
        console.log('Updated Event:', updatedEvent);
      },
      // Navigate to project page when event is clicked
      onEventClick: (calendarEvent) => {
        console.log('Event clicked:', calendarEvent);
        // Navigate to project page using the event ID (jobcode)
        navigate(`/projects/${calendarEvent.id}`);
      }
    },
    plugins: [
      eventsService,
      createDragAndDropPlugin(),
      createResizePlugin(),
      createCurrentTimePlugin(),
      calendarControls
    ],
    defaultView: 'monthGrid'
  });

  useEffect(() => {

    if (eventsService.getAll) {
      eventsService.getAll().forEach(ev => eventsService.remove(ev.id));
    }
    if (eventsService.clear) eventsService.clear();

    const filteredEvents = searchTerm
      ? events.filter(event =>
          event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.businessUnit.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : events;


    const actualDaysWorked = getActualDaysWorkedInMonth(events, monthDate);
    const targetDaysToUse = targetAllocatedDays ?? workingDaysInMonth;
    const calendarIdForMonth = getCalendarIdForAllocation(actualDaysWorked, targetDaysToUse, workingDaysInMonth);


    console.log('Actual days:', actualDaysWorked);
    console.log('Target days:', targetDaysToUse);
    console.log('Calendar colour:', calendarIdForMonth);


    filteredEvents.forEach(event => eventsService.add({...event, calendarId: calendarIdForMonth}));
  }, [searchTerm, eventsService, events, monthDate, targetAllocatedDays, workingDaysInMonth]);


  useEffect(() => {
    if (selectedDate) {
      console.log("Big Calendar has received the date:", selectedDate.toString());
    }
  }, [selectedDate]);
  

  useEffect(() => {
    if (!selectedDate) return;
    console.log("Big Calendar navigating to:", selectedDate.toString())
    console.log("Working days from the month of this date:", getWorkingDaysInMonth(selectedDate))
    calendarControls.setDate(selectedDate);
    setActiveDate(selectedDate);
  }, [selectedDate, calendarControls])


  return (
    <div className="calendar-big-wrapper">
      <div className="calendar-header-overlay">
        <h3>
          Target allocated days:
          <select
            value={targetAllocatedDays ?? workingDaysInMonth}
            onChange={(e) => setTargetAllocatedDays(Number(e.target.value))}
          >
            {options.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
          /{workingDaysInMonth}
        </h3>

        <h3>Current Allocated Days: {actualDaysWorked}</h3>
      </div>

      <ScheduleXCalendar calendarApp={calendar} />
    </div>
  );

}

export default Calendar;
