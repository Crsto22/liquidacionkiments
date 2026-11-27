"use client";

import { useState, useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import {
  getPedidos,
  getPedidosServidor,
  subscribePedidos,
  type EstadoPedido,
} from "@/lib/pedidos-store";
import {
  ArrowDown,
  ArrowUp,
  Calendar,
  ChevronDown,
  Clock,
  Download,
  Eye,
  Export,
  Gift,
  MoneyRecive,
  MoreVCircle,
  Plus,
  Receipt5,
  Search,
  Trash,
  Users,
} from "reicon-react";

const money = new Intl.NumberFormat("es-PE", {
  style: "currency",
  currency: "PEN",
  maximumFractionDigits: 0,
});

const panel =
  "overflow-hidden bg-[#f6f8f7] ring-0 dark:bg-zinc-900 dark:ring-1 dark:ring-white/10";

const tabs = [
  { id: "todos", label: "Todos" },
  { id: "pendientes", label: "Pendientes" },
  { id: "pagados", label: "Pagados" },
  { id: "anulados", label: "Anulados" },
];

const estadoStyles: Record<EstadoPedido, { pill: string; dot: string }> = {
  Pendiente: {
    pill: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
    dot: "bg-amber-500",
  },
  Pagado: {
    pill: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    dot: "bg-emerald-500",
  },
  Anulado: {
    pill: "bg-rose-500/10 text-rose-700 dark:text-rose-400",
    dot: "bg-rose-500",
  },
};

const PAGE_SIZE = 8;

export default function PedidosPage() {
  const pedidos = useSyncExternalStore(
    subscribePedidos,
    getPedidos,
    getPedidosServidor,
  );

  const [tab, setTab] = useState("todos");
  const [query, setQuery] = useState("");
  const [asc, setAsc] = useState(false);
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<string[]>([]);

  const pendientes = pedidos.filter(
    (pedido) => pedido.estado === "Pendiente",
  );
  const porCobrar = pendientes.reduce(
    (sum, pedido) => sum + pedido.total,
    0,
  );
  const codigos = new Set(pedidos.map((pedido) => pedido.codigo)).size;

  const resumen = [
    {
      label: "Pedidos totales",
      value: pedidos.length.toString(),
      icon: <Receipt5 size={16} />,
    },
    {
      label: "Por cobrar",
      value: money.format(porCobrar),
      icon: <MoneyRecive size={16} />,
    },
    {
      label: "Pendientes",
      value: pendientes.length.toString(),
      icon: <Clock size={16} />,
    },
    {
      label: "Códigos",
      value: codigos.toString(),
      icon: <Users size={16} />,
    },
  ];

  const filtered = pedidos
    .filter((pedido) => {
      if (tab === "pendientes") return pedido.estado === "Pendiente";
      if (tab === "pagados") return pedido.estado === "Pagado";
      if (tab === "anulados") return pedido.estado === "Anulado";
      return true;
    })
    .filter((pedido) => {
      const texto =
        `${pedido.numero} ${pedido.codigo} ${pedido.conjunto} ${pedido.color} ${pedido.live ?? ""}`.toLowerCase();
      return texto.includes(query.trim().toLowerCase());
    })
    .sort((a, b) =>
      asc
        ? a.fechaISO.localeCompare(b.fechaISO)
        : b.fechaISO.localeCompare(a.fechaISO),
    );

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount - 1);
  const start = currentPage * PAGE_SIZE;
  const rows = filtered.slice(start, start + PAGE_SIZE);

  const pageIds = rows.map((pedido) => pedido.id);
  const allSelected =
    pageIds.length > 0 && pageIds.every((id) => selected.includes(id));

  function toggleAll(checked: boolean) {
    setSelected((prev) =>
      checked
        ? [...new Set([...prev, ...pageIds])]
        : prev.filter((id) => !pageIds.includes(id)),
    );
  }

  function resetView() {
    setPage(0);
    setSelected([]);
  }

  return (
    <div className="w-full space-y-6 p-4 sm:p-6">
      <Card className={cn(panel, "gap-0 py-0")}>
        <div className="grid grid-cols-2 divide-y divide-border/60 sm:grid-cols-5 sm:divide-x sm:divide-y-0">
          <div className="flex items-center gap-2 px-4 py-3 text-sm font-medium">
            <Calendar size={16} />
            Este mes
            <ChevronDown size={14} className="text-muted-foreground" />
          </div>
          {resumen.map((item) => (
            <div
              key={item.label}
              className="flex items-start justify-between gap-2 px-4 py-3"
            >
              <div>
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p className="mt-1 text-lg font-semibold tracking-tight">
                  {item.value}
                </p>
              </div>
              <span className="mt-0.5 text-muted-foreground">{item.icon}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card className={cn(panel, "gap-0 py-0")}>
        <div className="flex flex-wrap items-center gap-2 border-b px-2 py-2">
          <div className="flex items-center gap-1 overflow-x-auto">
            {tabs.map((item) => (
              <Button
                key={item.id}
                variant="ghost"
                size="sm"
                onClick={() => {
                  setTab(item.id);
                  resetView();
                }}
                className={cn(
                  "text-muted-foreground",
                  tab === item.id &&
                    "bg-background text-foreground shadow-sm dark:bg-white/10",
                )}
              >
                {item.label}
              </Button>
            ))}
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Nueva vista"
              title="Nueva vista"
            >
              <Plus size={16} />
            </Button>
          </div>

          <div className="ml-auto flex w-full items-center gap-2 sm:w-auto">
            <div className="relative flex-1 sm:w-60 sm:flex-none">
              <Search
                size={15}
                className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  resetView();
                }}
                placeholder="Buscar pedido, código o live"
                aria-label="Buscar pedido"
                className="h-8 pl-8"
              />
            </div>
            <Button variant="outline" size="sm">
              <Export size={14} data-icon="inline-start" />
              Exportar
            </Button>
          </div>
        </div>

        {selected.length > 0 && (
          <div className="flex items-center justify-between gap-2 border-b bg-muted/50 px-4 py-1.5">
            <span className="text-xs font-medium">
              {selected.length} seleccionado
              {selected.length === 1 ? "" : "s"}
            </span>
            <Button variant="ghost" size="sm" onClick={() => setSelected([])}>
              Limpiar
            </Button>
          </div>
        )}

        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10 pl-4">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={(checked) => toggleAll(checked === true)}
                    aria-label="Seleccionar todos los pedidos"
                  />
                </TableHead>
                <TableHead>Pedido</TableHead>
                <TableHead>
                  <button
                    type="button"
                    onClick={() => setAsc((value) => !value)}
                    className="flex items-center gap-1 transition-colors hover:text-foreground"
                  >
                    Fecha
                    {asc ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                  </button>
                </TableHead>
                <TableHead>Código</TableHead>
                <TableHead className="hidden md:table-cell">Live</TableHead>
                <TableHead>Conjunto</TableHead>
                <TableHead className="hidden md:table-cell">Color</TableHead>
                <TableHead>Talla</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="w-10 pr-4">
                  <span className="sr-only">Acciones</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((pedido) => {
                const estado = estadoStyles[pedido.estado];
                return (
                  <TableRow
                    key={pedido.id}
                    data-state={
                      selected.includes(pedido.id) ? "selected" : undefined
                    }
                  >
                    <TableCell className="pl-4">
                      <Checkbox
                        checked={selected.includes(pedido.id)}
                        onCheckedChange={(checked) =>
                          setSelected((prev) =>
                            checked === true
                              ? [...prev, pedido.id]
                              : prev.filter((id) => id !== pedido.id),
                          )
                        }
                        aria-label={`Seleccionar pedido ${pedido.numero}`}
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      #{pedido.numero}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {pedido.fecha}
                    </TableCell>
                    <TableCell className="font-mono text-xs font-medium tracking-widest">
                      {pedido.codigo}
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground md:table-cell">
                      {pedido.live ? `@${pedido.live}` : "—"}
                    </TableCell>
                    <TableCell className="font-medium">
                      {pedido.conjunto}
                      {pedido.live && (
                        <p className="text-[11px] font-normal text-muted-foreground md:hidden">
                          @{pedido.live}
                        </p>
                      )}
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground md:table-cell">
                      {pedido.color}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {pedido.talla}
                    </TableCell>
                    <TableCell className="text-right font-medium tabular-nums">
                      {pedido.regalo ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400">
                          <Gift size={12} weight="Filled" />
                          Regalo
                        </span>
                      ) : (
                        money.format(pedido.total)
                      )}
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap",
                          estado.pill,
                        )}
                      >
                        <span
                          className={cn("size-1.5 rounded-full", estado.dot)}
                        />
                        {pedido.estado}
                      </span>
                    </TableCell>
                    <TableCell className="pr-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label={`Acciones para el pedido ${pedido.numero}`}
                          >
                            <MoreVCircle size={16} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuLabel>
                            #{pedido.numero}
                          </DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Eye size={16} />
                            Ver detalle
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download size={16} />
                            Descargar comprobante
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem variant="destructive">
                            <Trash size={16} />
                            Anular pedido
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}

              {rows.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={11}
                    className="py-10 text-center text-sm text-muted-foreground"
                  >
                    No se encontraron pedidos con esos filtros.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>

        <CardFooter className="flex flex-col gap-3 border-t px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            Mostrando {filtered.length === 0 ? 0 : start + 1}–
            {Math.min(start + PAGE_SIZE, filtered.length)} de {filtered.length}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((value) => Math.max(0, value - 1))}
              disabled={currentPage === 0}
            >
              Anterior
            </Button>
            <span className="text-xs text-muted-foreground">
              {currentPage + 1} / {pageCount}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setPage((value) => Math.min(pageCount - 1, value + 1))
              }
              disabled={currentPage >= pageCount - 1}
            >
              Siguiente
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
