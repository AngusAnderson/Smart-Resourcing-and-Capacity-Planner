import 'temporal-polyfill/global';
import api from '../services/api';

const calendarIds = ["Red", "Blue", "Green", "Black"];

function getRandomCalendarId() {
  return calendarIds[Math.floor(Math.random() * calendarIds.length)];
}

export async function fetchJobcodesAsEvents() {
  const response = await api.get('/jobcodes/');
  const eventData = response.data.map((jobcode) => ({
    id: jobcode.code,
    title: jobcode.code,
    start: Temporal.PlainDate.from(jobcode.startDate),
    end: Temporal.PlainDate.from(jobcode.endDate),
    calendarId: getRandomCalendarId(),
    customerName: jobcode.customerName,
    businessUnit: jobcode.businessUnit,
  }));
  return eventData;
}