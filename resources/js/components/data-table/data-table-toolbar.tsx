import type { Table } from '@tanstack/react-table';
import type { ReactNode } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface DataTableToolbarProps<TData> {
    table: Table<TData>;
    searchKey?: string;
    searchPlaceholder?: string;
    actionSlot?: ReactNode;
}

export function DataTableToolbar<TData>({
    table,
    searchKey,
    searchPlaceholder,
    actionSlot,
}: DataTableToolbarProps<TData>) {
    const isFiltered = table.getState().columnFilters.length > 0;
    const searchColumn = searchKey ? table.getColumn(searchKey) : null;

    return (
        <div className="flex items-center justify-between pb-4">
            <div className="flex flex-1 items-center gap-2">
                {searchColumn && (
                    <Input
                        placeholder={searchPlaceholder ?? `Filter ${searchKey}...`}
                        value={(searchColumn.getFilterValue() as string) ?? ''}
                        onChange={(e) => searchColumn.setFilterValue(e.target.value)}
                        className="h-8 w-[250px]"
                    />
                )}
                {isFiltered && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => table.resetColumnFilters()}
                        className="h-8 px-2 lg:px-3"
                    >
                        Reset
                        <X className="ml-2 size-4" />
                    </Button>
                )}
            </div>
            {actionSlot}
        </div>
    );
}
