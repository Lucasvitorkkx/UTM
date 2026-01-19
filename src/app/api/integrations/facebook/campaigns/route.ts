import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth';
import { db } from '@/db';
import { integrations } from '@/db/schema';
import { getEnhancedInsights, getAdSets, getAds } from '@/lib/facebook';
import { eq, and } from 'drizzle-orm';

export async function GET(req: NextRequest) {
    try {
        const { userId } = await verifySession();
        const { searchParams } = new URL(req.url);
        const datePreset = searchParams.get('date_preset') || 'last_30d';
        const level = (searchParams.get('level') || 'campaign') as 'campaign' | 'adset' | 'ad';

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

        const { accessToken, accountId } = integration;

        if (!accountId) {
            return NextResponse.json(
                { error: 'No ad account configured' },
                { status: 400 }
            );
        }

        // Fetch data based on level
        const [insights, adSets, ads] = await Promise.all([
            getEnhancedInsights(accessToken, accountId, level, datePreset),
            level !== 'campaign' ? getAdSets(accessToken, accountId) : Promise.resolve([]),
            level === 'ad' ? getAds(accessToken, accountId) : Promise.resolve([]),
        ]);

        return NextResponse.json({
            insights,
            adSets,
            ads,
            accountId,
            level,
        });
    } catch (error) {
        console.error('Fetch insights error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch insights' },
            { status: 500 }
        );
    }
}
