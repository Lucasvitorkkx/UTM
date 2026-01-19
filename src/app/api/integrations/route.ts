import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth';
import { db } from '@/db';
import { integrations } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(req: NextRequest) {
    try {
        const { userId } = await verifySession();

        const userIntegrations = await db
            .select()
            .from(integrations)
            .where(eq(integrations.userId, userId));

        return NextResponse.json({
            integrations: userIntegrations.map(i => ({
                id: i.id,
                provider: i.provider,
                accountName: i.accountName,
                createdAt: i.createdAt,
            })),
        });
    } catch (error) {
        console.error('Fetch integrations error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch integrations' },
            { status: 500 }
        );
    }
}
