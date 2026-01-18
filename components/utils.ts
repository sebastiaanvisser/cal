export const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export const getMonthKey = (date: Date): string => {
  return `${date.getFullYear()}-${date.getMonth()}`
}

export const isNewMonth = (currentDate: Date, previousDate: Date | null): boolean => {
  if (!previousDate) return true
  return currentDate.getMonth() !== previousDate.getMonth() ||
         currentDate.getFullYear() !== previousDate.getFullYear()
}

export const getDayName = (date: Date): string => {
  return DAYS[date.getDay() === 0 ? 6 : date.getDay() - 1]
}

export const formatDay = (date: Date): string => {
  return date.getDate().toString()
}

// Get week number (ISO week number)
export const getWeekNumber = (date: Date): number => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
}

// Calculate month border styles for a day
export interface MonthBorders {
  left: boolean
  top: boolean
  bottom: boolean
}

export const calculateMonthBorders = (
  day: Date,
  dayIndex: number, // 0 = Monday, 6 = Sunday
  weekDays: Date[] // All days in the week
): MonthBorders => {
  const isFirstOfMonth = day.getDate() === 1
  const isMonday = dayIndex === 0
  const monthKey = getMonthKey(day)
  
  // Check if day 1 of this month is in this week
  const firstOfMonthInWeek = weekDays.find(d => 
    d.getDate() === 1 && getMonthKey(d) === monthKey
  )
  const firstOfMonthIndex = firstOfMonthInWeek ? weekDays.indexOf(firstOfMonthInWeek) : -1
  
  // Check if this is the last day of the month
  const lastDayOfMonth = new Date(day.getFullYear(), day.getMonth() + 1, 0)
  const isLastOfMonth = day.getTime() === lastDayOfMonth.getTime()
  
  // Check if last day of this month is in this week
  const lastOfMonthInWeek = weekDays.find(d => {
    const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0)
    return d.getTime() === lastDay.getTime()
  })
  const lastOfMonthIndex = lastOfMonthInWeek ? weekDays.indexOf(lastOfMonthInWeek) : -1
  const lastOfMonthMonthKey = lastOfMonthInWeek ? getMonthKey(lastOfMonthInWeek) : null
  
  // Check if day 1 of the NEXT month would be on Monday
  // If the last day of current month is Sunday, then day 1 of next month is Monday
  // We need to check if the day after the last day in this week would be Monday
  const nextMonth = new Date(day.getFullYear(), day.getMonth() + 1, 1)
  const day1OfNextMonthInWeek = weekDays.find(d => 
    d.getDate() === 1 && getMonthKey(d) === getMonthKey(nextMonth)
  )
  const day1OfNextMonthIndex = day1OfNextMonthInWeek ? weekDays.indexOf(day1OfNextMonthInWeek) : -1
  
  // If day 1 of next month is on Monday, it means the next week starts with day 1
  // We can detect this by: if the last day of a month in this week is on Sunday (index 6),
  // then the next day (day 1 of next month) is Monday
  const lastDayOfEndingMonthIsSunday = lastOfMonthInWeek && weekDays.indexOf(lastOfMonthInWeek) === 6
  const nextMonthDay1IsMonday = day1OfNextMonthIndex === 0 || lastDayOfEndingMonthIsSunday
  
  const borders: MonthBorders = {
    left: false,
    top: false,
    bottom: false
  }
  
  // Debug for Jan 1-4, 2026
  const isJan2026 = day.getFullYear() === 2026 && day.getMonth() === 0
  const isJan1to4 = isJan2026 && day.getDate() >= 1 && day.getDate() <= 4
  
  if (isJan1to4) {
    console.log('=== DEBUG Jan 1-4, 2026 ===')
    console.log('Day:', day.toLocaleDateString(), 'dayIndex:', dayIndex)
    console.log('isFirstOfMonth:', isFirstOfMonth)
    console.log('monthKey:', monthKey)
    console.log('firstOfMonthInWeek:', firstOfMonthInWeek?.toLocaleDateString())
    console.log('firstOfMonthIndex:', firstOfMonthIndex)
    console.log('weekDays:', weekDays.map(d => d.toLocaleDateString()))
  }
  
  // First day of month needs left border, except if it's Monday
  if (isFirstOfMonth && !isMonday) {
    borders.left = true
    if (isJan1to4) console.log('-> Setting left border')
  }
  
  // All days in the same week as day 1 need top border (because the row above is from previous month)
  // If day 1 is in this week, all days in this week should have top border
  if (firstOfMonthIndex !== -1) {
    borders.top = true
    if (isJan1to4) console.log('-> Setting top border (day 1 is in this week at index', firstOfMonthIndex, ', current dayIndex:', dayIndex, ')')
  } else if (isJan1to4) {
    console.log('-> NOT setting top border. firstOfMonthIndex:', firstOfMonthIndex, 'dayIndex:', dayIndex)
  }
  
  // If last day of a month is in this week, all days from that month in this week need bottom border
  // (because the row below will be from the next month)
  // BUT: if day 1 of the NEXT month is on Monday, don't draw bottom borders for days from the ending month
  // (because those days are in the previous week relative to day 1)
  if (lastOfMonthIndex !== -1 && lastOfMonthMonthKey === monthKey) {
    if (!nextMonthDay1IsMonday) {
      borders.bottom = true
      if (isJan1to4) console.log('-> Setting bottom border (last day of month is in this week at index', lastOfMonthIndex, ', current day is from same month)')
    } else if (isJan1to4) {
      console.log('-> NOT setting bottom border (day 1 of next month is on Monday)')
    }
  }
  
  if (isJan1to4) {
    console.log('Result borders:', borders)
    console.log('==================')
  }
  
  return borders
}
