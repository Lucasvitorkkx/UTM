import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth';
import { db } from '@/db';
import { integrations } from '@/db/schema';
import { updateAdStatus, updateCampaignStatus } from '@/lib/facebook';
import { eq, and } from 'drizzle-orm';

export async function POST(req: NextRequest) {
    try {
        const { userId } = await verifySession();
        const { id, type, status } = await req.json();

        if (!id || !type || !status) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Get Facebook integration
        const [integration] = await db
            .select()
            .from(integrations)
            .where(
                and(
                    eq(integrations.userId, userId),
                    eq(integrations.provider, 'facebook')
                )
            );

        if (!integration) {
            return NextResponse.json(
                { error: 'Facebook account not connected' },
                { status: 404 }
            );
        }

        const { accessToken } = integration;

        // Update status based on type
        let success = false;
        if (type === 'campaign') {
            success = await updateCampaignStatus(accessToken, id, status);
        } else if (type === 'ad') {
            success = await updateAdStatus(accessToken, id, status);
        }

        if (!success) {
            return NextResponse.json(
                { error: 'Failed to update status' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: `${type} ${status === 'ACTIVE' ? 'activated' : 'paused'} successfully`,
        });
    } catch (error) {
        console.error('Update status error:', error);
        return NextResponse.json(
            { error: 'Failed to update status' },
            { status: 500 }
        );
    }
}
