'use client'

import { getDayName, formatDay } from './utils'
import styles from './DayHeader.module.css'

interface DayHeaderProps {
  day: Date
  isToday: boolean
}

export default function DayHeader({ day, isToday }: DayHeaderProps) {
  return (
    <div className={`${styles.dayHeader} ${isToday ? styles.today : ''}`}>
      <span className={styles.dayName}>{getDayName(day)}</span>
      <span className={styles.dayNumber}>{formatDay(day)}</span>
    </div>
  )
}
