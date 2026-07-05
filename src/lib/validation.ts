import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Name is too short").max(80),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export const bookAppointmentSchema = z.object({
  barberId: z.string().min(1),
  serviceId: z.string().min(1),
  startTime: z.string().datetime(),
  notes: z.string().max(500).optional(),
});
