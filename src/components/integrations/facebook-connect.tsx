'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Facebook } from 'lucide-react';

interface FacebookConnectProps {
    onSuccess?: () => void;
}

export function FacebookConnect({ onSuccess }: FacebookConnectProps) {
    const [accessToken, setAccessToken] = useState('');
    const [accountId, setAccountId] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    async function handleConnect() {
        setLoading(true);
        setError('');
        setSuccess(false);

        try {
            const response = await fetch('/api/integrations/facebook/connect', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ accessToken, accountId }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to connect');
            }

            setSuccess(true);
            setAccessToken('');
            setAccountId('');
            onSuccess?.();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-2">
                    <Facebook className="h-5 w-5 text-blue-600" />
                    <CardTitle>Connect Facebook Ads</CardTitle>
                </div>
                <CardDescription>
                    Connect your Facebook Ads account to view campaign performance
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="accessToken">Access Token</Label>
                    <Input
                        id="accessToken"
                        type="password"
                        placeholder="Enter your Facebook access token"
                        value={accessToken}
                        onChange={(e) => setAccessToken(e.target.value)}
                        disabled={loading}
                    />
                    <p className="text-xs text-muted-foreground">
                        Get your token from{' '}
                        <a
                            href="https://developers.facebook.com/tools/explorer/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                        >
                            Facebook Graph API Explorer
                        </a>
                    </p>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="accountId">Ad Account ID (Optional)</Label>
                    <Input
                        id="accountId"
                        placeholder="act_123456789"
                        value={accountId}
                        onChange={(e) => setAccountId(e.target.value)}
                        disabled={loading}
                    />
                    <p className="text-xs text-muted-foreground">
                        Find your Ad Account ID in Facebook Ads Manager
                    </p>
                </div>

                {error && (
                    <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="text-sm text-green-600 bg-green-50 p-3 rounded-md">
                        Facebook account connected successfully!
                    </div>
                )}

                <Button
                    onClick={handleConnect}
                    disabled={!accessToken || loading}
                    className="w-full"
                >
                    {loading ? 'Connecting...' : 'Connect Facebook'}
                </Button>
            </CardContent>
        </Card>
    );
}
