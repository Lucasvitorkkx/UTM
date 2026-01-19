import { z } from 'zod';

export const createLinkSchema = z.object({
    destinationUrl: z.string().url({ message: 'Please enter a valid URL' }),
    slug: z.string().min(3, { message: 'Slug must be at least 3 characters' }).optional().or(z.literal('')),
    utmSource: z.string().optional(),
    utmMedium: z.string().optional(),
    utmCampaign: z.string().optional(),
    utmTerm: z.string().optional(),
    utmContent: z.string().optional(),
});

export type CreateLinkInput = z.infer<typeof createLinkSchema>;
