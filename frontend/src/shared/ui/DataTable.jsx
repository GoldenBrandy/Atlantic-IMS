import { flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, useReactTable } from '@tanstack/react-table';
import { useMemo, useState } from 'react';
import { Ban } from 'lucide-react';
import { Button } from '@/shared';

const selectionColumn = {
    id: '__select',
    header: ({ table }) => (
        <input
            type="checkbox"
            aria-label="Seleccionar todas las filas"
            checked={table.getIsAllPageRowsSelected()}
            ref={(el) => {
                if (el) el.indeterminate = !table.getIsAllPageRowsSelected() && table.getIsSomePageRowsSelected();
            }}
            onChange={table.getToggleAllPageRowsSelectedHandler()}
            className="h-4 w-4 cursor-pointer"
        />
    ),
    cell: ({ row }) => (
        <input
            type="checkbox"
            aria-label="Seleccionar fila"
            checked={row.getIsSelected()}
            onChange={row.getToggleSelectedHandler()}
            className="h-4 w-4 cursor-pointer"
        />
    ),
};

// "legacy" conserva el look actual (usado por el resto de modulos todavia).
// "clean" es el rediseno mas prolijo: tarjeta blanca con sombra, encabezado
// discreto en mayusculas y filas en zebra. Se activa por tabla via prop para
// poder desplegarlo modulo por modulo sin afectar a los demas de una vez.
export default function DataTable({
    data,
    columns,
    enableSelection = false,
    onBulkDisable,
    variant = 'legacy',
}) {
    const isClean = variant === 'clean';

    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 5,
    });

    const [globalFilter, setGlobalFilter] = useState('');
    const [rowSelection, setRowSelection] = useState({});
    const [isDisabling, setIsDisabling] = useState(false);

    const tableColumns = useMemo(
        () => (enableSelection ? [selectionColumn, ...(columns ?? [])] : (columns ?? [])),
        [enableSelection, columns],
    );

    const table = useReactTable({
        data: data ?? [],
        columns: tableColumns,
        state: { globalFilter, pagination, rowSelection },
        onPaginationChange: setPagination,
        onGlobalFilterChange: setGlobalFilter,
        onRowSelectionChange: setRowSelection,
        enableRowSelection: enableSelection,
        getRowId: (row) => String(row.id),
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    });

    const selectedIds = Object.keys(rowSelection).filter((id) => rowSelection[id]);
    // Nunca debe mostrarse "de 0" mientras haya filas: si el conteo de paginas
    // aun no se recalculo, se asume al menos 1 pagina.
    const pageCount = Math.max(table.getPageCount(), 1);

    const handleBulkDisable = async () => {
        if (!onBulkDisable || selectedIds.length === 0) return;
        setIsDisabling(true);
        try {
            await onBulkDisable(selectedIds.map((id) => Number(id)));
            setRowSelection({});
        } finally {
            setIsDisabling(false);
        }
    };

    const searchInputClasses = isClean
        ? 'rounded-lg border border-neutral-300 px-3 py-2 w-64 text-sm focus:outline-none focus:border-(--primary-950) focus:ring-2 focus:ring-(--primary-950)/20'
        : 'border rounded px-3 py-2 w-64';

    const pageSizeSelectClasses = isClean
        ? 'rounded-lg border border-neutral-300 px-2 py-2 text-sm focus:outline-none focus:border-(--primary-950)'
        : 'border rounded px-2 py-2';

    // overflow-hidden recorta el fondo del thead a las esquinas redondeadas
    // del contenedor. Es seguro: DropdownContent se renderiza en un portal a
    // document.body con position fixed, no queda anidado dentro de esta caja.
    const tableWrapperClasses = isClean
        ? 'overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm'
        : 'border rounded overflow-visible';

    const theadClasses = isClean
        ? 'bg-neutral-50'
        : 'bg-gray-100';

    const thClasses = isClean
        ? 'px-4 py-3 text-left border-b border-neutral-200 text-caption font-semibold uppercase tracking-wide text-neutral-500'
        : 'p-3 text-left border-b';

    const rowClasses = isClean
        ? 'even:bg-neutral-50/70 hover:bg-(--primary-950)/5'
        : 'hover:bg-gray-50';

    const tdClasses = isClean
        ? 'px-4 py-3 border-b border-neutral-100'
        : 'p-3 border-b';

    const footerTextClasses = isClean ? 'text-sm text-neutral-500' : 'text-sm text-gray-600';

    return (
        <div className='space-y-4'>
            <div className='flex items-center justify-between gap-4'>
                <input type='text' placeholder='Buscar...' value={globalFilter ?? ""} onChange={(event) => setGlobalFilter(event.target.value)} className={searchInputClasses} />
                <select value={table.getState().pagination.pageSize} onChange={(event) => table.setPageSize(Number(event.target.value))} className={pageSizeSelectClasses}>
                    {[5, 7, 10, 20, 50].map((size) => (
                        <option key={size} value={size}>{size} filas</option>
                    ))}
                </select>
            </div>

            {enableSelection && selectedIds.length > 0 && (
                <div className="flex items-center justify-between gap-4 rounded-md border border-amber-300 bg-amber-50 px-4 py-2">
                    <span className="text-sm text-amber-800">{selectedIds.length} seleccionado(s)</span>
                    <div className="flex items-center gap-2">
                        <Button size="sm" variant="secondary" onClick={() => setRowSelection({})} disabled={isDisabling}>
                            Cancelar selección
                        </Button>
                        <Button size="sm" variant="primary" className="gap-2" onClick={handleBulkDisable} disabled={isDisabling}>
                            <Ban size={14} />
                            {isDisabling ? "Deshabilitando..." : "Deshabilitar seleccionados"}
                        </Button>
                    </div>
                </div>
            )}

            <div className={tableWrapperClasses}>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className={theadClasses}>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <tr key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <th key={header.id} className={thClasses}>
                                            {flexRender(header.column.columnDef.header, header.getContext())}
                                        </th>
                                    ))}
                                </tr>
                            ))}
                        </thead>
                        <tbody>
                            {table.getRowModel().rows.map((row) => (
                                <tr key={row.id} className={rowClasses}>
                                    {row.getVisibleCells().map((cell) => (
                                        <td key={cell.id} className={`${tdClasses} ${cell.column.id === "actions" ? "relative overflow-visible" : ""}`}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <div className="flex items-center justify-between">
                <span className={footerTextClasses}>Mostrando {table.getRowModel().rows.length} de {table.getFilteredRowModel().rows.length} registros</span>
                <div className="flex items-center gap-2">
                    <Button size="sm" variant="secondary" onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()}>Inicio</Button>

                    <Button size="sm" variant="secondary" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>Anterior</Button>

                    <span className="text-sm px-2">Pagina {table.getState().pagination.pageIndex + 1} de {pageCount}</span>

                    <Button size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>Siguiente</Button>

                    <Button size="sm" onClick={() => table.setPageIndex(pageCount - 1)} disabled={!table.getCanNextPage()}>Final</Button>
                </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
                <span>Ir a pagina:</span>
                <input type="number" defaultValue={table.getState().pagination.pageIndex + 1} onChange={(event) => { const page = event.target.value ? Number(event.target.value) - 1 : 0; table.setPageIndex(page); }} className="border rounded px-2 py-1 w-16" />
            </div>
        </div>
    );
}
