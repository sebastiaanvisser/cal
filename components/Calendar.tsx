'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import styles from './Calendar.module.css'

interface Week {
  startDate: Date
  days: Date[]
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export default function Calendar() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [weeks, setWeeks] = useState<Week[]>([])
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 0 })
  const todayRef = useRef<Date>(new Date())
  const scrollPositionRef = useRef<number>(0)

  // Initialize weeks around today
  const initializeWeeks = useCallback(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    todayRef.current = today

    // Get Monday of the week containing today
    const todayDay = today.getDay()
    const mondayOffset = todayDay === 0 ? -6 : 1 - todayDay
    const mondayOfThisWeek = new Date(today)
    mondayOfThisWeek.setDate(today.getDate() + mondayOffset)

    const newWeeks: Week[] = []
    
    // Generate weeks: 100 weeks before and 200 weeks after (for infinite scroll effect)
    for (let i = -100; i < 200; i++) {
      const weekStart = new Date(mondayOfThisWeek)
      weekStart.setDate(mondayOfThisWeek.getDate() + i * 7)
      
      const days: Date[] = []
      for (let j = 0; j < 7; j++) {
        const day = new Date(weekStart)
        day.setDate(weekStart.getDate() + j)
        days.push(day)
      }
      
      newWeeks.push({ startDate: weekStart, days })
    }

    setWeeks(newWeeks)
    setVisibleRange({ start: 0, end: newWeeks.length })
  }, [])

  useEffect(() => {
    initializeWeeks()
  }, [initializeWeeks])

  // Scroll to today on mount
  useEffect(() => {
    if (weeks.length === 0 || !containerRef.current) return

    const today = todayRef.current
    const todayIndex = weeks.findIndex(week => 
      week.days.some(day => 
        day.getTime() === today.getTime()
      )
    )

    if (todayIndex !== -1) {
      const weekElement = containerRef.current.querySelector(
        `[data-week-index="${todayIndex}"]`
      ) as HTMLElement
      
      if (weekElement) {
        // Small delay to ensure DOM is ready
        setTimeout(() => {
          weekElement.scrollIntoView({ behavior: 'auto', block: 'center' })
        }, 100)
      }
    }
  }, [weeks])

  const getMonthYear = (date: Date): string => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  }

  const isNewMonth = (currentDate: Date, previousDate: Date | null): boolean => {
    if (!previousDate) return true
    return currentDate.getMonth() !== previousDate.getMonth() ||
           currentDate.getFullYear() !== previousDate.getFullYear()
  }

  const isToday = (date: Date): boolean => {
    const today = todayRef.current
    return date.getTime() === today.getTime()
  }

  const formatDay = (date: Date): string => {
    return date.getDate().toString()
  }

  const getDayName = (date: Date): string => {
    return DAYS[date.getDay() === 0 ? 6 : date.getDay() - 1]
  }

  return (
    <div className={styles.container}>
      {/* Sticky Toolbar */}
      <div className={styles.toolbar}>
        {/* Toolbar content will be added here */}
      </div>

      {/* Calendar Content */}
      <div className={styles.calendarContainer} ref={containerRef}>
        {weeks.map((week, weekIndex) => {
          const firstDay = week.days[0]
          const lastDay = week.days[6]
          const previousWeek = weekIndex > 0 ? weeks[weekIndex - 1] : null
          const previousLastDay = previousWeek ? previousWeek.days[6] : null
          const showMonthHeader = isNewMonth(firstDay, previousLastDay)

          return (
            <div key={weekIndex} data-week-index={weekIndex}>
              {/* Month/Year Header */}
              {showMonthHeader && (
                <div className={styles.monthHeader}>
                  {getMonthYear(firstDay)}
                </div>
              )}

              {/* Week Row */}
              <div className={styles.weekRow}>
                {week.days.map((day, dayIndex) => {
                  const isMonthBorder = dayIndex === 0 && isNewMonth(day, previousLastDay)
                  
                  return (
                    <div
                      key={dayIndex}
                      className={`${styles.dayCell} ${isToday(day) ? styles.today : ''} ${isMonthBorder ? styles.monthBorder : ''}`}
                    >
                      <div className={styles.dayLabel}>
                        <span className={styles.dayName}>{getDayName(day)}</span>
                        <span className={styles.dayNumber}>{formatDay(day)}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
