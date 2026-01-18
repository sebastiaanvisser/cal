'use client'

import { getDayName, formatDay, calculateMonthBorders, MonthBorders } from './utils'
import styles from './DayCell.module.css'

interface DayCellProps {
  day: Date
  isToday: boolean
  dayIndex: number // 0 = Monday, 6 = Sunday
  weekDays: Date[] // All days in the week
}

// Calculate month border styles for a day (returns CSS properties)
const calculateMonthBorderStyles = (borders: MonthBorders): React.CSSProperties => {
  const styles: React.CSSProperties = {}
  
  if (borders.left) {
    styles.borderLeftWidth = '4px'
    styles.borderLeftColor = '#000000'
    styles.borderLeftStyle = 'solid'
  }
  
  if (borders.top) {
    styles.borderTopWidth = '4px'
    styles.borderTopColor = '#000000'
    styles.borderTopStyle = 'solid'
  }
  
  if (borders.bottom) {
    styles.borderBottomWidth = '4px'
    styles.borderBottomColor = '#000000'
    styles.borderBottomStyle = 'solid'
  }
  
  return styles
}

export default function DayCell({ day, isToday, dayIndex, weekDays }: DayCellProps) {
  const borders = calculateMonthBorders(day, dayIndex, weekDays)
  const borderStyles = calculateMonthBorderStyles(borders)
  
  const borderClasses = [
    borders.left ? styles.monthBorderLeft : '',
    borders.top ? styles.monthBorderTop : '',
    borders.bottom ? styles.monthBorderBottom : ''
  ].filter(Boolean).join(' ')

  return (
    <div
      className={`${styles.dayCell} ${isToday ? styles.today : ''} ${borderClasses}`}
      style={borderStyles}
    >
      <div className={styles.dayLabel}>
        <span className={styles.dayName}>{getDayName(day)}</span>
        <span className={styles.dayNumber}>{formatDay(day)}</span>
      </div>
    </div>
  )
}
