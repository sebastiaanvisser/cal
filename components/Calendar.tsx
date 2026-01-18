'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { Week } from './types'
import WeekHeader from './WeekHeader'
import DayCell from './DayCell'
import styles from './Calendar.module.css'

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

  const isToday = (date: Date): boolean => {
    const today = todayRef.current
    return date.getTime() === today.getTime()
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
          const previousWeek = weekIndex > 0 ? weeks[weekIndex - 1] : null
          const previousLastDay = previousWeek ? previousWeek.days[6] : null

          return (
            <div 
              key={`week-${week.weekOffset}`} 
              data-week-offset={week.weekOffset} 
              className={styles.weekWrapper}
            >
              {/* Week Row */}
              <div className={styles.weekRow}>
                {/* Week Header */}
                <WeekHeader week={week} />

                {/* Day Cells */}
                {week.days.map((day, dayIndex) => (
                  <DayCell
                    key={`${week.weekOffset}-${dayIndex}`}
                    day={day}
                    isToday={isToday(day)}
                    previousLastDay={dayIndex === 0 ? previousLastDay : null}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
