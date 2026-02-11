// deadlineUtils.js
import 'temporal-polyfill/global';

export function getDeadlinesWithinTwoWeeks(events = []) {
  const today = Temporal.Now.plainDateISO();           // e.g. 2026-02-11 [web:78]
  const inTwoWeeks = today.add({ days: 14 });          // 2026-02-25 [web:18][web:102]

  return events.filter(ev => {
    if (!ev?.end) {
      return false;
    }

    // Normalise `end` to PlainDate in case it’s a string/Date
    const end = Temporal.PlainDate.from(ev.end);

    const cmpToday = Temporal.PlainDate.compare(end, today);         // <0,0,>0 [web:32][web:27]
    const cmpTwoWeeks = Temporal.PlainDate.compare(end, inTwoWeeks);

    const keep = cmpToday >= 0 && cmpTwoWeeks <= 0;

    return keep;
  });
}
