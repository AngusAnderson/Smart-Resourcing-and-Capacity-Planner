import 'temporal-polyfill/global';

export function getDeadlinesWithinTwoWeeks(events) {

  console.log(events)
  const today = Temporal.Now.plainDateISO();
  const inTwoWeeks = today.add({ days: 14 });

  return events.filter(ev => {
    const end = ev.end;
    return (end.equals(today) || end > today) && end <= inTwoWeeks;
  });
}
