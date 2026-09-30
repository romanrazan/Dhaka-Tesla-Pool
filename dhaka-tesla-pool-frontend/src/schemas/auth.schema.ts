import { z } from 'zod';
export const loginSchema = z.object({ email: z.email('Enter a valid email'), password: z.string().min(8, 'Use at least 8 characters') });
export const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.email('Enter a valid email'),
  phone: z.string().regex(/^\+?[0-9]{10,15}$/, 'Enter a valid phone').or(z.literal('')),
  password: z.string().min(8, 'Use at least 8 characters').max(72),
});
export type LoginValues = z.infer<typeof loginSchema>;
export type RegisterValues = z.infer<typeof registerSchema>;

