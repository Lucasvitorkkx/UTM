import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth';
import { db } from '@/db';
import { integrations } from '@/db/schema';
import { getCampaigns, getCampaignInsights } from '@/lib/facebook';
import { eq, and } from 'drizzle-orm';

export async function GET(req: NextRequest) {
    try {
        const { userId } = await verifySession();
        const { searchParams } = new URL(req.url);
        const datePreset = searchParams.get('date_preset') || 'last_30d';

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

        // Fetch campaigns and insights
        const [campaigns, insights] = await Promise.all([
            getCampaigns(accessToken, accountId),
            getCampaignInsights(accessToken, accountId, datePreset),
        ]);

        // Merge campaigns with insights
        const campaignsWithInsights = campaigns.map(campaign => {
            const insight = insights.find(i => i.campaign_id === campaign.id);
            return {
                ...campaign,
                insights: insight || null,
            };
        });

        return NextResponse.json({
            campaigns: campaignsWithInsights,
            accountId,
        });
    } catch (error) {
        console.error('Fetch campaigns error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch campaigns' },
            { status: 500 }
        );
    }
}
