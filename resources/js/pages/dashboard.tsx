import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';

export default function Dashboard() {
    return (
        <AppLayout>
            <Head title="Dashboard" />
            <div className="mx-auto max-w-4xl">
                <h1 className="mb-6 text-2xl font-bold">Dashboard</h1>
                <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-xl border border-border p-6">
                        <h3 className="mb-2 text-sm font-medium text-muted-foreground">Conversations</h3>
                        <p className="text-3xl font-bold">0</p>
                    </div>
                    <div className="rounded-xl border border-border p-6">
                        <h3 className="mb-2 text-sm font-medium text-muted-foreground">Messages</h3>
                        <p className="text-3xl font-bold">0</p>
                    </div>
                    <div className="rounded-xl border border-border p-6">
                        <h3 className="mb-2 text-sm font-medium text-muted-foreground">Model</h3>
                        <p className="text-lg font-semibold">Claude Sonnet</p>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
