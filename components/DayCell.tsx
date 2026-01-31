'use client'

import { calculateMonthBorders, MonthBorders } from './utils'
import DayHeader from './DayHeader'
import HourGrid from './HourGrid'
import styles from './DayCell.module.css'

interface DayCellProps {
  day: Date
  isToday: boolean
  dayIndex: number // 0 = Monday, 6 = Sunday
  weekDays: Date[] // All days in the week
  fromHour?: number // Start hour for hour grid (default: 7)
  toHour?: number // End hour for hour grid (default: 19)
  hourHeight?: number // Height of each hour block in pixels (default: 20)
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

export default function DayCell({ 
  day, 
  isToday, 
  dayIndex, 
  weekDays,
  fromHour = 7,
  toHour = 19,
  hourHeight = 20
}: DayCellProps) {
  const borders = calculateMonthBorders(day, dayIndex, weekDays)
  const borderStyles = calculateMonthBorderStyles(borders)
  
  const borderClasses = [
    borders.left ? styles.monthBorderLeft : '',
    borders.top ? styles.monthBorderTop : '',
    borders.bottom ? styles.monthBorderBottom : ''
  ].filter(Boolean).join(' ')

  const isWeekend = day.getDay() === 0 || day.getDay() === 6

  return (
    <div
      className={`${styles.dayCell} ${isToday ? styles.today : ''} ${isWeekend ? styles.weekend : ''} ${borderClasses}`}
      style={borderStyles}
    >
      <DayHeader day={day} isToday={isToday} isWeekend={isWeekend} />
      <HourGrid fromHour={fromHour} toHour={toHour} hourHeight={hourHeight} />
    </div>
  )
}
