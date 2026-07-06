// Matches Fresh Style Barbershop's real hours.
// dayOfWeek: 0 = Sunday ... 6 = Saturday (matches JS Date#getDay()).
export const WEEKLY_HOURS: { dayOfWeek: number; startTime: string; endTime: string }[] = [
  { dayOfWeek: 0, startTime: "10:00", endTime: "15:00" }, // Sunday
  { dayOfWeek: 1, startTime: "10:00", endTime: "19:00" }, // Monday
  { dayOfWeek: 2, startTime: "10:00", endTime: "19:00" }, // Tuesday
  { dayOfWeek: 3, startTime: "10:00", endTime: "19:00" }, // Wednesday
  { dayOfWeek: 4, startTime: "10:00", endTime: "19:00" }, // Thursday
  { dayOfWeek: 5, startTime: "10:00", endTime: "19:00" }, // Friday
  { dayOfWeek: 6, startTime: "09:00", endTime: "17:00" }, // Saturday
];
