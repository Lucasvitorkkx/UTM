'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Facebook, RefreshCw, TrendingUp, TrendingDown } from 'lucide-react';
import Link from 'next/link';

interface Insight {
    campaign_id?: string;
    campaign_name?: string;
    adset_id?: string;
    adset_name?: string;
    ad_id?: string;
    ad_name?: string;
    impressions: number;
    clicks: number;
    spend: number;
    cpc: number;
    cpm: number;
    ctr: number;
    reach: number;
    roas?: number;
    roi?: number;
    cost_per_conversion?: number;
    conversion_rate?: number;
    purchases?: number;
    purchase_value?: number;
}

export default function CampaignsPage() {
    const [insights, setInsights] = useState<Insight[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [datePreset, setDatePreset] = useState('last_30d');
    const [level, setLevel] = useState<'campaign' | 'adset' | 'ad'>('campaign');

    async function loadInsights() {
        setLoading(true);
        setError('');

        try {
            const response = await fetch(`/api/integrations/facebook/campaigns?date_preset=${datePreset}&level=${level}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to load insights');
            }

            setInsights(data.insights || []);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    async function toggleStatus(id: string, currentStatus: string, type: 'campaign' | 'ad') {
        const newStatus = currentStatus === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';

        try {
            const response = await fetch('/api/integrations/facebook/status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, type, status: newStatus }),
            });

            if (response.ok) {
                loadInsights(); // Reload data
            }
        } catch (error) {
            console.error('Failed to toggle status:', error);
        }
    }

    useEffect(() => {
        loadInsights();
    }, [datePreset, level]);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(value);
    };

    const formatNumber = (value: number) => {
        return new Intl.NumberFormat('pt-BR').format(value);
    };

    const formatPercent = (value: number) => {
        return `${value.toFixed(2)}%`;
    };

    if (error && error.includes('not connected')) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold">Campanhas</h1>
                    <p className="text-muted-foreground">Visualize suas campanhas do Facebook Ads</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Conectar Facebook Ads</CardTitle>
                        <CardDescription>
                            Você precisa conectar sua conta do Facebook Ads para visualizar campanhas
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Link href="/dashboard/integrations">
                            <Button>
                                <Facebook className="h-4 w-4 mr-2" />
                                Ir para Integrações
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
                    <h1 className="text-3xl font-bold">Campanhas</h1>
                    <p className="text-muted-foreground">Performance do Facebook Ads</p>
                </div>
                <div className="flex gap-2">
                    <Select value={datePreset} onValueChange={setDatePreset}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="today">Hoje</SelectItem>
                            <SelectItem value="yesterday">Ontem</SelectItem>
                            <SelectItem value="last_7d">Últimos 7 dias</SelectItem>
                            <SelectItem value="last_30d">Últimos 30 dias</SelectItem>
                            <SelectItem value="this_month">Este mês</SelectItem>
                            <SelectItem value="last_month">Mês passado</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button onClick={loadInsights} disabled={loading} variant="outline">
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

            <Tabs value={level} onValueChange={(v) => setLevel(v as any)}>
                <TabsList>
                    <TabsTrigger value="campaign">Campanhas</TabsTrigger>
                    <TabsTrigger value="adset">Conjuntos de Anúncios</TabsTrigger>
                    <TabsTrigger value="ad">Anúncios</TabsTrigger>
                </TabsList>

                <TabsContent value={level} className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>
                                {level === 'campaign' && 'Todas as Campanhas'}
                                {level === 'adset' && 'Todos os Conjuntos'}
                                {level === 'ad' && 'Todos os Anúncios'}
                            </CardTitle>
                            <CardDescription>
                                {insights.length} {level === 'campaign' ? 'campanha(s)' : level === 'adset' ? 'conjunto(s)' : 'anúncio(s)'} encontrado(s)
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    Carregando...
                                </div>
                            ) : insights.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    Nenhum resultado encontrado
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Nome</TableHead>
                                                <TableHead className="text-right">Gasto</TableHead>
                                                <TableHead className="text-right">Impressões</TableHead>
                                                <TableHead className="text-right">Cliques</TableHead>
                                                <TableHead className="text-right">CPC</TableHead>
                                                <TableHead className="text-right">CTR</TableHead>
                                                <TableHead className="text-right">Conversões</TableHead>
                                                <TableHead className="text-right">Valor</TableHead>
                                                <TableHead className="text-right">ROAS</TableHead>
                                                <TableHead className="text-right">ROI</TableHead>
                                                <TableHead className="text-center">Ativo</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {insights.map((insight, idx) => {
                                                const name = insight.campaign_name || insight.adset_name || insight.ad_name || 'N/A';
                                                const id = insight.campaign_id || insight.adset_id || insight.ad_id || '';
                                                const isPositiveROI = (insight.roi || 0) > 0;

                                                return (
                                                    <TableRow key={idx}>
                                                        <TableCell className="font-medium max-w-xs truncate">
                                                            {name}
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            {formatCurrency(insight.spend)}
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            {formatNumber(insight.impressions)}
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            {formatNumber(insight.clicks)}
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            {formatCurrency(insight.cpc)}
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            {formatPercent(insight.ctr)}
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            {insight.purchases ? formatNumber(insight.purchases) : 'N/A'}
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            {insight.purchase_value ? formatCurrency(insight.purchase_value) : 'N/A'}
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            {insight.roas ? (
                                                                <span className={insight.roas >= 1 ? 'text-green-600' : 'text-red-600'}>
                                                                    {insight.roas.toFixed(2)}x
                                                                </span>
                                                            ) : 'N/A'}
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            {insight.roi !== undefined ? (
                                                                <div className="flex items-center justify-end gap-1">
                                                                    {isPositiveROI ? (
                                                                        <TrendingUp className="h-4 w-4 text-green-600" />
                                                                    ) : (
                                                                        <TrendingDown className="h-4 w-4 text-red-600" />
                                                                    )}
                                                                    <span className={isPositiveROI ? 'text-green-600' : 'text-red-600'}>
                                                                        {formatPercent(insight.roi)}
                                                                    </span>
                                                                </div>
                                                            ) : 'N/A'}
                                                        </TableCell>
                                                        <TableCell className="text-center">
                                                            <Switch
                                                                checked={true}
                                                                onCheckedChange={() => toggleStatus(id, 'ACTIVE', level === 'campaign' ? 'campaign' : 'ad')}
                                                            />
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
