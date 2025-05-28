"use client";

import * as React from "react";
import {
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconLayoutColumns,
} from "@tabler/icons-react";
import {
  ColumnDef,
  ColumnFiltersState,
  Row,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useState, useEffect } from "react";

import { useIsMobile } from "@/lib/use-mobile";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ZodType } from "zod";
import { AlertDelete } from "./alerts";
import { Loader2, Search, Trash2, XIcon } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Tipo para os campos do formulário no drawer
export type FormField = {
  name: string;
  label?: string;
  type: "text" | "number" | "select" | "custom";
  options?: { value: string; label: string }[];
  customRender?: (
    value: any,
    onChange: (value: any) => void,
    data?: any
  ) => React.ReactNode;
  colSpan?: number;
  // Novas props
  isEditable?: (value: any) => any;
  parseValue?: (value: any) => any; // Conversão ao carregar
  formatValue?: (value: any) => any; // Conversão ao salvar
  defaultValue?: (value: any) => any; // Conversão ao salvar
};

// Configuração para o drawer
export type DrawerConfig<TData, TUpdate extends Record<string, any>> = {
  title: (item: TData) => any;
  description?: (item: TData) => any;
  fields: FormField[];
  updateSchema?: ZodType<TUpdate>;
  mutate?: any;
};
// Props para o componente DataTable
export type DataTableProps<
  TData extends Record<string, any>,
  TUpdate extends Record<string, any>
> = {
  data: TData[];
  columns: ColumnDef<TData, any>[];
  title?: string;
  primaryField?: string;
  drawerConfig?: DrawerConfig<TData, TUpdate>;
  updateSchema?: ZodType<TUpdate>;
  onUpdate?: (original: TData, updated: TUpdate) => Promise<void> | void;
  onCreate?: (newItem: TData) => Promise<void> | void;
  onDelete?: (item: TData) => Promise<void> | void;
  pageSize?: number;
  totalCount?: number;
  fetchData?: (
    page: number,
    pageSize: number
  ) => Promise<{ data: TData[]; totalCount: number }>;
  apiEndpoint?: string;
  currentPage?: number;
  onPaginationChange?: (p: { pageIndex: number; pageSize: number }) => void;
  saveButtonText?: React.ReactNode;
  savingButtonText?: React.ReactNode;
  mutate?: () => void;
};

function TableRowWithDrawer<TData, TUpdate extends Record<string, any>>({
  row,
  drawerConfig,
  onUpdate,
  onDelete,
  saveButtonText = "Salvar",
  savingButtonText = "Salvando...",
  mutate,
}: {
  row: Row<TData>;
  drawerConfig?: DrawerConfig<TData, TUpdate>;
  onUpdate?: (original: TData, updated: TUpdate) => Promise<void> | void;
  onDelete?: (item: TData) => Promise<void> | void;
  saveButtonText?: React.ReactNode;
  savingButtonText?: React.ReactNode;
  mutate?: () => void;
}) {
  const isMobile = useIsMobile();
  const item = row.original;
  const [formData, setFormData] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  function getNested(obj: any, path: string) {
    return path.split(".").reduce((o, k) => o?.[k], obj);
  }

  function setNested(obj: any, path: string, value: any) {
    const keys = path.split(".");
    const last = keys.pop()!;
    const target = keys.reduce((o, k) => {
      if (o[k] == null) o[k] = {};
      return o[k];
    }, obj as any);
    target[last] = value;
  }

  // Initialize form data when drawer opens or when item changes
  useEffect(() => {
    if (!drawerConfig || !isDrawerOpen) return;

    const initial: any = {};

    drawerConfig.fields.forEach((f) => {
      // Get value using defaultValue function or direct nested access
      const raw = f.defaultValue
        ? f.defaultValue(item)
        : getNested(item, f.name);

      // Apply parseValue if provided
      const parsedValue = f.parseValue ? f.parseValue(raw) : raw;


      // Set the value in our form data object
      setNested(initial, f.name, parsedValue);
    });


    setFormData(initial);
  }, [item, drawerConfig, isDrawerOpen]);

  const handleChange = (name: string, val: any) => {

    const updated = { ...formData };
    setNested(updated, name, val);
    setFormData(updated);
  };

  const handleSave = async () => {
    if (!onUpdate || !drawerConfig) return;

    // Ensure we have an updateSchema before validating
    if (!drawerConfig.updateSchema) {
      console.warn("No updateSchema defined in drawerConfig");
      return;
    }

    setIsLoading(true);
    try {
      // Create the raw object, applying formatValue transformations
      const raw: any = {};

      // Process each field
      drawerConfig.fields.forEach((f) => {
        const currentValue = getNested(formData, f.name);
        const formattedValue = f.formatValue
          ? f.formatValue(currentValue)
          : currentValue;
        setNested(raw, f.name, formattedValue);
      });


      // Validate with schema
      const validated: TUpdate = drawerConfig.updateSchema.parse(raw);


      // Call update handler
      await onUpdate(item, validated);
      mutate?.();
    } catch (e) {
      console.error("Error saving form:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!onDelete) return;
    try {
      await onDelete(item);
      setDeleteDialogOpen(false);
      mutate?.();
    } catch (e) {
      console.error(e);
    }
  };

  if (!drawerConfig) {
    return (
      <TableRow>
        {row.getVisibleCells().map((cell) => (
          <TableCell key={cell.id}>
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </TableCell>
        ))}
      </TableRow>
    );
  }

  return (
    <>
      <Drawer
        direction={isMobile ? "bottom" : "right"}
        open={isDrawerOpen}
        onOpenChange={(open) => {
          setIsDrawerOpen(open);
          // Reset form data when drawer closes
          if (!open) {
            setFormData({});
          }
        }}
      >
        <DrawerTrigger asChild>
          <TableRow className="cursor-pointer hover:bg-muted/50">
            {row.getVisibleCells().map((cell) => (
              <TableCell key={cell.id}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </TableCell>
            ))}
          </TableRow>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <div className="flex w-full items-center justify-between">
              <div>
                <DrawerTitle>{drawerConfig.title(item)}</DrawerTitle>
                {drawerConfig.description && (
                  <DrawerDescription asChild>
                    {drawerConfig.description(item)}
                  </DrawerDescription>
                )}
              </div>
              <div className="space-x-2">
                {onDelete && (
                  <Button
                    variant="destructive"
                    onClick={() => setDeleteDialogOpen(true)}
                    className="cursor-pointer"
                  >
                    <Trash2 />
                  </Button>
                )}
                <DrawerClose asChild>
                  <Button variant="outline" className="">
                    <XIcon />
                  </Button>
                </DrawerClose>
              </div>
            </div>
          </DrawerHeader>
          <div className="p-4">
            <div className="grid grid-cols-2 gap-1 space-x-3">
              {drawerConfig.fields.map((f) => {
                // Get current value from formData, with fallbacks
                const curr =
                  getNested(formData, f.name) ??
                  (f.type === "number" ? 0 : f.type === "select" ? "" : "");


                return (
                  <div
                    key={f.name}
                    className={`mb-4 ${
                      f.colSpan === 2 ? "col-span-2 space-y-2" : "space-y-2"
                    }`}
                  >
                    <Label htmlFor={f.name}>{f.label}</Label>
                    {f.type === "text" && (
                      <Input
                        id={f.name}
                        value={curr || ""}
                        onChange={(e) => handleChange(f.name, e.target.value)}
                        disabled={isLoading}
                        className="mt-1"
                      />
                    )}
                    {f.type === "number" && (
                      <Input
                        id={f.name}
                        type="number"
                        value={curr}
                        disabled={isLoading}
                        onChange={(e) =>
                          handleChange(f.name, parseFloat(e.target.value) || 0)
                        }
                        className="mt-1"
                      />
                    )}
                    {f.type === "select" && f.options && (
                      <Select
                        value={String(curr || "")}
                        onValueChange={(v) => handleChange(f.name, v)}
                        disabled={isLoading}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          {f.options.map((opt) => (
                            <SelectItem
                              key={opt.value}
                              value={String(opt.value)}
                            >
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    {f.type === "custom" &&
                      f.customRender?.(curr, (v) => handleChange(f.name, v))}
                  </div>
                );
              })}
            </div>
          </div>
          <DrawerFooter className="sticky bottom-0 bg-background border-t z-10">
            <div className="flex gap-2 w-full justify-end">
              <Button
                onClick={handleSave}
                disabled={isLoading}
                className="bg-[#FF8F3F] text-white w-full"
                variant="outline"
              >
                {isLoading ? savingButtonText : saveButtonText}
              </Button>
            </div>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
      <AlertDelete
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        trigger={<Button variant="destructive">Excluir</Button>}
      />
    </>
  );
}

export function DataTable<
  TData extends Record<string, any>,
  TUpdate extends Record<string, any>
>({
  data: initialData,
  columns,
  title = "Dados",
  primaryField,
  drawerConfig,
  onUpdate,
  onDelete,
  mutate,
  saveButtonText,
  savingButtonText,
  pageSize = 10,
  totalCount: initialTotalCount = 0,
  fetchData,
  apiEndpoint,
  currentPage = 0,
  onPaginationChange, // Adicione esta prop
}: DataTableProps<TData, TUpdate>) {
  const [data, setData] = useState<TData[]>(() => initialData);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState({
    pageIndex: currentPage,
    pageSize,
  });
  const [totalCount, setTotalCount] = useState(initialTotalCount);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Modificar o loadDataFromApi para garantir que está pegando os dados corretamente
  const loadDataFromApi = async (
    page: number,
    pageSize: number,
    search?: string
  ) => {
    if (!apiEndpoint && !fetchData) return;

    setIsLoading(true);
    try {
      let result;

      if (fetchData) {

        result = await fetchData(page, pageSize); // Mantenha 0-based index se já for usado no fetchData
      
      
      } else if (apiEndpoint) {
        const url = new URL(`${API_URL}${apiEndpoint}`);
        url.searchParams.append("page", String(page + 1)); // 1-based para backend
        url.searchParams.append("page_size", String(pageSize));

        if (search) {
          url.searchParams.append("search", search);
        }

        const response = await fetch(url.toString());
        const responseData = await response.json();

        result = {
          data: responseData.results || responseData.data || [],
          totalCount: responseData.count || responseData.total_count || 0,
        };
      }

      if (result) {
        
        setData(result.data);
        setTotalCount(result.totalCount);
        // Atualiza o pageCount da tabela
        table.setPageCount(Math.ceil(result.totalCount / pageSize));
      }
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Modificar o useEffect para manipular a paginação corretamente
  // In DataTable component, modify this useEffect
  useEffect(() => {
    if (apiEndpoint || fetchData) {
      loadDataFromApi(pagination.pageIndex, pagination.pageSize, searchTerm);
    } else {
      // Case not using API, update data directly
      setData(initialData);
      setTotalCount(initialTotalCount);
    }
  }, [
    pagination.pageIndex,
    pagination.pageSize,
    apiEndpoint,
    fetchData,
    initialData,
    initialTotalCount,
  ]);

  // Atualizar useEffect para lidar com mudanças nos dados iniciais
  useEffect(() => {
    // Atualiza os dados se o initialData mudar
    setData(initialData);
    setTotalCount(initialTotalCount);

    // Atualiza o pageCount da tabela
    const pageCount = Math.ceil(initialTotalCount / pagination.pageSize);
    if (table && pageCount > 0) {
      table.setPageCount(pageCount);
    }


  }, [initialData, initialTotalCount]);

  // Atualize a configuração da tabela
  const table = useReactTable({
    data,
    columns,
    pageCount: Math.ceil(totalCount / pagination.pageSize),
    state: {
      globalFilter: searchTerm,
      sorting,
      columnVisibility,
      columnFilters,
      pagination,
    },
    onGlobalFilterChange: setSearchTerm,
    manualPagination: true,
    getFilteredRowModel: getFilteredRowModel(), // coluna e global
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: (updater) => {
      // This function is called when pagination is changed by the table
      const newPagination =
        typeof updater === "function" ? updater(pagination) : updater;
      setPagination(newPagination);

      // Only call this ONCE when the user explicitly changes pagination
      // Not on every effect run
      if (
        onPaginationChange &&
        (pagination.pageIndex !== newPagination.pageIndex ||
          pagination.pageSize !== newPagination.pageSize)
      ) {
        onPaginationChange(newPagination);
      }
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  // Determine qual coluna usar para o filtro de pesquisa
  const searchColumn = primaryField
    ? table.getColumn(primaryField)
    : table
        .getAllColumns()
        .find(
          (col) =>
            col.id === "Nome" ||
            col.id === "Razão Social" ||
            col.id === "Cliente" ||
            col.id === "id" ||
            col.id === "brand_name" ||
            col.id === "email" ||
            col.id === "order_number"
        );

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between px-4 lg:px-6 pb-4">
        <div className="flex gap-2 items-end justify-center w-full">
          <div className="flex items-center justify-between w-full">
            <h1 className="text-2xl font-bold">{title}</h1>
          </div>
          <div className="flex items-center gap-2">
            {searchColumn && (
              <div className="relative flex items-center">
                {/* Ícone absolutamente posicionado */}
                <Search className="absolute left-4 text-gray-400 pointer-events-none w-4 h-4" />

                {/* Input com padding-left para não ficar em cima do ícone */}
                <Input
                  placeholder="Procurar..."
                  value={searchTerm}
                  onChange={(e) => {
                    const v = e.target.value;
                    setSearchTerm(v);
                    table.setGlobalFilter(v);
                  }}
                  className="w-[100px] md:w-[200px] lg:w-[300px] pl-10"
                />
              </div>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <IconLayoutColumns className="h-4 w-4 mr-2" />
                  <span className="hidden lg:inline">Filtrar colunas</span>
                  <span className="lg:hidden">Colunas</span>
                  <IconChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {table
                  .getAllColumns()
                  .filter(
                    (column) =>
                      typeof column.accessorFn !== "undefined" &&
                      column.getCanHide()
                  )
                  .map((column) => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) =>
                          column.toggleVisibility(!!value)
                        }
                      >
                        {column.id}
                      </DropdownMenuCheckboxItem>
                    );
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
      <div className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6">
        <div className="overflow-hidden rounded-lg border">
          {isLoading && (
            <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          )}
          <Table>
            <TableHeader className="bg-muted sticky top-0 z-10">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id} colSpan={header.colSpan}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table
                  .getRowModel()
                  .rows.map((row) => (
                    <TableRowWithDrawer<TData, TUpdate>
                      key={row.id}
                      row={row}
                      drawerConfig={drawerConfig}
                      onUpdate={onUpdate}
                      onDelete={onDelete}
                      saveButtonText={saveButtonText}
                      savingButtonText={savingButtonText}
                      mutate={mutate}
                    />
                  ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="animate-spin h-4 w-4 mr-2" />
                        Carregando...
                      </>
                    ) : (
                      "Nenhum item encontrado."
                    )}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-between px-4">
          <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
            {apiEndpoint || fetchData
              ? `Mostrando ${Math.min(
                  pagination.pageIndex * pagination.pageSize + 1,
                  totalCount
                )} - ${Math.min(
                  (pagination.pageIndex + 1) * pagination.pageSize,
                  totalCount
                )} de ${totalCount} item(ns).`
              : `Mostrando ${
                  table.getFilteredRowModel().rows.length
                } item(ns).`}
          </div>
          <div className="flex w-full items-center gap-8 lg:w-fit">
            <div className="hidden items-center gap-2 lg:flex">
              <Label htmlFor="rows-per-page" className="text-sm font-medium">
                Linhas por página
              </Label>
              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value) => {
                  table.setPageSize(Number(value));
                }}
              >
                <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                  <SelectValue
                    placeholder={table.getState().pagination.pageSize}
                  />
                </SelectTrigger>
                <SelectContent side="top">
                  {[10, 20, 30, 40, 50, 100].map((pageSizeOption) => (
                    <SelectItem
                      key={pageSizeOption}
                      value={`${pageSizeOption}`}
                    >
                      {pageSizeOption}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex w-fit items-center justify-center text-sm font-medium">
              Página {table.getState().pagination.pageIndex + 1} de{" "}
              {table.getPageCount() || 1}
            </div>
            <div className="ml-auto flex items-center gap-2 lg:ml-0">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage() || isLoading}
              >
                <span className="sr-only">Ir para a primeira página</span>
                <IconChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage() || isLoading}
              >
                <span className="sr-only">Ir para a página anterior</span>
                <IconChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage() || isLoading}
              >
                <span className="sr-only">Ir para a próxima página</span>
                <IconChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="hidden size-8 lg:flex"
                size="icon"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage() || isLoading}
              >
                <span className="sr-only">Ir para a última página</span>
                <IconChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
