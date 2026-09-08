import { z } from 'zod';

export const createJobSchema = z.object({
  serviceType: z.string().min(1, 'Service type is required'),
  workerTypeRequested: z.string().optional(),
  description: z.string().min(5, 'Description must be at least 5 characters'),
  lat: z.number().min(-90).max(90, 'Invalid latitude'),
  lng: z.number().min(-180).max(180, 'Invalid longitude'),
  isUrgent: z.boolean().optional().default(false),
  scheduledAt: z.string().datetime().optional(),
  briefing: z.string().optional(),
});

export type CreateJobInput = z.infer<typeof createJobSchema>;

export const assignJobSchema = z.object({
  workerId: z.string().uuid('Invalid worker UUID'),
});

export type AssignJobInput = z.infer<typeof assignJobSchema>;

export const updateJobStatusSchema = z.object({
  status: z.enum(['pending', 'assigned', 'in_progress', 'completed', 'cancelled']),
});

export type UpdateJobStatusInput = z.infer<typeof updateJobStatusSchema>;

export const calculateQuoteSchema = z.object({
  serviceType: z.string().min(1),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  distanceKm: z.number().min(0).optional().default(5),
  workerExperienceYears: z.number().min(0).optional().default(2),
  isUrgent: z.boolean().optional().default(false),
});

export type CalculateQuoteInput = z.infer<typeof calculateQuoteSchema>;

