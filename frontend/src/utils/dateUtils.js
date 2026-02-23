import 'temporal-polyfill/global'

export function getWorkingDaysInMonth(monthDate) {
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
