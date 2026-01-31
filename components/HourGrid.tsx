'use client'

import styles from './HourGrid.module.css'

interface HourGridProps {
  fromHour: number // Start hour (e.g., 7)
  toHour: number // End hour (e.g., 19)
  hourHeight: number // Height of each hour block in pixels
}

export default function HourGrid({ fromHour, toHour, hourHeight }: HourGridProps) {
  // Only render the visible hour range (no internal scroll)
  const hours: number[] = []
  for (let i = fromHour; i <= toHour; i++) {
    hours.push(i)
  }

  return (
    <div className={styles.hourGridContainer}>
      <div className={styles.hourGrid}>
        {hours.map((hour) => {
          const normalizedHour = ((hour % 24) + 24) % 24
          return (
            <div
              key={hour}
              className={styles.hourBlock}
              style={{ height: `${hourHeight}px` }}
            >
              <div className={styles.hourIndicator}>{normalizedHour.toString().padStart(2, '0')}:00</div>
              <div className={styles.hourLine} />
            </div>
          )
        })}
      </div>
    </div>
  )
}
