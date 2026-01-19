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

export interface FacebookAdSet {
    id: string;
    name: string;
    campaign_id: string;
    status: string;
    daily_budget?: string;
    lifetime_budget?: string;
    optimization_goal?: string;
}

export interface FacebookAd {
    id: string;
    name: string;
    adset_id: string;
    campaign_id: string;
    status: string;
    creative?: {
        id: string;
        title?: string;
        body?: string;
    };
}

export interface EnhancedInsights extends CampaignInsights {
    roas?: number;
    roi?: number;
    cost_per_conversion?: number;
    conversion_rate?: number;
    purchases?: number;
    purchase_value?: number;
}

/**
 * Fetch ad sets for a specific campaign or account
 */
export async function getAdSets(
    accessToken: string,
    accountId: string,
    campaignId?: string
): Promise<FacebookAdSet[]> {
    const endpoint = campaignId
        ? `${FB_API_BASE}/${campaignId}/adsets`
        : `${FB_API_BASE}/${accountId}/adsets`;

    const response = await fetch(
        `${endpoint}?fields=id,name,campaign_id,status,daily_budget,lifetime_budget,optimization_goal&access_token=${accessToken}`
    );

    if (!response.ok) {
        throw new Error('Failed to fetch ad sets from Facebook');
    }

    const data = await response.json();
    return data.data || [];
}

/**
 * Fetch individual ads
 */
export async function getAds(
    accessToken: string,
    accountId: string,
    adSetId?: string
): Promise<FacebookAd[]> {
    const endpoint = adSetId
        ? `${FB_API_BASE}/${adSetId}/ads`
        : `${FB_API_BASE}/${accountId}/ads`;

    const response = await fetch(
        `${endpoint}?fields=id,name,adset_id,campaign_id,status,creative{id,title,body}&access_token=${accessToken}`
    );

    if (!response.ok) {
        throw new Error('Failed to fetch ads from Facebook');
    }

    const data = await response.json();
    return data.data || [];
}

/**
 * Fetch enhanced insights with ROI and ROAS
 */
export async function getEnhancedInsights(
    accessToken: string,
    accountId: string,
    level: 'campaign' | 'adset' | 'ad' = 'campaign',
    datePreset: string = 'last_30d'
): Promise<EnhancedInsights[]> {
    const fields = [
        'campaign_id',
        'campaign_name',
        'adset_id',
        'adset_name',
        'ad_id',
        'ad_name',
        'impressions',
        'clicks',
        'spend',
        'cpc',
        'cpm',
        'ctr',
        'reach',
        'actions',
        'action_values',
        'cost_per_action_type',
        'conversions',
        'conversion_values'
    ].join(',');

    const response = await fetch(
        `${FB_API_BASE}/${accountId}/insights?level=${level}&fields=${fields}&date_preset=${datePreset}&access_token=${accessToken}`
    );

    if (!response.ok) {
        throw new Error('Failed to fetch enhanced insights from Facebook');
    }

    const data = await response.json();
    const insights = data.data || [];

    // Calculate ROI and ROAS
    return insights.map((insight: any) => {
        const spend = parseFloat(insight.spend || 0);
        const purchases = insight.actions?.find((a: any) => a.action_type === 'purchase')?.value || 0;
        const purchaseValue = insight.action_values?.find((a: any) => a.action_type === 'purchase')?.value || 0;

        const roas = spend > 0 ? (parseFloat(purchaseValue) / spend) : 0;
        const roi = spend > 0 ? ((parseFloat(purchaseValue) - spend) / spend) * 100 : 0;
        const costPerConversion = purchases > 0 ? spend / parseFloat(purchases) : 0;
        const conversionRate = insight.clicks > 0 ? (parseFloat(purchases) / insight.clicks) * 100 : 0;

        return {
            ...insight,
            roas,
            roi,
            cost_per_conversion: costPerConversion,
            conversion_rate: conversionRate,
            purchases: parseFloat(purchases),
            purchase_value: parseFloat(purchaseValue),
        };
    });
}

/**
 * Update ad status (activate/deactivate)
 */
export async function updateAdStatus(
    accessToken: string,
    adId: string,
    status: 'ACTIVE' | 'PAUSED'
): Promise<boolean> {
    const response = await fetch(
        `${FB_API_BASE}/${adId}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                status,
                access_token: accessToken,
            }),
        }
    );

    return response.ok;
}

/**
 * Update campaign status
 */
export async function updateCampaignStatus(
    accessToken: string,
    campaignId: string,
    status: 'ACTIVE' | 'PAUSED'
): Promise<boolean> {
    const response = await fetch(
        `${FB_API_BASE}/${campaignId}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                status,
                access_token: accessToken,
            }),
        }
    );

    return response.ok;
}

