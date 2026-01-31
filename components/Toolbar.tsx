'use client'

import { useCallback } from 'react'
import styles from './Toolbar.module.css'

export type ViewMode = 'weekly' | 'daily'

interface ToolbarProps {
  onScrollToDate: (date: Date) => void
  today: Date
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
}

export default function Toolbar({ onScrollToDate, today, viewMode, onViewModeChange }: ToolbarProps) {
  // Scroll to previous month
  const scrollToPreviousMonth = useCallback(() => {
    const prevMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1)
    prevMonth.setHours(0, 0, 0, 0)
    onScrollToDate(prevMonth)
  }, [today, onScrollToDate])

  // Scroll to start of this month
  const scrollToThisMonth = useCallback(() => {
    const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    firstOfMonth.setHours(0, 0, 0, 0)
    onScrollToDate(firstOfMonth)
  }, [today, onScrollToDate])

  // Scroll to today
  const scrollToToday = useCallback(() => {
    onScrollToDate(today)
  }, [today, onScrollToDate])

  // Scroll to next month
  const scrollToNextMonth = useCallback(() => {
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1)
    nextMonth.setHours(0, 0, 0, 0)
    onScrollToDate(nextMonth)
  }, [today, onScrollToDate])

  // Scroll to month after next
  const scrollToMonthAfter = useCallback(() => {
    const monthAfter = new Date(today.getFullYear(), today.getMonth() + 2, 1)
    monthAfter.setHours(0, 0, 0, 0)
    onScrollToDate(monthAfter)
  }, [today, onScrollToDate])

  // Scroll to month after the month after
  const scrollToMonthAfterNext = useCallback(() => {
    const monthAfterNext = new Date(today.getFullYear(), today.getMonth() + 3, 1)
    monthAfterNext.setHours(0, 0, 0, 0)
    onScrollToDate(monthAfterNext)
  }, [today, onScrollToDate])

  // Get month names for buttons
  const getMonthNames = () => {
    const prevMonthDate = new Date(today.getFullYear(), today.getMonth() - 1, 1)
    const prevMonth = prevMonthDate.toLocaleDateString('en-US', { month: 'short' })
    const thisMonth = today.toLocaleDateString('en-US', { month: 'short' })
    const nextMonthDate = new Date(today.getFullYear(), today.getMonth() + 1, 1)
    const nextMonth = nextMonthDate.toLocaleDateString('en-US', { month: 'short' })
    const monthAfterDate = new Date(today.getFullYear(), today.getMonth() + 2, 1)
    const monthAfter = monthAfterDate.toLocaleDateString('en-US', { month: 'short' })
    const monthAfterNextDate = new Date(today.getFullYear(), today.getMonth() + 3, 1)
    const monthAfterNext = monthAfterNextDate.toLocaleDateString('en-US', { month: 'short' })
    
    return { prevMonth, thisMonth, nextMonth, monthAfter, monthAfterNext }
  }

  const { prevMonth, thisMonth, nextMonth, monthAfter, monthAfterNext } = getMonthNames()

  return (
    <div className={styles.toolbar}>
      <div className={styles.viewModeButtons}>
        <button
          className={`${styles.toolbarButton} ${viewMode === 'weekly' ? styles.toolbarButtonActive : ''}`}
          onClick={() => onViewModeChange('weekly')}
          type="button"
        >
          Weekly
        </button>
        <button
          className={`${styles.toolbarButton} ${viewMode === 'daily' ? styles.toolbarButtonActive : ''}`}
          onClick={() => onViewModeChange('daily')}
          type="button"
        >
          Daily
        </button>
      </div>
      <div className={styles.toolbarButtons}>
        <button 
          className={styles.toolbarButton}
          onClick={scrollToPreviousMonth}
          type="button"
        >
          {prevMonth}
        </button>
        <button 
          className={styles.toolbarButton}
          onClick={scrollToThisMonth}
          type="button"
        >
          {thisMonth}
        </button>
        <button 
          className={styles.toolbarButton}
          onClick={scrollToToday}
          type="button"
        >
          Today
        </button>
        <button 
          className={styles.toolbarButton}
          onClick={scrollToNextMonth}
          type="button"
        >
          {nextMonth}
        </button>
        <button 
          className={styles.toolbarButton}
          onClick={scrollToMonthAfter}
          type="button"
        >
          {monthAfter}
        </button>
        <button 
          className={styles.toolbarButton}
          onClick={scrollToMonthAfterNext}
          type="button"
        >
          {monthAfterNext}
        </button>
      </div>
    </div>
  )
}
