'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import styles from './Calendar.module.css'

interface Week {
  startDate: Date
  days: Date[]
  weekOffset: number // Offset from the base week (0 = week containing today)
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const INITIAL_WEEKS_BEFORE = 50
const INITIAL_WEEKS_AFTER = 50
const LOAD_MORE_THRESHOLD = 10 // Load more when within 10 weeks of edge
const WEEKS_TO_LOAD = 50 // How many weeks to load at a time

export default function Calendar() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [weeks, setWeeks] = useState<Week[]>([])
  const todayRef = useRef<Date>(new Date())
  const baseWeekOffsetRef = useRef<number>(0) // Tracks the offset of the first week in our array
  const isLoadingRef = useRef<boolean>(false)
  const hasScrolledToTodayRef = useRef<boolean>(false)

  // Generate a week from an offset (0 = week containing today)
  const generateWeek = useCallback((weekOffset: number): Week => {
    const today = todayRef.current
    const todayDay = today.getDay()
    const mondayOffset = todayDay === 0 ? -6 : 1 - todayDay
    const mondayOfThisWeek = new Date(today)
    mondayOfThisWeek.setDate(today.getDate() + mondayOffset)

    const weekStart = new Date(mondayOfThisWeek)
    weekStart.setDate(mondayOfThisWeek.getDate() + weekOffset * 7)
    
    const days: Date[] = []
    for (let j = 0; j < 7; j++) {
      const day = new Date(weekStart)
      day.setDate(weekStart.getDate() + j)
      days.push(day)
    }
    
    return { startDate: weekStart, days, weekOffset }
  }, [])

  // Initialize weeks around today
  const initializeWeeks = useCallback(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    todayRef.current = today

    const newWeeks: Week[] = []
    baseWeekOffsetRef.current = -INITIAL_WEEKS_BEFORE
    
    // Generate initial weeks
    for (let i = -INITIAL_WEEKS_BEFORE; i <= INITIAL_WEEKS_AFTER; i++) {
      newWeeks.push(generateWeek(i))
    }

    setWeeks(newWeeks)
  }, [generateWeek])

  useEffect(() => {
    initializeWeeks()
  }, [initializeWeeks])

  // Load more weeks at the end
  const loadMoreWeeksAtEnd = useCallback(() => {
    if (isLoadingRef.current) return
    isLoadingRef.current = true

    setWeeks(prevWeeks => {
      if (prevWeeks.length === 0) return prevWeeks
      
      const lastWeek = prevWeeks[prevWeeks.length - 1]
      const newWeeks: Week[] = []
      
      for (let i = 1; i <= WEEKS_TO_LOAD; i++) {
        newWeeks.push(generateWeek(lastWeek.weekOffset + i))
      }
      
      isLoadingRef.current = false
      return [...prevWeeks, ...newWeeks]
    })
  }, [generateWeek])

  // Load more weeks at the beginning
  const loadMoreWeeksAtStart = useCallback(() => {
    if (isLoadingRef.current) return
    isLoadingRef.current = true

    const container = containerRef.current
    if (!container) {
      isLoadingRef.current = false
      return
    }

    const scrollHeightBefore = container.scrollHeight
    const scrollTopBefore = container.scrollTop

    setWeeks(prevWeeks => {
      if (prevWeeks.length === 0) {
        isLoadingRef.current = false
        return prevWeeks
      }
      
      const firstWeek = prevWeeks[0]
      const newWeeks: Week[] = []
      
      for (let i = WEEKS_TO_LOAD; i >= 1; i--) {
        newWeeks.push(generateWeek(firstWeek.weekOffset - i))
      }
      
      baseWeekOffsetRef.current = firstWeek.weekOffset - WEEKS_TO_LOAD
      isLoadingRef.current = false
      
      return [...newWeeks, ...prevWeeks]
    })

    // Adjust scroll position after state update
    // Use multiple attempts to ensure it works after DOM updates
    const adjustScroll = () => {
      if (containerRef.current) {
        const scrollHeightAfter = containerRef.current.scrollHeight
        const heightDiff = scrollHeightAfter - scrollHeightBefore
        if (heightDiff > 0) {
          containerRef.current.scrollTop = scrollTopBefore + heightDiff
        }
      }
    }

    // Try adjusting immediately and after a few frames
    requestAnimationFrame(() => {
      adjustScroll()
      requestAnimationFrame(() => {
        adjustScroll()
      })
    })
  }, [generateWeek])

  // Handle scroll to detect when we need to load more
  const handleScroll = useCallback(() => {
    if (!containerRef.current || isLoadingRef.current) return

    const container = containerRef.current
    const scrollTop = container.scrollTop
    const scrollHeight = container.scrollHeight
    const clientHeight = container.clientHeight

    // Estimate week height (approximate)
    const estimatedWeekHeight = (scrollHeight / weeks.length) || 100
    const weeksFromTop = Math.floor(scrollTop / estimatedWeekHeight)
    const weeksFromBottom = Math.floor((scrollHeight - scrollTop - clientHeight) / estimatedWeekHeight)

    // Load more at the end if we're close to the bottom
    if (weeksFromBottom < LOAD_MORE_THRESHOLD) {
      loadMoreWeeksAtEnd()
    }

    // Load more at the start if we're close to the top
    if (weeksFromTop < LOAD_MORE_THRESHOLD) {
      loadMoreWeeksAtStart()
    }
  }, [weeks.length, loadMoreWeeksAtEnd, loadMoreWeeksAtStart])

  // Add scroll listener
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    container.addEventListener('scroll', handleScroll, { passive: true })
    return () => container.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  // Scroll to today on mount
  useEffect(() => {
    if (weeks.length === 0 || !containerRef.current || hasScrolledToTodayRef.current) return

    const today = todayRef.current
    const todayIndex = weeks.findIndex(week => 
      week.days.some(day => 
        day.getTime() === today.getTime()
      )
    )

    if (todayIndex !== -1) {
      const weekElement = containerRef.current.querySelector(
        `[data-week-offset="${weeks[todayIndex].weekOffset}"]`
      ) as HTMLElement
      
      if (weekElement) {
        // Small delay to ensure DOM is ready
        setTimeout(() => {
          weekElement.scrollIntoView({ behavior: 'auto', block: 'center' })
          hasScrolledToTodayRef.current = true
        }, 100)
      }
    }
  }, [weeks])

  const getMonthYear = (date: Date): { month: string; year: string } => {
    return {
      month: date.toLocaleDateString('en-US', { month: 'short' }),
      year: date.getFullYear().toString()
    }
  }

  const getMonthKey = (date: Date): string => {
    return `${date.getFullYear()}-${date.getMonth()}`
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

  // Get week number (ISO week number)
  const getWeekNumber = (date: Date): number => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
    const dayNum = d.getUTCDay() || 7
    d.setUTCDate(d.getUTCDate() + 4 - dayNum)
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
  }

  // Get meta block content for a week
  const getMetaBlockContent = (week: Week): { months: string[]; weekNumber: number; year: number } => {
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
    
    return { months, weekNumber, year }
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
          const previousWeek = weekIndex > 0 ? weeks[weekIndex - 1] : null
          const previousLastDay = previousWeek ? previousWeek.days[6] : null
          const metaContent = getMetaBlockContent(week)

          return (
            <div 
              key={`week-${week.weekOffset}`} 
              data-week-offset={week.weekOffset} 
              className={styles.weekWrapper}
            >
              {/* Week Row */}
              <div className={styles.weekRow}>
                {/* Meta Block */}
                <div className={styles.metaBlock}>
                  <div className={styles.metaContent}>
                    <div className={styles.metaMonths}>
                      {metaContent.months.map((month, idx) => (
                        <span key={idx} className={styles.metaMonth}>{month}</span>
                      ))}
                    </div>
                    <div className={styles.metaYear}>{metaContent.year}</div>
                    <div className={styles.metaWeek}>W{metaContent.weekNumber}</div>
                  </div>
                </div>

                {/* Day Cells */}
                {week.days.map((day, dayIndex) => {
                  const isMonthBorder = dayIndex === 0 && isNewMonth(day, previousLastDay)
                  
                  return (
                    <div
                      key={`${week.weekOffset}-${dayIndex}`}
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
