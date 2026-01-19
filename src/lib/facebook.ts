/**
 * Facebook Marketing API Service
 * Handles interactions with Facebook Ads API
 */

const FB_API_VERSION = 'v22.0';
const FB_API_BASE = `https://graph.facebook.com/${FB_API_VERSION}`;

export interface FacebookAdAccount {
    id: string;
    name: string;
    account_id: string;
}

export interface FacebookCampaign {
    id: string;
    name: string;
    status: string;
    objective: string;
    daily_budget?: string;
    lifetime_budget?: string;
}

export interface CampaignInsights {
    campaign_id: string;
    campaign_name: string;
    impressions: number;
    clicks: number;
    spend: number;
    cpc: number;
    cpm: number;
    ctr: number;
    reach: number;
    actions?: Array<{
        action_type: string;
        value: string;
    }>;
}

/**
 * Fetch ad accounts for the authenticated user
 */
export async function getAdAccounts(accessToken: string): Promise<FacebookAdAccount[]> {
    const response = await fetch(
        `${FB_API_BASE}/me/adaccounts?fields=id,name,account_id&access_token=${accessToken}`
    );

    if (!response.ok) {
        throw new Error('Failed to fetch ad accounts from Facebook');
    }

    const data = await response.json();
    return data.data || [];
}

/**
 * Fetch campaigns for a specific ad account
 */
export async function getCampaigns(
    accessToken: string,
    accountId: string
): Promise<FacebookCampaign[]> {
    const response = await fetch(
        `${FB_API_BASE}/${accountId}/campaigns?fields=id,name,status,objective,daily_budget,lifetime_budget&access_token=${accessToken}`
    );

    if (!response.ok) {
        throw new Error('Failed to fetch campaigns from Facebook');
    }

    const data = await response.json();
    return data.data || [];
}

/**
 * Fetch insights for specific campaigns
 */
export async function getCampaignInsights(
    accessToken: string,
    accountId: string,
    datePreset: string = 'last_30d'
): Promise<CampaignInsights[]> {
    const fields = [
        'campaign_id',
        'campaign_name',
        'impressions',
        'clicks',
        'spend',
        'cpc',
        'cpm',
        'ctr',
        'reach',
        'actions'
    ].join(',');

    const response = await fetch(
        `${FB_API_BASE}/${accountId}/insights?level=campaign&fields=${fields}&date_preset=${datePreset}&access_token=${accessToken}`
    );

    if (!response.ok) {
        throw new Error('Failed to fetch campaign insights from Facebook');
    }

    const data = await response.json();
    return data.data || [];
}

/**
 * Validate access token
 */
export async function validateToken(accessToken: string): Promise<boolean> {
    try {
        const response = await fetch(
            `${FB_API_BASE}/me?access_token=${accessToken}`
        );
        return response.ok;
    } catch {
        return false;
    }
}
