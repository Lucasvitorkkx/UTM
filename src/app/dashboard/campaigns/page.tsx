'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Facebook, RefreshCw } from 'lucide-react';
import Link from 'next/link';

interface Campaign {
    id: string;
    name: string;
    status: string;
    objective: string;
    daily_budget?: string;
    lifetime_budget?: string;
    insights: {
        impressions: number;
        clicks: number;
        spend: number;
        cpc: number;
        cpm: number;
        ctr: number;
        reach: number;
    } | null;
}

export default function CampaignsPage() {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [datePreset, setDatePreset] = useState('last_30d');

    async function loadCampaigns() {
        setLoading(true);
        setError('');

        try {
            const response = await fetch(`/api/integrations/facebook/campaigns?date_preset=${datePreset}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to load campaigns');
            }

            setCampaigns(data.campaigns || []);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadCampaigns();
    }, [datePreset]);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(value);
    };

    const formatNumber = (value: number) => {
        return new Intl.NumberFormat('pt-BR').format(value);
    };

    if (error && error.includes('not connected')) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold">Campaigns</h1>
                    <p className="text-muted-foreground">View your Facebook Ads campaigns</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Connect Facebook Ads</CardTitle>
                        <CardDescription>
                            You need to connect your Facebook Ads account to view campaigns
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Link href="/dashboard/integrations">
                            <Button>
                                <Facebook className="h-4 w-4 mr-2" />
                                Go to Integrations
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Campaigns</h1>
                    <p className="text-muted-foreground">Facebook Ads campaign performance</p>
                </div>
                <div className="flex gap-2">
                    <Select value={datePreset} onValueChange={setDatePreset}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="today">Today</SelectItem>
                            <SelectItem value="yesterday">Yesterday</SelectItem>
                            <SelectItem value="last_7d">Last 7 days</SelectItem>
                            <SelectItem value="last_30d">Last 30 days</SelectItem>
                            <SelectItem value="this_month">This month</SelectItem>
                            <SelectItem value="last_month">Last month</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button onClick={loadCampaigns} disabled={loading} variant="outline">
                        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    </Button>
                </div>
            </div>

            {error && (
                <Card className="border-destructive">
                    <CardContent className="pt-6">
                        <p className="text-destructive">{error}</p>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>All Campaigns</CardTitle>
                    <CardDescription>
                        {campaigns.length} campaign{campaigns.length !== 1 ? 's' : ''} found
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center py-8 text-muted-foreground">
                            Loading campaigns...
                        </div>
                    ) : campaigns.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            No campaigns found
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Campaign</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Budget</TableHead>
                                        <TableHead className="text-right">Spend</TableHead>
                                        <TableHead className="text-right">Impressions</TableHead>
                                        <TableHead className="text-right">Clicks</TableHead>
                                        <TableHead className="text-right">CPC</TableHead>
                                        <TableHead className="text-right">CTR</TableHead>
                                        <TableHead className="text-right">Reach</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {campaigns.map((campaign) => (
                                        <TableRow key={campaign.id}>
                                            <TableCell className="font-medium">
                                                {campaign.name}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={
                                                        campaign.status === 'ACTIVE'
                                                            ? 'default'
                                                            : 'secondary'
                                                    }
                                                >
                                                    {campaign.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {campaign.daily_budget
                                                    ? formatCurrency(parseFloat(campaign.daily_budget) / 100)
                                                    : campaign.lifetime_budget
                                                        ? formatCurrency(parseFloat(campaign.lifetime_budget) / 100)
                                                        : 'N/A'}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {campaign.insights
                                                    ? formatCurrency(campaign.insights.spend)
                                                    : 'N/A'}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {campaign.insights
                                                    ? formatNumber(campaign.insights.impressions)
                                                    : 'N/A'}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {campaign.insights
                                                    ? formatNumber(campaign.insights.clicks)
                                                    : 'N/A'}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {campaign.insights
                                                    ? formatCurrency(campaign.insights.cpc)
                                                    : 'N/A'}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {campaign.insights
                                                    ? `${campaign.insights.ctr.toFixed(2)}%`
                                                    : 'N/A'}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {campaign.insights
                                                    ? formatNumber(campaign.insights.reach)
                                                    : 'N/A'}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
