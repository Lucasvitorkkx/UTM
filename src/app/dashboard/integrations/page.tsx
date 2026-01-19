'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FacebookConnect } from '@/components/integrations/facebook-connect';
import { Facebook, Unplug } from 'lucide-react';

interface Integration {
    id: string;
    provider: string;
    accountName: string;
    createdAt: string;
}

export default function IntegrationsPage() {
    const [integrations, setIntegrations] = useState<Integration[]>([]);
    const [loading, setLoading] = useState(true);

    async function loadIntegrations() {
        try {
            const response = await fetch('/api/integrations');
            if (response.ok) {
                const data = await response.json();
                setIntegrations(data.integrations || []);
            }
        } catch (error) {
            console.error('Failed to load integrations:', error);
        } finally {
            setLoading(false);
        }
    }

    async function handleDisconnect(provider: string) {
        if (!confirm('Are you sure you want to disconnect this integration?')) {
            return;
        }

        try {
            const response = await fetch(`/api/integrations/${provider}/disconnect`, {
                method: 'DELETE',
            });

            if (response.ok) {
                loadIntegrations();
            }
        } catch (error) {
            console.error('Failed to disconnect:', error);
        }
    }

    useEffect(() => {
        loadIntegrations();
    }, []);

    const facebookIntegration = integrations.find(i => i.provider === 'facebook');

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Integrations</h1>
                <p className="text-muted-foreground">
                    Connect your marketing platforms to track performance
                </p>
            </div>

            {facebookIntegration ? (
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Facebook className="h-5 w-5 text-blue-600" />
                                <div>
                                    <CardTitle>Facebook Ads</CardTitle>
                                    <CardDescription>
                                        Connected as {facebookIntegration.accountName}
                                    </CardDescription>
                                </div>
                            </div>
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDisconnect('facebook')}
                            >
                                <Unplug className="h-4 w-4 mr-2" />
                                Disconnect
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            Connected on {new Date(facebookIntegration.createdAt).toLocaleDateString()}
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <FacebookConnect onSuccess={loadIntegrations} />
            )}
        </div>
    );
}
