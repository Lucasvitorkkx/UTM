import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth';
import { db } from '@/db';
import { integrations } from '@/db/schema';
import { getAdAccounts } from '@/lib/facebook';
import { eq, and } from 'drizzle-orm';

const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID!;
const FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET!;
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/facebook/callback`;

export async function GET(req: NextRequest) {
    try {
        const { userId } = await verifySession();
        const { searchParams } = new URL(req.url);
        const code = searchParams.get('code');

        if (!code) {
            return NextResponse.redirect(new URL('/dashboard/integrations?error=no_code', req.url));
        }

        // Exchange code for access token
        const tokenResponse = await fetch(
            `https://graph.facebook.com/v22.0/oauth/access_token?client_id=${FACEBOOK_APP_ID}&client_secret=${FACEBOOK_APP_SECRET}&code=${code}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`
        );

        if (!tokenResponse.ok) {
            throw new Error('Failed to exchange code for token');
        }

        const tokenData = await tokenResponse.json();
        const accessToken = tokenData.access_token;

        // Get ad accounts
        const adAccounts = await getAdAccounts(accessToken);

        // Use first ad account or let user choose later
        const accountId = adAccounts[0]?.id || '';
        const accountName = adAccounts[0]?.name || 'Facebook Ads';

        // Check if integration already exists
        const existing = await db
            .select()
            .from(integrations)
            .where(
                and(
                    eq(integrations.userId, userId),
                    eq(integrations.provider, 'facebook')
                )
            );

        if (existing.length > 0) {
            // Update existing integration
            await db
                .update(integrations)
                .set({
                    accessToken,
                    accountId,
                    accountName,
                    updatedAt: new Date(),
                })
                .where(eq(integrations.id, existing[0].id));
        } else {
            // Create new integration
            await db.insert(integrations).values({
                userId,
                provider: 'facebook',
                accessToken,
                accountId,
                accountName,
            });
        }

        // Redirect to integrations page with success
        return NextResponse.redirect(new URL('/dashboard/integrations?success=true', req.url));
    } catch (error) {
        console.error('Facebook OAuth callback error:', error);
        return NextResponse.redirect(new URL('/dashboard/integrations?error=auth_failed', req.url));
    }
}
