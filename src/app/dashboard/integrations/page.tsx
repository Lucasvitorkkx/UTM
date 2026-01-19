'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Facebook, Unplug, CheckCircle, XCircle } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

interface Integration {
    id: string;
    provider: string;
    accountName: string;
    createdAt: string;
}

export default function IntegrationsPage() {
    const [integrations, setIntegrations] = useState<Integration[]>([]);
    const [loading, setLoading] = useState(true);
    const searchParams = useSearchParams();
    const success = searchParams.get('success');
    const error = searchParams.get('error');

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
        if (!confirm('Tem certeza que deseja desconectar esta integração?')) {
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

    function handleFacebookLogin() {
        window.location.href = '/api/auth/facebook/login';
    }

    useEffect(() => {
        loadIntegrations();
    }, []);

    const facebookIntegration = integrations.find(i => i.provider === 'facebook');

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Integrações</h1>
                <p className="text-muted-foreground">
                    Conecte suas plataformas de marketing para rastrear performance
                </p>
            </div>

            {success && (
                <Card className="border-green-500 bg-green-50">
                    <CardContent className="pt-6 flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <p className="text-green-600 font-medium">Facebook conectado com sucesso!</p>
                    </CardContent>
                </Card>
            )}

            {error && (
                <Card className="border-red-500 bg-red-50">
                    <CardContent className="pt-6 flex items-center gap-2">
                        <XCircle className="h-5 w-5 text-red-600" />
                        <p className="text-red-600 font-medium">
                            {error === 'no_code' && 'Código de autorização não recebido'}
                            {error === 'auth_failed' && 'Falha na autenticação com Facebook'}
                            {!['no_code', 'auth_failed'].includes(error) && 'Erro ao conectar Facebook'}
                        </p>
                    </CardContent>
                </Card>
            )}

            {facebookIntegration ? (
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Facebook className="h-5 w-5 text-blue-600" />
                                <div>
                                    <CardTitle>Facebook Ads</CardTitle>
                                    <CardDescription>
                                        Conectado como {facebookIntegration.accountName}
                                    </CardDescription>
                                </div>
                            </div>
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDisconnect('facebook')}
                            >
                                <Unplug className="h-4 w-4 mr-2" />
                                Desconectar
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            Conectado em {new Date(facebookIntegration.createdAt).toLocaleDateString('pt-BR')}
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Facebook className="h-5 w-5 text-blue-600" />
                            <CardTitle>Conectar Facebook Ads</CardTitle>
                        </div>
                        <CardDescription>
                            Conecte sua conta do Facebook Ads para visualizar performance de campanhas
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button onClick={handleFacebookLogin} className="w-full bg-blue-600 hover:bg-blue-700">
                            <Facebook className="h-4 w-4 mr-2" />
                            Conectar com Facebook
                        </Button>
                        <p className="text-xs text-muted-foreground mt-4">
                            Ao conectar, você autoriza o TrackFlux a acessar seus dados de anúncios do Facebook
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
