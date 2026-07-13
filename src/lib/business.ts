export const BUSINESS = {
  name: "Avex Barber Lounge",
  phone: "(609) 285-8209",
  phoneHref: "tel:+16092858209",
  address: "2098 Brunswick Ave, Lawrence Township, NJ 08648",
  mapsHref:
    "https://www.google.com/maps/search/?api=1&query=2098+Brunswick+Ave+Lawrence+Township+NJ+08648",
} as const;

export const HOURS: { day: string; hours: string }[] = [
  { day: "Sunday", hours: "Closed" },
  { day: "Monday", hours: "9 AM–6 PM" },
  { day: "Tuesday", hours: "9 AM–6 PM" },
  { day: "Wednesday", hours: "9 AM–6 PM" },
  { day: "Thursday", hours: "9 AM–6 PM" },
  { day: "Friday", hours: "9 AM–6 PM" },
  { day: "Saturday", hours: "9 AM–6 PM" },
];
