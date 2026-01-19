import 'server-only';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const SECRET_KEY = process.env.JWT_SECRET || 'default-secret-key-change-me';
const key = new TextEncoder().encode(SECRET_KEY);

const COOKIE_NAME = 'trackflux_session';

export type SessionPayload = {
    userId: string;
    email: string;
    plan: string;
    expiresAt: Date;
};

export async function encrypt(payload: Omit<SessionPayload, 'expiresAt'>) {
    return new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('7d')
        .sign(key);
}

export async function decrypt(token: string | undefined = '') {
    try {
        const { payload } = await jwtVerify(token, key, {
            algorithms: ['HS256'],
        });
        return payload;
    } catch (error) {
        return null;
    }
}

export async function createSession(userId: string, email: string, plan: string) {
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    const session = await encrypt({ userId, email, plan });

    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, session, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        expires: expiresAt,
        sameSite: 'lax',
        path: '/',
    });
}

export async function getSession() {
    const cookieStore = await cookies();
    const session = cookieStore.get(COOKIE_NAME)?.value;
    if (!session) return null;
    return await decrypt(session);
}

export async function deleteSession() {
    const cookieStore = await cookies();
    cookieStore.delete(COOKIE_NAME);
}

export async function verifySession() {
    const session = await getSession();
    if (!session?.userId) {
        redirect('/');
    }
    return { userId: session.userId as string };
}
