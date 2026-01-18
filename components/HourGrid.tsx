'use client'

import { useRef, useEffect } from 'react'
import styles from './HourGrid.module.css'

interface HourGridProps {
  fromHour: number // Start hour (e.g., 6 for 6 AM)
  toHour: number // End hour (e.g., 22 for 10 PM)
  hourHeight: number // Height of each hour block in pixels
}

export default function HourGrid({ fromHour, toHour, hourHeight }: HourGridProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  // Generate extended hours for scrolling (2 hours before and after for buffer)
  const extendedHours: number[] = []
  const bufferHours = 2
  for (let i = fromHour - bufferHours; i <= toHour + bufferHours; i++) {
    extendedHours.push(i)
  }

  // Scroll to show the visible range on mount
  useEffect(() => {
    if (containerRef.current) {
      // Calculate scroll position to show fromHour at the top
      // Each hour before fromHour takes hourHeight pixels
      const hoursBeforeVisible = bufferHours
      const scrollTop = hoursBeforeVisible * hourHeight
      containerRef.current.scrollTop = scrollTop
    }
  }, [fromHour, hourHeight])

  return (
    <div className={styles.hourGridContainer} ref={containerRef}>
      <div className={styles.hourGrid}>
        {extendedHours.map((hour) => {
          const normalizedHour = ((hour % 24) + 24) % 24
          const isVisibleRange = hour >= fromHour && hour <= toHour
          
          return (
            <div
              key={hour}
              className={`${styles.hourBlock} ${isVisibleRange ? styles.visibleHour : ''}`}
              style={{ height: `${hourHeight}px` }}
            >
              <div className={styles.hourIndicator}>{normalizedHour}</div>
              <div className={styles.hourLine} />
            </div>
          )
        })}
      </div>
    </div>
  )
}
