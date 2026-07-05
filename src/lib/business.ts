export const BUSINESS = {
  name: "Fresh Style Barbershop",
  phone: "(732) 297-3133",
  phoneHref: "tel:+17322973133",
  address: "2244 US-130, North Brunswick Township, NJ 08902",
  mapsHref:
    "https://www.google.com/maps/search/?api=1&query=2244+US-130+North+Brunswick+Township+NJ+08902",
} as const;

export const HOURS: { day: string; hours: string }[] = [
  { day: "Sunday", hours: "10 AM–3 PM" },
  { day: "Monday", hours: "10 AM–7 PM" },
  { day: "Tuesday", hours: "10 AM–7 PM" },
  { day: "Wednesday", hours: "10 AM–7 PM" },
  { day: "Thursday", hours: "10 AM–7 PM" },
  { day: "Friday", hours: "10 AM–7 PM" },
  { day: "Saturday", hours: "9 AM–5 PM" },
];
