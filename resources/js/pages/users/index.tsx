import { DataTable } from '@/components/data-table/data-table';
import { columns, type User } from './columns';
import { Head, usePage } from '@inertiajs/react';

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
                />
            </div>
        </>
    );
}
