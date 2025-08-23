import { z } from "zod";

export const MicroMemorySchema = z.object({
  content: z.string().min(1, "Content is required"),
  tags: z.array(z.string()).max(8).optional(),
  energy: z.enum(["low", "medium", "high"]).optional(),
  recall_at: z.string().datetime().optional(),
});

export type MicroMemoryInput = z.infer<typeof MicroMemorySchema>;