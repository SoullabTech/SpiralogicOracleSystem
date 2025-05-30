import { z } from 'zod';
export const elementalThemeSchema = z.enum(['fire', 'water', 'earth', 'air', 'aether']);
