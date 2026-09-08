import { z } from 'zod';

export const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain alphanumeric, underscore, or hyphen'),
  role: z.enum(['worker', 'customer'], {
    errorMap: () => ({ message: "Role must be 'worker' or 'customer'. Admin cannot be self-registered." }),
  }),
  phone: z.string().optional(),
  address: z.string().optional(),
  // Worker-specific optional fields during signup
  skillType: z.string().optional(),
  experienceYears: z.number().min(0).max(50).optional(),
});

export type SignupInput = z.infer<typeof signupSchema>;

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export type LoginInput = z.infer<typeof loginSchema>;

