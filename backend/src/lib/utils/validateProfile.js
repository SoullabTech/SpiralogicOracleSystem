import { elementalProfileSchema } from '../schemas/elemental';
export function validateProfile(input) {
    const parsed = elementalProfileSchema.safeParse(input);
    if (!parsed.success) {
        return { error: parsed.error.flatten(), data: null };
    }
    return { error: null, data: parsed.data };
}
