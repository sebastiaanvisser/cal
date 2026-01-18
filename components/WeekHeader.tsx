'use client'

import { Week } from './types'
import { getMonthKey, getWeekNumber } from './utils'
import styles from './WeekHeader.module.css'

interface WeekHeaderProps {
  week: Week
}

export default function WeekHeader({ week }: WeekHeaderProps) {
  const firstDay = week.days[0] // Monday
  
  // Check if first day of month (the 1st) is in this week
  let firstOfMonthDate: Date | null = null
  
  for (const day of week.days) {
    if (day.getDate() === 1) {
      firstOfMonthDate = day
      break
    }
  }
  
  const months: string[] = []
  const mondayMonth = firstDay.toLocaleDateString('en-US', { month: 'short' })
  
  // If the 1st of a month is in this week and it's a different month than Monday
  if (firstOfMonthDate && getMonthKey(firstOfMonthDate) !== getMonthKey(firstDay)) {
    // Show both months: Monday's month first, then the month with the 1st
    months.push(mondayMonth)
    const firstOfMonthMonth = firstOfMonthDate.toLocaleDateString('en-US', { month: 'short' })
    months.push(firstOfMonthMonth)
  } else {
    // Only one month in this week
    months.push(mondayMonth)
  }
  
  const weekNumber = getWeekNumber(firstDay)
  const year = firstDay.getFullYear()

  return (
    <div className={styles.metaBlock}>
      <div className={styles.metaContent}>
        <div className={styles.metaMonths}>
          {months.map((month, idx) => (
            <span key={idx} className={styles.metaMonth}>{month}</span>
          ))}
        </div>
        <div className={styles.metaYear}>{year}</div>
        <div className={styles.metaWeek}>W{weekNumber}</div>
      </div>
    </div>
  )
}
