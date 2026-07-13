// Matches Avex Barber Lounge's real hours. Sunday is omitted entirely
// (no Availability row that day) rather than given a zero-length window,
// since getAvailableSlots already treats "no row" as closed.
// dayOfWeek: 0 = Sunday ... 6 = Saturday (matches JS Date#getDay()).
export const WEEKLY_HOURS: { dayOfWeek: number; startTime: string; endTime: string }[] = [
  { dayOfWeek: 1, startTime: "09:00", endTime: "18:00" }, // Monday
  { dayOfWeek: 2, startTime: "09:00", endTime: "18:00" }, // Tuesday
  { dayOfWeek: 3, startTime: "09:00", endTime: "18:00" }, // Wednesday
  { dayOfWeek: 4, startTime: "09:00", endTime: "18:00" }, // Thursday
  { dayOfWeek: 5, startTime: "09:00", endTime: "18:00" }, // Friday
  { dayOfWeek: 6, startTime: "09:00", endTime: "18:00" }, // Saturday
];
