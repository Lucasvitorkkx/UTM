'use server';

import { db } from '@/db';
import { links } from '@/db/schema';
import { createLinkSchema, CreateLinkInput } from '@/lib/validations/links';
import { getOrCreateDefaultProject } from './projects';
import { verifySession } from '@/lib/auth';
import { eq, desc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { nanoid } from 'nanoid';

export async function createLinkAction(data: CreateLinkInput) {
    const session = await verifySession(); // ensure auth
    const result = createLinkSchema.safeParse(data);

    if (!result.success) {
        return { error: 'Invalid input data' };
    }

    const { destinationUrl, slug, utmSource, utmMedium, utmCampaign, utmContent, utmTerm } = result.data;

    const project = await getOrCreateDefaultProject();
    const finalSlug = slug || nanoid(7);

    try {
        // Check slug uniqueness (simplified, should check within project or domain)
        const existing = await db.select().from(links).where(eq(links.slug, finalSlug));
        if (existing.length > 0) {
            return { error: 'Slug already in use. Please choose another.' };
        }

        await db.insert(links).values({
            projectId: project.id,
            destinationUrl,
            slug: finalSlug,
            utmSource: utmSource || null,
            utmMedium: utmMedium || null,
            utmCampaign: utmCampaign || null,
            utmContent: utmContent || null,
            utmTerm: utmTerm || null,
        });

        revalidatePath('/dashboard/links');
        return { success: true };
    } catch (error) {
        console.error('Create link error:', error);
        return { error: 'Failed to create link' };
    }
}

export async function getLinksAction() {
    const session = await verifySession();
    const project = await getOrCreateDefaultProject();

    return await db.select()
        .from(links)
        .where(eq(links.projectId, project.id))
        .orderBy(desc(links.createdAt));
}
