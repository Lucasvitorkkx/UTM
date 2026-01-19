import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth';
import { db } from '@/db';
import { integrations } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function DELETE(req: NextRequest) {
    try {
        const { userId } = await verifySession();

        await db
            .delete(integrations)
            .where(
                and(
                    eq(integrations.userId, userId),
                    eq(integrations.provider, 'facebook')
                )
            );

        return NextResponse.json({
            success: true,
            message: 'Facebook account disconnected',
        });
    } catch (error) {
        console.error('Facebook disconnect error:', error);
        return NextResponse.json(
            { error: 'Failed to disconnect Facebook account' },
            { status: 500 }
        );
    }
}
