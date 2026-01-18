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
