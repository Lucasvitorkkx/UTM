'use server';

import { db } from '@/db';
import { users } from '@/db/schema';
import { verifyPassword } from '@/lib/hash';
import { createSession } from '@/lib/auth';
import { loginSchema, LoginInput } from '@/lib/validations/auth';
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';

export async function loginAction(data: LoginInput) {
    const result = loginSchema.safeParse(data);
    if (!result.success) {
        return { error: 'Invalid input data' };
    }

    const { email, password } = result.data;

    try {
        const [user] = await db.select().from(users).where(eq(users.email, email));

        if (!user) {
            return { error: 'Invalid email or password' };
        }

        const isValid = await verifyPassword(password, user.passwordHash);

        if (!isValid) {
            return { error: 'Invalid email or password' };
        }

        await createSession(user.id, user.email, user.plan);

    } catch (error) {
        console.error('Login error:', error);
        return { error: 'Something went wrong. Please try again.' };
    }

    redirect('/dashboard');
}
