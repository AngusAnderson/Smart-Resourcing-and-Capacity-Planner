import 'temporal-polyfill/global';

export function getDeadlinesWithinTwoWeeks(events = []) {
  const today = Temporal.Now.plainDateISO();
  const inTwoWeeks = today.add({ days: 14 });

  const inRange = events.filter(ev => {
    if (!ev?.end) return false;
    const end = Temporal.PlainDate.from(ev.end);

    const cmpToday = Temporal.PlainDate.compare(end, today);
    const cmpTwoWeeks = Temporal.PlainDate.compare(end, inTwoWeeks);

    return cmpToday >= 0 && cmpTwoWeeks <= 0;
  });

  return inRange.sort((a, b) =>
    Temporal.PlainDate.compare(
      Temporal.PlainDate.from(a.end),
      Temporal.PlainDate.from(b.end)
    )
  );
}
