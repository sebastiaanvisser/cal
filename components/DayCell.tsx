'use client'

import { isNewMonth, getDayName, formatDay } from './utils'
import styles from './DayCell.module.css'

interface DayCellProps {
  day: Date
  isToday: boolean
  previousLastDay: Date | null
}

export default function DayCell({ day, isToday, previousLastDay }: DayCellProps) {
  const isMonthBorder = isNewMonth(day, previousLastDay)

  return (
    <div
      className={`${styles.dayCell} ${isToday ? styles.today : ''} ${isMonthBorder ? styles.monthBorder : ''}`}
    >
      <div className={styles.dayLabel}>
        <span className={styles.dayName}>{getDayName(day)}</span>
        <span className={styles.dayNumber}>{formatDay(day)}</span>
      </div>
    </div>
  )
}
