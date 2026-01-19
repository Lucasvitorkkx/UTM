'use server';

import { db } from '@/db';
import { projects } from '@/db/schema';
import { verifySession } from '@/lib/auth';
import { eq } from 'drizzle-orm';

export async function getOrCreateDefaultProject() {
    const session = await verifySession();

    // Check if user has any project
    const userProjects = await db.select().from(projects).where(eq(projects.userId, session.userId));

    if (userProjects.length > 0) {
        return userProjects[0];
    }

    // Create default project
    const [newProject] = await db.insert(projects).values({
        userId: session.userId,
        name: 'Default Project',
    }).returning();

    return newProject;
}
