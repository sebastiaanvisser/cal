export interface Week {
  startDate: Date
  days: Date[]
  weekOffset: number // Offset from the base week (0 = week containing today)
}
