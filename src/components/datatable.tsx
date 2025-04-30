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

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Tipo para os campos do formulário no drawer
export type FormField = {
  name: string;
  label: string;
  type: "text" | "number" | "select" | "custom";
  options?: { value: string; label: string }[];
  customRender?: (
    value: any,
    onChange: (value: any) => void
  ) => React.ReactNode;
  colSpan?: number;
  // Novas props
  parseValue?: (value: any) => any; // Conversão ao carregar
  formatValue?: (value: any) => any; // Conversão ao salvar
};

// Configuração para o drawer
export type DrawerConfig<TData, TUpdate extends Record<string, any>> = {
  title: (item: TData) => string;
  description?: (item: TData) => string;
  fields: FormField[];
  updateSchema: ZodType<TUpdate>;
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
  updateSchema: ZodType<TUpdate>;
  onUpdate?: (
    originalItem: TData,
    updatedItem: TUpdate
  ) => Promise<void> | void;
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
  // Adicionar esta prop para propagar alterações de paginação
  onPaginationChange?: (pagination: {
    pageIndex: number;
    pageSize: number;
  }) => void;
};

function TableRowWithDrawer<TData, TUpdate extends Record<string, any>>({
  row,
  drawerConfig,
  onUpdate,
}: {
  row: Row<TData>;
  drawerConfig?: DrawerConfig<TData, TUpdate>;
  onUpdate?: (
    originalItem: TData,
    updatedItem: TUpdate
  ) => Promise<void> | void;
}) {
  const isMobile = useIsMobile();
  const item = row.original;
  const [formData, setFormData] = useState<TData>({ ...item });
  const [isLoading, setIsLoading] = useState(false);

  if (!drawerConfig) {
    // Se não houver configuração de drawer, apenas renderizar a linha
    return (
      <TableRow data-state={row.getIsSelected() && "selected"}>
        {row.getVisibleCells().map((cell) => (
          <TableCell key={cell.id}>
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </TableCell>
        ))}
      </TableRow>
    );
  }

  const handleChange = (fieldName: string, value: any) => {
    const newData = { ...formData };
    setNested(newData, fieldName, value);
    setFormData(newData);
  };

  // pega um valor deep (ex.: "contact.name")
  function getNested(obj: any, path: string) {
    return path.split(".").reduce((o, key) => o?.[key], obj);
  }

  // atribui valor deep (ex.: obj.contact.name = value)
  function setNested(obj: any, path: string, value: any) {
    const keys = path.split(".");
    const last = keys.pop()!;
    const target = keys.reduce((o, key) => {
      if (o[key] == null) o[key] = {}; // garante a existência do objeto
      return o[key];
    }, obj as any);
    target[last] = value;
  }

  // Modifique a inicialização do formData
  useEffect(() => {
    // começa vazio
    const initialData: any = {};
    drawerConfig.fields.forEach((field) => {
      // lê cada valor aninhado (usando getNested, ou simplesmente item[field.name] se for flat)
      const val = getNested(item, field.name);
      // aplica parseValue se houver
      const parsed = field.parseValue ? field.parseValue(val) : val;
      setNested(initialData, field.name, parsed);
    });
    setFormData(initialData);
  }, [item]);

  const handleSave = async () => {
    if (!onUpdate || !drawerConfig) return;
    setIsLoading(true);
    try {
      // Clone raso e aplicar formatValue
      const raw: any = { ...formData };
      drawerConfig.fields.forEach((field) => {
        if (field.formatValue) {
          raw[field.name] = field.formatValue(getNested(formData, field.name));
        }
      });
      // Valida e STRIPA chaves extras
      const toSend = drawerConfig.updateSchema.parse(raw);
      await onUpdate(item, toSend);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Drawer direction={isMobile ? "bottom" : "right"}>
      <DrawerTrigger asChild>
        <TableRow
          data-state={row.getIsSelected() && "selected"}
          className="cursor-pointer hover:bg-muted/50"
        >
          {row.getVisibleCells().map((cell) => (
            <TableCell key={cell.id}>
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </TableCell>
          ))}
        </TableRow>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="gap-1">
          <DrawerTitle>{drawerConfig.title(item)}</DrawerTitle>
          {drawerConfig.description && (
            <DrawerDescription>
              {drawerConfig.description(item)}
            </DrawerDescription>
          )}
        </DrawerHeader>
        <div className="flex flex-col gap-4 overflow-y-auto px-4 text-sm">
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              {drawerConfig.fields.map((field) => {
                // pega o valor aninhado ou fallback
                const current =
                  getNested(formData, field.name) ??
                  (field.type === "number" ? 0 : "");

                return (
                  <div
                    key={field.name}
                    className={`flex flex-col gap-3 ${
                      field.colSpan === 2 ? "col-span-2" : ""
                    }`}
                  >
                    <Label htmlFor={field.name}>{field.label}</Label>

                    {field.type === "text" && (
                      <Input
                        id={field.name}
                        name={field.name}
                        value={current as string}
                        onChange={(e) =>
                          handleChange(field.name, e.target.value)
                        }
                      />
                    )}

                    {field.type === "number" && (
                      <Input
                        id={field.name}
                        name={field.name}
                        type="number"
                        step="0.01"
                        value={current as number}
                        onChange={(e) => {
                          const v = e.target.value;
                          handleChange(
                            field.name,
                            v === "" ? 0 : parseFloat(v)
                          );
                        }}
                      />
                    )}

                    {field.type === "select" && field.options && (
                      <Select
                        value={String(current)}
                        onValueChange={(v) => handleChange(field.name, v)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          {field.options.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}

                    {field.type === "custom" &&
                      field.customRender &&
                      field.customRender(current, (v) =>
                        handleChange(field.name, v)
                      )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <DrawerFooter>
          <Button
            onClick={handleSave}
            className="bg-[#FF8F3F] text-primary-foreground"
            disabled={isLoading}
          >
            {isLoading ? "Salvando..." : "Salvar alterações"}
          </Button>
          <DrawerClose asChild>
            <Button variant="outline">Fechar</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
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
        console.log(
          "Calling fetchData with page:",
          page,
          "pageSize:",
          pageSize
        );
        result = await fetchData(page, pageSize); // Mantenha 0-based index se já for usado no fetchData
        console.log("Data received from fetchData:", result);
      } else if (apiEndpoint) {
        const url = new URL(`${API_URL}${apiEndpoint}`);
        url.searchParams.append("page", String(page + 1)); // 1-based para backend
        url.searchParams.append("page_size", String(pageSize));

        if (search) {
          url.searchParams.append("search", search);
        }

        const response = await fetch(url.toString());
        const responseData = await response.json();
        console.log("API response:", responseData);

        result = {
          data: responseData.results || responseData.data || [],
          totalCount: responseData.count || responseData.total_count || 0,
        };
      }

      if (result) {
        console.log("Setting data:", result.data);
        console.log("Setting totalCount:", result.totalCount);
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
    // REMOVE this call from here:
    // if (onPaginationChange) {
    //   onPaginationChange(pagination);
    // }
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

    console.log("Initial data updated:", initialData);
    console.log("Initial totalCount updated:", initialTotalCount);
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

      console.log("Pagination updated to:", newPagination);
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
            col.id === "company_name" ||
            col.id === "Cliente" ||
            col.id === "id"
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
              <Input
                placeholder={`Procurar por ${searchColumn.id}...`}
                value={searchTerm}
                onChange={(e) => {
                  const v = e.target.value;
                  setSearchTerm(v);
                  table.setGlobalFilter(v);
                }}
                className="w-[100px] md:w-[200px] lg:w-[300px]"
              />
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
                    />
                  ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    {isLoading ? "Carregando..." : "Nenhum item encontrado."}
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
