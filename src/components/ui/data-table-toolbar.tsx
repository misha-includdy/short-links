"use client"

import { Cross2Icon, UpdateIcon } from "@radix-ui/react-icons"
import { Table } from "@tanstack/react-table"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface DataTableToolbarProps<TData> {
  table: Table<TData>
  onRefresh?: () => void
}

export function DataTableToolbar<TData>({
  table,
  onRefresh,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder="Filtrer les liens..."
          value={(table.getColumn("slug")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("slug")?.setFilterValue(event.target.value)
          }
          className="h-8 w-[150px] lg:w-[250px]"
        />
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3 gap-2"
          >
            <span className="hidden lg:inline">Réinitialiser</span>
            <Cross2Icon className="h-4 w-4" />
          </Button>
        )}
      </div>
      {onRefresh && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          className="h-8 px-2 lg:px-3 gap-2"
        >
          <UpdateIcon className="h-4 w-4" />
          <span className="hidden sm:inline">Actualiser</span>
        </Button>
      )}
    </div>
  )
} 