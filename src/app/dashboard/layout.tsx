import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { verifySession } from '@/lib/auth';

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    await verifySession();

    return (
        <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50">
            <div className="hidden h-full md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col">
                <Sidebar />
            </div>
            <div className="md:pl-64 flex flex-col min-h-screen">
                <Header />
                <main className="flex-1 p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
