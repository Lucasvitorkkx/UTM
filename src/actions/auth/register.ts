'use server';

import { db } from '@/db';
import { users } from '@/db/schema';
import { hashPassword } from '@/lib/hash';
import { createSession } from '@/lib/auth';
import { registerSchema, RegisterInput } from '@/lib/validations/auth';
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';

export async function registerAction(data: RegisterInput) {
    const result = registerSchema.safeParse(data);
    if (!result.success) {
        return { error: 'Invalid input data' };
    }

    const { email, password } = result.data;

    try {
        const existingUser = await db.select().from(users).where(eq(users.email, email));

        if (existingUser.length > 0) {
            return { error: 'Email already in use' };
        }

        const passwordHash = await hashPassword(password);

        const [newUser] = await db.insert(users).values({
            email,
            passwordHash,
            plan: 'FREE',
        }).returning();

        await createSession(newUser.id, newUser.email, newUser.plan);

    } catch (error) {
        console.error('Registration error:', error);
        return { error: 'Failed to create account. Please try again.' };
    }

    redirect('/dashboard');
}
