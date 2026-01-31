'use client'

import { getDayName, formatDay } from './utils'
import styles from './DayHeader.module.css'

interface DayHeaderProps {
  day: Date
  isToday: boolean
  variant?: 'default' | 'daily'
  isWeekend?: boolean
}

export default function DayHeader({ day, isToday, variant = 'default', isWeekend = false }: DayHeaderProps) {
  const monthShort = day.toLocaleDateString('en-US', { month: 'short' })

  if (variant === 'daily') {
    return (
      <div className={`${styles.dayHeader} ${styles.dayHeaderDaily} ${isToday ? styles.today : ''} ${isWeekend ? styles.weekend : ''}`}>
        <span className={styles.dayDateMonth}>
          <span className={styles.dayNumber}>{formatDay(day)}</span>
          <span className={styles.dayMonth}>{monthShort}</span>
        </span>
        <span className={styles.dayName}>{getDayName(day)}</span>
      </div>
    )
  }

  return (
    <div className={`${styles.dayHeader} ${isToday ? styles.today : ''} ${isWeekend ? styles.weekend : ''}`}>
      <span className={styles.dayName}>{getDayName(day)}</span>
      <span className={styles.dayNumber}>{formatDay(day)}</span>
    </div>
  )
}
