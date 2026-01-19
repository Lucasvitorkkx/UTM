'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
    LayoutDashboard,
    Link as LinkIcon,
    BarChart3,
    Settings,
    CreditCard,
    LogOut,
    Facebook,
    Plug,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Links', href: '/dashboard/links', icon: LinkIcon },
    { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
    { name: 'Campaigns', href: '/dashboard/campaigns', icon: Facebook },
    { name: 'Integrations', href: '/dashboard/integrations', icon: Plug },
    { name: 'Billing', href: '/dashboard/billing', icon: CreditCard },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <div className="flex h-full flex-col border-r bg-card">
            <div className="flex h-16 items-center px-6 border-b">
                <Link href="/dashboard" className="flex items-center gap-2 font-bold text-xl">
                    <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
                        TF
                    </div>
                    TrackFlux
                </Link>
            </div>
            <div className="flex-1 overflow-auto py-4">
                <nav className="grid gap-1 px-4">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                                    isActive
                                        ? "bg-primary text-primary-foreground"
                                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                )}
                            >
                                <item.icon className="h-4 w-4" />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>
            </div>
            <div className="p-4 border-t">
                <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground">
                    <LogOut className="h-4 w-4" />
                    Log out
                </Button>
            </div>
        </div>
    );
}
