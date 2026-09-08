import { z } from 'zod';

export const updateCostParameterSchema = z.object({
  key: z.string().min(1, 'Parameter key is required'),
  value: z.number().positive('Value must be a positive number'),
});

export const updateCostParametersBatchSchema = z.object({
  parameters: z.array(updateCostParameterSchema),
});

export type UpdateCostParameterInput = z.infer<typeof updateCostParameterSchema>;
export type UpdateCostParametersBatchInput = z.infer<typeof updateCostParametersBatchSchema>;

