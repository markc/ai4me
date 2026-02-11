import { Head, Link, usePage } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/data-table/data-table';
import { columns, type User } from './columns';

type UsersPageProps = {
    users: User[];
};

export default function UsersPage() {
    const { users } = usePage<{ props: UsersPageProps }>().props as unknown as UsersPageProps;

    return (
        <>
            <Head title="Users" />
            <div className="space-y-4">
                <h1 className="text-2xl font-bold tracking-tight">Users</h1>
                <DataTable
                    columns={columns}
                    data={users}
                    searchKey="name"
                    searchPlaceholder="Search by name..."
                    actionSlot={
                        <Button size="sm" className="h-8" asChild>
                            <Link href="/users/create">
                                <Plus className="mr-1.5 size-4" />
                                Add User
                            </Link>
                        </Button>
                    }
                />
            </div>
        </>
    );
}
