import { z } from 'zod';

export const updateWorkerLocationSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  serviceRadiusKm: z.number().min(1).max(50).optional().default(5),
});

export type UpdateWorkerLocationInput = z.infer<typeof updateWorkerLocationSchema>;

export const updateWorkerProfileSchema = z.object({
  skillType: z.string().min(1).optional(),
  experienceYears: z.number().min(0).max(50).optional(),
  certificationUrl: z.string().url().optional().nullable(),
  isAvailable: z.boolean().optional(),
});

export type UpdateWorkerProfileInput = z.infer<typeof updateWorkerProfileSchema>;

export const verifyWorkerSchema = z.object({
  verificationStatus: z.enum(['verified', 'rejected', 'pending']),
  reason: z.string().optional(),
});

export type VerifyWorkerInput = z.infer<typeof verifyWorkerSchema>;

export const nearbyWorkersQuerySchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  radiusKm: z.coerce.number().min(0.5).max(50).optional().default(10),
  skillType: z.string().optional(),
});

export type NearbyWorkersQueryInput = z.infer<typeof nearbyWorkersQuerySchema>;

