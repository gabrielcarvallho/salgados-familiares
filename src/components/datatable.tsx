"use client";

import * as React from "react";
import {
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconLayoutColumns,
  IconGripVertical,
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
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  TouchSensor,
  MouseSensor,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

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
import { Loader2, Search, Trash2, XIcon, Save, RotateCcw } from "lucide-react";

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
  onSaveOrder?: (tableOrder?: TData[]) => Promise<void> | void; // Nova prop para salvar ordem
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
  enableDragAndDrop?: boolean; // Flag para habilitar DnD
  dragHandle?: boolean; // Se deve mostrar handle de drag
};

// Componente SortableRow para drag and drop
function SortableTableRow<TData, TUpdate extends Record<string, any>>({
  row,
  drawerConfig,
  onUpdate,
  onDelete,
  saveButtonText = "Salvar",
  savingButtonText = "Salvando...",
  mutate,
  dragHandle = true,
}: {
  row: Row<TData>;
  drawerConfig?: DrawerConfig<TData, TUpdate>;
  onUpdate?: (original: TData, updated: TUpdate) => Promise<void> | void;
  onDelete?: (item: TData) => Promise<void> | void;
  saveButtonText?: React.ReactNode;
  savingButtonText?: React.ReactNode;
  mutate?: () => void;
  dragHandle?: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: row.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <TableRowWithDrawer
      ref={setNodeRef}
      style={style}
      row={row}
      drawerConfig={drawerConfig}
      onUpdate={onUpdate}
      onDelete={onDelete}
      saveButtonText={saveButtonText}
      savingButtonText={savingButtonText}
      mutate={mutate}
      dragHandle={dragHandle}
      dragAttributes={attributes}
      dragListeners={listeners}
    />
  );
}

function TableRowWithDrawer<TData, TUpdate extends Record<string, any>>({
  row,
  drawerConfig,
  onUpdate,
  onDelete,
  saveButtonText = "Salvar",
  savingButtonText = "Salvando...",
  mutate,
  dragHandle = false,
  dragAttributes,
  dragListeners,
  style,
  ...props
}: {
  row: Row<TData>;
  drawerConfig?: DrawerConfig<TData, TUpdate>;
  onUpdate?: (original: TData, updated: TUpdate) => Promise<void> | void;
  onDelete?: (item: TData) => Promise<void> | void;
  saveButtonText?: React.ReactNode;
  savingButtonText?: React.ReactNode;
  mutate?: () => void;
  dragHandle?: boolean;
  dragAttributes?: any;
  dragListeners?: any;
  style?: React.CSSProperties;
} & React.ComponentProps<typeof TableRow>) {
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
      <TableRow className="relative" style={style} {...props}>
        {/* Células normais, com drag handle na primeira célula */}
        {row.getVisibleCells().map((cell, index) => (
          <TableCell
            key={cell.id}
            className={`${dragHandle && index === 0 ? "relative" : ""}`}
          >
            {/* Drag handle dentro da primeira célula */}
            {dragHandle && index === 0 && (
              <div
                className="absolute left-2 top-1/2 transform -translate-y-1/2 cursor-grab hover:cursor-grabbing p-1 z-10 bg-white/80 rounded"
                {...dragAttributes}
                {...dragListeners}
                onClick={(e) => e.stopPropagation()}
              >
                <IconGripVertical className="h-4 w-4 text-gray-400" />
              </div>
            )}

            {/* Conteúdo da célula com padding se tiver drag handle */}
            <div className={dragHandle && index === 0 ? "pl-8" : ""}>
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </div>
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
          if (!open) {
            setFormData({});
          }
        }}
      >
        <DrawerTrigger asChild>
          <TableRow
            className="relative cursor-pointer hover:bg-muted/50"
            style={style}
            {...props}
          >
            {/* Células normais, com drag handle na primeira célula */}
            {row.getVisibleCells().map((cell, index) => (
              <TableCell
                key={cell.id}
                className={`${dragHandle && index === 0 ? "relative" : ""}`}
              >
                {/* Drag handle dentro da primeira célula */}
                {dragHandle && index === 0 && (
                  <div
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 cursor-grab hover:cursor-grabbing p-1 z-10 bg-white/80 rounded"
                    {...dragAttributes}
                    {...dragListeners}
                    onClick={(e) => e.stopPropagation()} // Evita abrir drawer ao arrastar
                  >
                    <IconGripVertical className="h-4 w-4 text-gray-400" />
                  </div>
                )}

                {/* Conteúdo da célula com padding se tiver drag handle */}
                <div className={dragHandle && index === 0 ? "pl-8" : ""}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </div>
              </TableCell>
            ))}
          </TableRow>
        </DrawerTrigger>

        {/* Resto do DrawerContent permanece igual */}
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
  onSaveOrder, // Nova prop
  mutate,
  saveButtonText,
  savingButtonText,
  pageSize = 10,
  totalCount: initialTotalCount = 0,
  fetchData,
  apiEndpoint,
  currentPage = 0,
  onPaginationChange,
  enableDragAndDrop = false, // Nova prop
  dragHandle = true, // Nova prop
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

  // Estados para controle do drag and drop
  const [tableOrder, setTableOrder] = useState<TData[]>([]);
  const [hasOrderChanged, setHasOrderChanged] = useState(false);
  const [isSavingOrder, setIsSavingOrder] = useState(false);
  const isMounted = React.useRef(false);

  // Sensors para drag and drop
  const sensors = useSensors(
    // PointerSensor (desktop modernos e alguns mobile que suportam Pointer Events)

    // TouchSensor (Android/iOS que não disparam PointerEvents corretamente)
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 0,
        tolerance: 5,
      },
    }),

    // MouseSensor (fallback caso TouchSensor/PointerSensor falhem em alguns navegadores)
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),

    // KeyboardSensor (suporte a arrastar via teclado)
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Inicializar tableOrder quando data muda
  useEffect(() => {
    setTableOrder([...data]);
    setHasOrderChanged(false);
  }, [data]);

  // Função para lidar com o fim do drag
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setTableOrder((items) => {
        const oldIndex = items.findIndex(
          (item, index) =>
            `${index}` === active.id || (item as any).id === active.id
        );
        const newIndex = items.findIndex(
          (item, index) =>
            `${index}` === over.id || (item as any).id === over.id
        );

        const newOrder = arrayMove(items, oldIndex, newIndex);
        setHasOrderChanged(true);
        return newOrder;
      });
    }
  };

  // Função para salvar a nova ordem
  const handleSaveOrder = async () => {
    if (!onSaveOrder || !hasOrderChanged) return;

    setIsSavingOrder(true);
    try {
      await onSaveOrder(tableOrder);
      setHasOrderChanged(false);
      // Atualizar os dados principais com a nova ordem
      setData([...tableOrder]);
      mutate?.();
    } catch (error) {
      console.error("Erro ao salvar ordem:", error);
    } finally {
      setIsSavingOrder(false);
    }
  };

  // Função para resetar a ordem
  const handleResetOrder = () => {
    setTableOrder([...data]);
    setHasOrderChanged(false);
  };

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
        result = await fetchData(page, pageSize);
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

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Memoize the pagination change handler to prevent re-creation on every render
  const handlePaginationChange = React.useCallback(
    (updater: any) => {
      // Verificar se o componente está montado antes de atualizar
      if (!isMounted.current) {
        return;
      }

      React.startTransition(() => {
        const newPagination =
          typeof updater === "function" ? updater(pagination) : updater;
        setPagination(newPagination);

        if (
          onPaginationChange &&
          (pagination.pageIndex !== newPagination.pageIndex ||
            pagination.pageSize !== newPagination.pageSize)
        ) {
          setTimeout(() => {
            if (isMounted.current) {
              // Verificar novamente antes da chamada externa
              onPaginationChange(newPagination);
            }
          }, 0);
        }
      });
    },
    [pagination, onPaginationChange]
  );

  // Modificar o useEffect para manipular a paginação corretamente
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

  // Modificar as colunas para incluir a coluna de drag handle se necessário
  const enhancedColumns = React.useMemo(() => {
    if (!enableDragAndDrop || !dragHandle) return columns;

    const dragColumn: ColumnDef<TData, any> = {
      id: "drag-handle",
      header: "",
      cell: () => null, // O conteúdo será renderizado no componente de linha
      size: 50,
      enableSorting: false,
      enableHiding: false,
    };

    return [dragColumn, ...columns];
  }, [columns, enableDragAndDrop, dragHandle]);

  // Usar tableOrder para os dados da tabela se drag and drop estiver habilitado
  const tableData = enableDragAndDrop ? tableOrder : data;

  // Atualize a configuração da tabela
  const table = useReactTable({
    data: tableData,
    columns: enhancedColumns,
    pageCount: Math.ceil(totalCount / pagination.pageSize),
    state: {
      globalFilter: searchTerm,
      sorting,
      columnVisibility,
      columnFilters,
      pagination,
    },
    onGlobalFilterChange: setSearchTerm,
    manualPagination: !enableDragAndDrop, // Desabilitar paginação manual se DnD estiver ativo
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: handlePaginationChange, // Use the memoized handler
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

  const TableContent = () => (
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
          enableDragAndDrop ? (
            <SortableContext
              items={table.getRowModel().rows.map((row) => row.id)}
              strategy={verticalListSortingStrategy}
            >
              {table.getRowModel().rows.map((row) => (
                <SortableTableRow<TData, TUpdate>
                  key={row.id}
                  row={row}
                  drawerConfig={drawerConfig}
                  onUpdate={onUpdate}
                  onDelete={onDelete}
                  saveButtonText={saveButtonText}
                  savingButtonText={savingButtonText}
                  mutate={mutate}
                  dragHandle={dragHandle}
                />
              ))}
            </SortableContext>
          ) : (
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
          )
        ) : (
          <TableRow>
            <TableCell
              colSpan={enhancedColumns.length}
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
  );

  return (
    <div className="flex flex-col">
      <div className="flex flex-col gap-4 px-4 lg:px-6 pb-4">
        {/* Título e botões de controle - empilhados em mobile */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl font-bold">{title}</h1>

          {/* Botões de controle de ordem */}
          {enableDragAndDrop && hasOrderChanged && (
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button
                variant="outline"
                onClick={handleResetOrder}
                disabled={isSavingOrder}
                className="flex items-center gap-2 text-xs sm:text-sm"
                size="sm"
              >
                <RotateCcw className="h-4 w-4" />
                <span className="hidden sm:inline">Resetar</span>
              </Button>
              <Button
                variant={"outline"}
                onClick={handleSaveOrder}
                disabled={isSavingOrder}
                className="bg-[#FF8F3F] text-white flex items-center gap-2 text-xs sm:text-sm"
                size="sm"
              >
                {isSavingOrder ? (
                  <>
                    <Loader2 className="animate-spin h-4 w-4" />
                    <span className="hidden sm:inline">Salvando...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span className="hidden sm:inline">Salvar Ordem</span>
                  </>
                )}
              </Button>
            </div>
          )}
        </div>

        {/* Busca e filtros - empilhados em mobile */}
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-end">
          {searchColumn && (
            <div className="relative flex items-center order-2 sm:order-1">
              <Search className="absolute left-3 text-gray-400 pointer-events-none w-4 h-4" />
              <Input
                placeholder="Procurar..."
                value={searchTerm}
                onChange={(e) => {
                  const v = e.target.value;
                  setSearchTerm(v);
                  table.setGlobalFilter(v);
                }}
                className="w-full sm:w-[200px] lg:w-[300px] pl-10"
              />
            </div>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="order-1 sm:order-2 w-full sm:w-auto"
              >
                <IconLayoutColumns className="h-4 w-4 mr-2" />
                <span className="sm:hidden lg:inline">Filtrar colunas</span>
                <span className="hidden sm:inline lg:hidden">Colunas</span>
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

      <div className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6">
        <div className="overflow-hidden rounded-lg border">
          {isLoading && (
            <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          )}

          {enableDragAndDrop ? (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <TableContent />
            </DndContext>
          ) : (
            <TableContent />
          )}
        </div>

        {/* Paginação - ocultar se drag and drop estiver ativo e houver mudanças */}
        {(!enableDragAndDrop || !hasOrderChanged) && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-2 sm:px-4">
            <div className="text-muted-foreground text-sm order-2 sm:order-1 text-center sm:text-left">
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

            <div className="flex flex-col sm:flex-row items-center gap-4 order-1 sm:order-2">
              {/* Seletor de linhas por página */}
              <div className="flex items-center gap-2">
                <Label
                  htmlFor="rows-per-page"
                  className="text-sm font-medium whitespace-nowrap"
                >
                  <span className="hidden sm:inline">Linhas por página</span>
                  <span className="sm:hidden">Por página</span>
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

              {/* Informação da página atual */}
              <div className="flex items-center justify-center text-sm font-medium whitespace-nowrap">
                Página {table.getState().pagination.pageIndex + 1} de{" "}
                {table.getPageCount() || 1}
              </div>

              {/* Controles de navegação */}
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  className="hidden h-8 w-8 p-0 sm:flex"
                  onClick={() => table.setPageIndex(0)}
                  disabled={!table.getCanPreviousPage() || isLoading}
                >
                  <span className="sr-only">Ir para a primeira página</span>
                  <IconChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  className="h-8 w-8 p-0"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage() || isLoading}
                >
                  <span className="sr-only">Ir para a página anterior</span>
                  <IconChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  className="h-8 w-8 p-0"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage() || isLoading}
                >
                  <span className="sr-only">Ir para a próxima página</span>
                  <IconChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  className="hidden h-8 w-8 p-0 sm:flex"
                  onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                  disabled={!table.getCanNextPage() || isLoading}
                >
                  <span className="sr-only">Ir para a última página</span>
                  <IconChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Aviso quando drag and drop está ativo */}
        {enableDragAndDrop && hasOrderChanged && (
          <div className="mx-2 sm:mx-4 py-3 px-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-700">
              📋 Você alterou a ordem dos itens. Clique em &quot;Salvar
              Ordem&quot; para confirmar as mudanças ou &quot;Resetar&quot; para
              voltar à ordem original.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
