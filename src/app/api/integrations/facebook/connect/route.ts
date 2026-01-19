import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth';
import { db } from '@/db';
import { integrations } from '@/db/schema';
import { validateToken, getAdAccounts } from '@/lib/facebook';
import { eq, and } from 'drizzle-orm';

export async function POST(req: NextRequest) {
    try {
        const { userId } = await verifySession();
        const { accessToken, accountId } = await req.json();

        if (!accessToken) {
            return NextResponse.json(
                { error: 'Access token is required' },
                { status: 400 }
            );
        }

        // Validate token
        const isValid = await validateToken(accessToken);
        if (!isValid) {
            return NextResponse.json(
                { error: 'Invalid Facebook access token' },
                { status: 401 }
            );
        }

        // Get account info
        let accountName = 'Facebook Ads';
        if (accountId) {
            const accounts = await getAdAccounts(accessToken);
            const account = accounts.find(acc => acc.account_id === accountId || acc.id === accountId);
            if (account) {
                accountName = account.name;
            }
        }

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
                    accountId: accountId || null,
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
                accountId: accountId || null,
                accountName,
            });
        }

        return NextResponse.json({
            success: true,
            message: 'Facebook account connected successfully',
        });
    } catch (error) {
        console.error('Facebook connect error:', error);
        return NextResponse.json(
            { error: 'Failed to connect Facebook account' },
            { status: 500 }
        );
    }
}
