"use client";

import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type FormEvent,
} from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { toast } from "sonner";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  agregarPedido,
  getPedidos,
  getPedidosServidor,
  subscribePedidos,
  type EstadoPedido,
} from "@/lib/pedidos-store";
import { CheckCircle, Clock, Hanger, Hanger2, Tag, Tshirt } from "reicon-react";
import {
  Download,
  Eye,
  MoreVCircle,
  Plus,
  Printer,
  Receipt5,
  Settings,
  Trash,
} from "reicon-react";

const money = new Intl.NumberFormat("es-PE", {
  style: "currency",
  currency: "PEN",
  maximumFractionDigits: 0,
});

const panel =
  "overflow-hidden bg-[#f6f8f7] ring-0 dark:bg-zinc-900 dark:ring-1 dark:ring-white/10";

const avatarColors = [
  "bg-rose-500/15 text-rose-600 dark:text-rose-400",
  "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  "bg-violet-500/15 text-violet-600 dark:text-violet-400",
  "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  "bg-sky-500/15 text-sky-600 dark:text-sky-400",
];

type ChatMessage = {
  id: string;
  user: string;
  initials: string;
  message: string;
  time: string;
};

type LiveMessage = {
  user: string;
  comment: string;
  time: string;
};

type EstadoConexion = "conectando" | "conectado" | "error" | "finalizado";

type ProductoCatalogo = {
  id: number;
  nombre: string;
  slug: string;
  precio: number;
  imagen: string;
  color: string;
};

const colores = [
  { nombre: "Beige", hex: "#d9c3a5" },
  { nombre: "Negro", hex: "#1f1f1f" },
  { nombre: "Blanco", hex: "#f5f5f5" },
  { nombre: "Lila", hex: "#b9a7e6" },
  { nombre: "Rosa", hex: "#f3a6b8" },
  { nombre: "Rojo", hex: "#d64545" },
  { nombre: "Azul", hex: "#4f7cff" },
  { nombre: "Verde", hex: "#3fa66b" },
  { nombre: "Marrón", hex: "#7b4b2a" },
  { nombre: "Gris", hex: "#9ca3af" },
];

function extraerCodigo(texto: string): string | null {
  const match = texto.match(/(?<!\d)(\d{4})(?!\d)/);
  return match ? match[1] : null;
}

function useEsEscritorio() {
  return useSyncExternalStore(
    (onChange) => {
      const query = window.matchMedia("(min-width: 1024px)");
      query.addEventListener("change", onChange);
      return () => query.removeEventListener("change", onChange);
    },
    () => window.matchMedia("(min-width: 1024px)").matches,
    () => false,
  );
}

const tiposPrenda = [
  { nombre: "Blazer", icon: Tshirt },
  { nombre: "Pantalón", icon: Hanger2 },
  { nombre: "Otro", icon: Tag },
];

const estadoHistorial: Record<EstadoPedido, string> = {
  Pendiente: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  Pagado: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  Anulado: "bg-rose-500/10 text-rose-700 dark:text-rose-400",
};

function LiveChatPanel({
  username,
  active,
  registrados,
  onUsarCodigo,
}: {
  username: string;
  active: boolean;
  registrados: string[];
  onUsarCodigo: (codigo: string) => void;
}) {
  const [mensajes, setMensajes] = useState<ChatMessage[]>([]);
  const [estado, setEstado] = useState<EstadoConexion>("conectando");
  const [errorLive, setErrorLive] = useState<string | null>(null);
  const [intento, setIntento] = useState(0);
  const [filtroChat, setFiltroChat] = useState<"todos" | "codigos">("todos");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const source = new EventSource(
      `/api/tiktok-live?username=${encodeURIComponent(username)}`,
    );

    source.addEventListener("chat", (event) => {
      try {
        const data = JSON.parse((event as MessageEvent).data) as LiveMessage;
        const comment = (data.comment ?? "").trim();
        if (!comment) return;

        const user = (data.user ?? "Anónimo").trim() || "Anónimo";
        setMensajes((prev) =>
          [
            ...prev.slice(-49),
            {
              id: crypto.randomUUID(),
              user,
              initials: user.slice(0, 2).toUpperCase(),
              message: comment,
              time: data.time ?? "",
            },
          ],
        );
      } catch {
        // Ignora eventos con formato inválido.
      }
    });

    source.addEventListener("status", (event) => {
      try {
        const data = JSON.parse((event as MessageEvent).data) as {
          status: string;
        };
        if (data.status === "connected") {
          setEstado("conectado");
          setErrorLive(null);
        } else if (
          data.status === "ended" ||
          data.status === "disconnected"
        ) {
          setEstado("finalizado");
          source.close();
        }
      } catch {
        // Ignora eventos con formato inválido.
      }
    });

    source.addEventListener("live-error", (event) => {
      try {
        const data = JSON.parse((event as MessageEvent).data) as {
          message?: string;
        };
        setErrorLive(
          data.message ?? "No se pudo conectar al live de TikTok.",
        );
      } catch {
        setErrorLive("No se pudo conectar al live de TikTok.");
      }
      setEstado("error");
      source.close();
    });

    source.onerror = () => {
      if (source.readyState === EventSource.CLOSED) {
        setEstado((prev) => (prev === "conectado" ? "finalizado" : "error"));
      }
    };

    return () => source.close();
  }, [username, intento]);

  useEffect(() => {
    const contenedor = scrollRef.current;
    if (contenedor) contenedor.scrollTop = contenedor.scrollHeight;
  }, [mensajes.length, filtroChat]);

  const activo = estado === "conectado";
  const conectando = estado === "conectando";
  const mensajesVisibles =
    filtroChat === "codigos"
      ? mensajes.filter((mensaje) => extraerCodigo(mensaje.message) !== null)
      : mensajes;
  const totalCodigos = mensajes.filter(
    (mensaje) => extraerCodigo(mensaje.message) !== null,
  ).length;

  function reconectar() {
    setMensajes([]);
    setErrorLive(null);
    setEstado("conectando");
    setIntento((value) => value + 1);
  }

  return (
    <div
      className={cn(
        "min-h-0 flex-1 flex-col",
        active ? "flex" : "hidden",
      )}
    >
      <div className="flex items-center gap-2 px-4 py-3">
        <span className="relative flex size-2">
          {conectando && (
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-amber-500 opacity-75" />
          )}
          <span
            className={cn(
              "relative inline-flex size-2 rounded-full",
              activo
                ? "bg-red-500"
                : conectando
                  ? "bg-amber-500"
                  : "bg-rose-500",
            )}
          />
        </span>
        <p className="text-sm font-semibold">Chat del live</p>
        <span className="truncate text-xs text-muted-foreground">
          @{username}
        </span>
        <Badge
          variant="outline"
          className={cn(
            "ml-auto h-5 shrink-0 rounded-full border-0 px-2 text-[10px]",
            activo
              ? "bg-red-500/10 text-red-600 dark:text-red-400"
              : conectando
                ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                : "bg-rose-500/10 text-rose-600 dark:text-rose-400",
          )}
        >
          {activo ? "EN VIVO" : conectando ? "CONECTANDO" : "SIN CONEXIÓN"}
        </Badge>
      </div>

      <div className="flex items-center justify-between gap-2 px-4 py-2">
        <span className="text-[11px] text-muted-foreground">Mostrar</span>
        <div className="flex items-center rounded-lg bg-muted p-0.5">
          <Button
            type="button"
            variant="ghost"
            size="xs"
            onClick={() => setFiltroChat("todos")}
            className={cn(
              "h-6 rounded-md px-2 text-[11px]",
              filtroChat === "todos" &&
                "bg-background text-foreground shadow-sm hover:bg-background",
            )}
          >
            Todos
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="xs"
            onClick={() => setFiltroChat("codigos")}
            className={cn(
              "h-6 rounded-md px-2 text-[11px]",
              filtroChat === "codigos" &&
                "bg-background text-foreground shadow-sm hover:bg-background",
            )}
          >
            Solo códigos
            {totalCodigos > 0 ? ` (${totalCodigos})` : ""}
          </Button>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 sm:p-4">
        {estado === "error" ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 px-4 text-center">
            <p className="text-sm font-medium">No se pudo conectar al live</p>
            <p className="max-w-xs text-xs text-muted-foreground">{errorLive}</p>
            <Button size="sm" className="mt-2" onClick={reconectar}>
              Reconectar
            </Button>
          </div>
        ) : estado === "finalizado" ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 px-4 text-center">
            <p className="text-sm font-medium">El live terminó</p>
            <p className="text-xs text-muted-foreground">
              Espera a la próxima transmisión.
            </p>
            <Button size="sm" className="mt-2" onClick={reconectar}>
              Reconectar
            </Button>
          </div>
        ) : mensajes.length === 0 ? (
          <div className="flex h-full items-center justify-center px-4 text-center">
            <p className="text-sm text-muted-foreground">
              {conectando
                ? `Conectando con @${username}…`
                : "Esperando comentarios del live…"}
            </p>
          </div>
        ) : mensajesVisibles.length === 0 ? (
          <div className="flex h-full items-center justify-center px-4 text-center">
            <p className="text-sm text-muted-foreground">
              No hay comentarios con códigos todavía.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {mensajesVisibles.map((mensaje, index) => {
              const codigoChat = extraerCodigo(mensaje.message);
              const registrado = codigoChat
                ? registrados.includes(codigoChat)
                : false;

              return (
                <div key={mensaje.id} className="flex gap-2.5">
                  <div
                    className={cn(
                      "flex size-8 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold",
                      avatarColors[index % avatarColors.length],
                    )}
                  >
                    {mensaje.initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2">
                      <p className="truncate text-xs font-medium">
                        {mensaje.user}
                      </p>
                      <span className="shrink-0 text-[10px] text-muted-foreground">
                        {mensaje.time}
                      </span>
                    </div>

                    {codigoChat ? (
                      <div className="mt-1.5 space-y-1.5">
                        {mensaje.message.trim() !== codigoChat && (
                          <p className="text-sm text-foreground/80">
                            {mensaje.message}
                          </p>
                        )}
                        <div className="flex items-center gap-3">
                          <p className="font-mono text-sm font-semibold tracking-widest text-emerald-700 dark:text-emerald-400">
                            {codigoChat}
                          </p>
                          {registrado ? (
                            <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
                              <CheckCircle size={14} />
                              Registrado
                            </span>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => onUsarCodigo(codigoChat)}
                            >
                              Registrar
                            </Button>
                          )}
                        </div>
                      </div>
                    ) : (
                      <p className="mt-0.5 text-sm text-foreground/80">
                        {mensaje.message}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function LivePage() {
  const [codigo, setCodigo] = useState("");
  const [conjunto, setConjunto] = useState("");
  const [historial, setHistorial] = useState<string[]>([
    "Blazer beige",
    "Conjunto lila",
    "Vestido floral",
    "Pantalón palazzo",
  ]);
  const [color, setColor] = useState("");
  const [tipo, setTipo] = useState("");
  const [talla, setTalla] = useState("");
  const [precio, setPrecio] = useState("");
  const [historialPrecios, setHistorialPrecios] = useState<number[]>([
    85, 80, 120, 150,
  ]);
  const [ajustesAbierto, setAjustesAbierto] = useState(false);
  const [mostrarColor, setMostrarColor] = useState(true);
  const [mostrarTalla, setMostrarTalla] = useState(true);
  const [mostrarTipo, setMostrarTipo] = useState(true);
  const [registrados, setRegistrados] = useState<string[]>([]);
  const [lives, setLives] = useState<string[]>([]);
  const [liveActivo, setLiveActivo] = useState(0);
  const [nuevoLive, setNuevoLive] = useState("");
  const [agregarLiveAbierto, setAgregarLiveAbierto] = useState(false);
  const [registroAbierto, setRegistroAbierto] = useState(false);
  const esEscritorio = useEsEscritorio();
  const [catalogoAbierto, setCatalogoAbierto] = useState(false);
  const [productosCatalogo, setProductosCatalogo] = useState<ProductoCatalogo[]>(
    [],
  );
  const [cargandoCatalogo, setCargandoCatalogo] = useState(false);
  const [errorCatalogo, setErrorCatalogo] = useState<string | null>(null);
  const [productoSeleccionado, setProductoSeleccionado] =
    useState<ProductoCatalogo | null>(null);
  const formRef = useRef<HTMLDivElement>(null);

  const pedidos = useSyncExternalStore(
    subscribePedidos,
    getPedidos,
    getPedidosServidor,
  );

  async function cargarCatalogo() {
    setCargandoCatalogo(true);
    setErrorCatalogo(null);

    try {
      const response = await fetch("/api/kiments/productos", {
        cache: "no-store",
      });
      const data = (await response.json()) as {
        productos?: ProductoCatalogo[];
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error ?? `Error ${response.status}`);
      }

      setProductosCatalogo(data.productos ?? []);
    } catch (error) {
      setErrorCatalogo(
        error instanceof Error
          ? error.message
          : "No se pudieron cargar los conjuntos.",
      );
    } finally {
      setCargandoCatalogo(false);
    }
  }

  function abrirCatalogo() {
    setCatalogoAbierto(true);
    if (productosCatalogo.length === 0 && !cargandoCatalogo) {
      void cargarCatalogo();
    }
  }

  function elegirProducto(producto: ProductoCatalogo) {
    setConjunto(producto.nombre);
    setProductoSeleccionado(producto);
    setCatalogoAbierto(false);
  }

  const codigoValido = /^\d{4}$/.test(codigo);
  const formularioValido =
    codigoValido &&
    conjunto.trim().length > 0 &&
    Number(precio) > 0;

  function agregarLive() {
    const limpio = nuevoLive.trim().replace(/^@/, "").toLowerCase();
    if (!limpio) return;

    const existente = lives.findIndex(
      (usuario) => usuario.toLowerCase() === limpio,
    );

    if (existente >= 0) {
      setLiveActivo(existente);
      setNuevoLive("");
      setAgregarLiveAbierto(false);
      return;
    }

    if (lives.length >= 3) return;

    setLives((prev) => [...prev, limpio]);
    setLiveActivo(lives.length);
    setNuevoLive("");
    setAgregarLiveAbierto(false);
  }

  function usarCodigo(codigoChat: string) {
    setCodigo(codigoChat);
    if (window.matchMedia("(max-width: 1023px)").matches) {
      setRegistroAbierto(true);
    } else {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  function registrar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!formularioValido) return;

    setRegistrados((prev) =>
      prev.includes(codigo) ? prev : [...prev, codigo],
    );

    const nombre = conjunto.trim();
    setHistorial((prev) =>
      [
        nombre,
        ...prev.filter((item) => item.toLowerCase() !== nombre.toLowerCase()),
      ].slice(0, 6),
    );

    const monto = Number(precio);
    setHistorialPrecios((prev) =>
      [monto, ...prev.filter((valor) => valor !== monto)].slice(0, 6),
    );

    agregarPedido({
      codigo,
      conjunto: nombre,
      tipo,
      color,
      talla,
      total: monto,
      live: lives[liveActivo] ?? "",
    });

    const resumen = [
      lives[liveActivo] ? `@${lives[liveActivo]}` : "",
      tipo,
      conjunto.trim(),
      color.trim(),
      talla ? `Talla ${talla}` : "",
      money.format(monto),
    ]
      .filter(Boolean)
      .join(" · ");

    const toastId = toast.loading("Imprimiendo pedido…", {
      description: resumen,
    });

    window.setTimeout(() => {
      toast.success("Pedido registrado", {
        id: toastId,
        description: resumen,
      });
    }, 2000);

    setCodigo("");
    setConjunto("");
    setColor("");
    setTipo("");
    setTalla("");
    setPrecio("");
    setProductoSeleccionado(null);
    setRegistroAbierto(false);
  }

  const tarjetaRegistro = (
    <Card
      className={cn(
        panel,
        "gap-0 py-0 lg:sticky lg:top-20 lg:min-h-[calc(100svh-6.5rem)]",
      )}
    >
      <div className="flex items-center justify-between gap-2 border-b px-4 py-3">
        <p className="text-sm font-semibold">Registrar pedido</p>

        <Popover open={ajustesAbierto} onOpenChange={setAjustesAbierto}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 gap-1.5 px-2 text-xs text-muted-foreground"
            >
              <Settings
                size={14}
                className={cn(
                  "transition-transform duration-300",
                  ajustesAbierto && "rotate-90",
                )}
              />
              Ajustes
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80 p-0 ring-0">
            <div className="space-y-3 p-4">
              <p className="text-xs font-medium">Campos del formulario</p>

              <div className="space-y-1">
                <div className="flex items-center justify-between gap-4 px-1 py-2">
                  <div>
                    <p className="text-xs font-medium">Color</p>
                    <p className="text-[11px] text-muted-foreground">
                      Mostrar selector de color
                    </p>
                  </div>
                  <Switch
                    checked={mostrarColor}
                    onCheckedChange={(checked) => {
                      setMostrarColor(checked);
                      if (!checked) setColor("");
                    }}
                    aria-label="Mostrar color"
                  />
                </div>

                <div className="flex items-center justify-between gap-4 px-1 py-2">
                  <div>
                    <p className="text-xs font-medium">Talla</p>
                    <p className="text-[11px] text-muted-foreground">
                      Mostrar selector de talla
                    </p>
                  </div>
                  <Switch
                    checked={mostrarTalla}
                    onCheckedChange={(checked) => {
                      setMostrarTalla(checked);
                      if (!checked) setTalla("");
                    }}
                    aria-label="Mostrar talla"
                  />
                </div>

                <div className="flex items-center justify-between gap-4 px-1 py-2">
                  <div>
                    <p className="text-xs font-medium">Tipo de prenda</p>
                    <p className="text-[11px] text-muted-foreground">
                      Mostrar blazer, pantalón u otro
                    </p>
                  </div>
                  <Switch
                    checked={mostrarTipo}
                    onCheckedChange={(checked) => {
                      setMostrarTipo(checked);
                      if (!checked) setTipo("");
                    }}
                    aria-label="Mostrar tipo de prenda"
                  />
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <form onSubmit={registrar} className="space-y-4 p-4">
        <div className="space-y-2">
          <Label htmlFor="codigo">Código del cliente</Label>
          <Input
            id="codigo"
            value={codigo}
            onChange={(event) => {
              setCodigo(event.target.value.replace(/\D/g, "").slice(0, 4));
            }}
            placeholder="4821"
            inputMode="numeric"
            maxLength={4}
            className="h-10 font-mono tracking-[0.3em]"
            required
          />
        </div>

        <div className="@container space-y-2">
          {catalogoAbierto ? (
            <Carousel
              opts={{ align: "start", dragFree: true }}
              className="w-full"
            >
              <div className="mb-2 flex items-center gap-2">
                <Label>Elegir prenda</Label>
                <div className="ml-auto flex items-center gap-1">
                  <CarouselPrevious size="icon-xs" className="static" />
                  <CarouselNext size="icon-xs" className="static" />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs"
                    onClick={() => setCatalogoAbierto(false)}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>

              {cargandoCatalogo ? (
                <div className="flex gap-2 overflow-hidden">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <div
                      key={index}
                      className="w-1/4 shrink-0 space-y-1.5"
                    >
                      <Skeleton className="aspect-square w-full rounded-lg" />
                      <Skeleton className="h-2.5 w-2/3" />
                    </div>
                  ))}
                </div>
              ) : errorCatalogo ? (
                <div className="rounded-lg border border-border/60 p-4 text-center">
                  <p className="text-xs font-medium">
                    No se pudo cargar el catálogo
                  </p>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {errorCatalogo}
                  </p>
                  <Button
                    type="button"
                    size="sm"
                    className="mt-3"
                    onClick={() => void cargarCatalogo()}
                  >
                    Reintentar
                  </Button>
                </div>
              ) : productosCatalogo.length === 0 ? (
                <p className="rounded-lg border border-border/60 p-4 text-center text-xs text-muted-foreground">
                  No hay prendas disponibles.
                </p>
              ) : (
                <CarouselContent className="-ml-2 py-1">
                  {productosCatalogo.map((producto, index) => (
                    <CarouselItem
                      key={producto.id}
                      className="pl-2"
                      style={{ flex: "0 0 96px" }}
                    >
                      <button
                        type="button"
                        onClick={() => elegirProducto(producto)}
                        className="group animate-in fade-in-0 zoom-in-95 w-full text-left"
                        style={{
                          animationDelay: `${Math.min(index, 9) * 25}ms`,
                          animationFillMode: "both",
                        }}
                      >
                        <div className="relative aspect-square w-full overflow-hidden rounded-lg border bg-muted">
                          <Image
                            src={producto.imagen}
                            alt={producto.nombre}
                            fill
                            sizes="(min-width: 1536px) 12vw, 22vw"
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        </div>
                        <p className="mt-1 truncate text-[11px] font-medium">
                          {producto.nombre}
                        </p>
                      </button>
                    </CarouselItem>
                  ))}
                </CarouselContent>
              )}
            </Carousel>
          ) : (
            <>
              <Label htmlFor="conjunto">Nombre del conjunto</Label>
              <div className="relative">
            {productoSeleccionado && (
              <span className="pointer-events-none absolute left-1.5 top-1/2 size-7 -translate-y-1/2 overflow-hidden rounded-md bg-muted ring-1 ring-border">
                <Image
                  src={productoSeleccionado.imagen}
                  alt={productoSeleccionado.nombre}
                  width={28}
                  height={28}
                  className="size-full object-cover"
                />
              </span>
            )}
            <Input
              id="conjunto"
              value={conjunto}
              onChange={(event) => {
                setConjunto(event.target.value);
                if (
                  productoSeleccionado &&
                  event.target.value !== productoSeleccionado.nombre
                ) {
                  setProductoSeleccionado(null);
                }
              }}
              placeholder="Blazer oversize"
              className={cn("h-10 pr-10", productoSeleccionado && "pl-10")}
              required
            />
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Elegir prenda"
              title="Elegir prenda"
              onClick={abrirCatalogo}
              className="absolute right-1 top-1/2 -translate-y-1/2 text-muted-foreground"
            >
              <Hanger size={16} />
            </Button>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <Clock size={12} />
              Historial
            </span>
            {historial.map((nombre) => (
              <button
                key={nombre}
                type="button"
                onClick={() => {
                  setConjunto(nombre);
                  setProductoSeleccionado(null);
                }}
                className="rounded-full border border-border/70 bg-background px-2 py-0.5 text-[11px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {nombre}
              </button>
            ))}
          </div>
            </>
          )}
        </div>

        {mostrarColor && (
        <div className="min-w-0 space-y-2">
          <Carousel
            opts={{ align: "start", dragFree: true }}
            className="w-full min-w-0"
          >
            <div className="mb-2 flex items-center gap-2">
              <Label>Color</Label>
              <span className="truncate text-[11px] text-muted-foreground">
                {color ? `Seleccionado: ${color}` : "Elige un color"}
              </span>
              <div className="ml-auto flex items-center gap-1">
                <CarouselPrevious size="icon-xs" className="static" />
                <CarouselNext size="icon-xs" className="static" />
              </div>
            </div>

            <CarouselContent className="-ml-2 py-1">
              {colores.map((opcion) => {
                const activo = color === opcion.nombre;
                return (
                  <CarouselItem
                    key={opcion.nombre}
                    className="basis-auto pl-2"
                  >
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          onClick={() => {
                            setColor(opcion.nombre);
                          }}
                          aria-label={opcion.nombre}
                          aria-pressed={activo}
                          className={cn(
                            "mx-auto flex size-11 items-center justify-center rounded-full ring-2 ring-transparent transition",
                            activo
                              ? "ring-foreground"
                              : "hover:ring-border",
                          )}
                        >
                          <span
                            className="size-9 rounded-full ring-1 ring-black/10 dark:ring-white/20"
                            style={{ backgroundColor: opcion.hex }}
                          />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>{opcion.nombre}</TooltipContent>
                    </Tooltip>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
          </Carousel>
        </div>
        )}

        {(mostrarTalla || mostrarTipo) && (
        <div className="flex flex-wrap gap-4">
          {mostrarTalla && (
          <div className="min-w-[200px] flex-1 space-y-2">
            <Label>Talla</Label>
            <div className="grid grid-cols-4 gap-2">
              {["XS", "S", "M", "L"].map((opcion) => {
                const activo = talla === opcion;
                return (
                  <button
                    key={opcion}
                    type="button"
                    onClick={() => {
                      setTalla(opcion);
                    }}
                    aria-label={`Talla ${opcion}`}
                    aria-pressed={activo}
                    className={cn(
                      "flex h-9 items-center justify-center rounded-lg border text-sm font-medium transition-colors",
                      activo
                        ? "border-foreground bg-foreground text-background"
                        : "border-border hover:bg-muted",
                    )}
                  >
                    {opcion}
                  </button>
                );
              })}
            </div>
          </div>
          )}

          {mostrarTipo && (
          <div className="min-w-[200px] flex-1 space-y-2">
            <Label>Tipo de prenda</Label>
            <div className="grid grid-cols-3 gap-2">
              {tiposPrenda.map(({ nombre, icon: Icon }) => {
                const activo = tipo === nombre;
                return (
                  <button
                    key={nombre}
                    type="button"
                    onClick={() => {
                      setTipo(nombre);
                    }}
                    aria-label={`Tipo ${nombre}`}
                    aria-pressed={activo}
                    className={cn(
                      "flex h-9 items-center justify-center gap-1.5 rounded-lg border text-sm font-medium transition-colors",
                      activo
                        ? "border-foreground bg-foreground text-background"
                        : "border-border hover:bg-muted",
                    )}
                  >
                    <Icon size={14} />
                    {nombre}
                  </button>
                );
              })}
            </div>
          </div>
          )}
        </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="precio">Precio</Label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
              S/
            </span>
            <Input
              id="precio"
              type="number"
              min="1"
              step="1"
              inputMode="numeric"
              value={precio}
              onChange={(event) => {
                setPrecio(event.target.value);
              }}
              placeholder="320"
              className="h-10 pl-9"
              required
            />
          </div>
          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <Clock size={12} />
              Historial
            </span>
            {historialPrecios.map((valor) => (
              <button
                key={valor}
                type="button"
                onClick={() => {
                  setPrecio(String(valor));
                }}
                className="rounded-full border border-border/70 bg-background px-2 py-0.5 text-[11px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {money.format(valor)}
              </button>
            ))}
          </div>
        </div>

        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={!formularioValido}
        >
          Registrar pedido
        </Button>
      </form>
    </Card>  );

  return (
    <div className="grid w-full grid-cols-1 gap-4 p-0 max-lg:fixed max-lg:inset-x-0 max-lg:top-14 max-lg:bottom-[calc(4.25rem+env(safe-area-inset-bottom))] max-lg:z-10 max-lg:block max-lg:min-h-0 max-lg:gap-0 lg:grid-cols-[260px_minmax(0,1fr)_300px] lg:p-6 xl:grid-cols-[320px_minmax(0,1fr)_380px] 2xl:grid-cols-[390px_minmax(0,1fr)_470px]">
      <Card
        className={cn(
          "flex h-full min-h-0 flex-col gap-0 overflow-hidden rounded-xl bg-transparent py-0 ring-0 max-lg:rounded-none dark:bg-transparent lg:sticky lg:top-20 lg:h-[calc(100svh-6.5rem)]",
        )}
      >
        {lives.length === 0 ? (
          <div className="relative flex min-h-0 flex-1 flex-col items-center justify-center overflow-hidden px-6 text-center">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_78%)]"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-zinc-500/35 via-zinc-400/25 to-zinc-500/35 [mask-image:radial-gradient(circle,black_1.5px,transparent_1.5px)] [mask-size:18px_18px] dark:from-zinc-400/30 dark:via-zinc-500/20 dark:to-zinc-400/30" />
            </div>

            <div className="relative z-10 flex flex-col items-center gap-3">
              <p className="text-sm font-semibold">¿Qué live quieres ver?</p>
              <p className="max-w-[220px] text-xs text-muted-foreground">
                Escribe el usuario de TikTok para conectar el chat.
              </p>
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  agregarLive();
                }}
                className="flex w-full max-w-[260px] items-center gap-2"
              >
                <Input
                  value={nuevoLive}
                  onChange={(event) => setNuevoLive(event.target.value)}
                  placeholder="usuario de TikTok"
                  aria-label="Usuario de TikTok"
                  className="h-9"
                />
                <Button
                  type="submit"
                  size="sm"
                  className="shrink-0"
                  disabled={!nuevoLive.trim()}
                >
                  Ver live
                </Button>
              </form>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-1 px-2 py-1.5">
              <div className="flex min-w-0 items-center gap-1 overflow-x-auto">
                {lives.map((usuario, index) => (
                  <Button
                    key={usuario}
                    type="button"
                    variant="ghost"
                    size="xs"
                    onClick={() => setLiveActivo(index)}
                    className={cn(
                      "h-7 max-w-[110px] rounded-md px-2 text-[11px]",
                      index === liveActivo
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground",
                    )}
                  >
                    <span className="truncate">@{usuario}</span>
                  </Button>
                ))}
              </div>

              <div className="ml-auto flex shrink-0 items-center gap-0.5">
                <Popover
                  open={agregarLiveAbierto}
                  onOpenChange={setAgregarLiveAbierto}
                >
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      aria-label="Agregar live"
                      disabled={lives.length >= 3}
                      className="shrink-0"
                    >
                      <Plus size={14} />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="end" className="w-64 p-3">
                    <form
                      onSubmit={(event) => {
                        event.preventDefault();
                        agregarLive();
                      }}
                      className="space-y-2"
                    >
                      <p className="text-xs font-medium">Agregar live</p>
                      <Input
                        value={nuevoLive}
                        onChange={(event) => setNuevoLive(event.target.value)}
                        placeholder="usuario de TikTok"
                        aria-label="Usuario de TikTok"
                        className="h-8"
                      />
                      <Button
                        type="submit"
                        size="sm"
                        className="w-full"
                        disabled={!nuevoLive.trim() || lives.length >= 3}
                      >
                        Agregar
                      </Button>
                      <p className="text-[10px] text-muted-foreground">
                        Máximo 3 lives.
                      </p>
                    </form>
                  </PopoverContent>
                </Popover>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  aria-label="Registrar pedido"
                  title="Registrar pedido"
                  onClick={() => setRegistroAbierto(true)}
                  className="lg:hidden"
                >
                  <Receipt5 size={14} />
                </Button>
              </div>
            </div>

            {lives.map((usuario, index) => (
              <LiveChatPanel
                key={usuario}
                username={usuario}
                active={index === liveActivo}
                registrados={registrados}
                onUsarCodigo={usarCodigo}
              />
            ))}
          </>
        )}
      </Card>

      {esEscritorio ? (
        <div ref={formRef} className="min-w-0">
          {tarjetaRegistro}
        </div>
      ) : null}

      <Card
        className={cn(
          panel,
          "hidden h-[560px] flex-col gap-0 py-0 lg:sticky lg:top-20 lg:flex lg:h-[calc(100svh-6.5rem)]",
        )}
      >
        <div className="flex items-center gap-2 border-b px-4 py-3">
          <p className="text-sm font-semibold">Historial de pedidos</p>
          <Badge
            variant="outline"
            className="ml-auto h-5 rounded-full border-0 bg-muted px-2 text-[10px] text-muted-foreground"
          >
            {pedidos.length}
          </Badge>
        </div>

        <div className="flex-1 overflow-y-auto">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-[#f6f8f7] dark:bg-zinc-900">
              <TableRow>
                <TableHead className="h-9 pl-3 text-[10px] uppercase tracking-wide">
                  Pedido
                </TableHead>
                <TableHead className="h-9 text-[10px] uppercase tracking-wide">
                  Conjunto
                </TableHead>
                <TableHead className="h-9 text-right text-[10px] uppercase tracking-wide">
                  Total
                </TableHead>
                <TableHead className="h-9 pr-3 text-[10px] uppercase tracking-wide">
                  Estado
                </TableHead>
                <TableHead className="h-9 w-8 pr-2">
                  <span className="sr-only">Acciones</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pedidos.map((pedido) => (
                <TableRow key={pedido.id}>
                  <TableCell className="pl-3 text-xs font-medium whitespace-nowrap">
                    #{pedido.numero}
                    {pedido.live && (
                      <p className="max-w-[72px] truncate text-[10px] font-normal text-muted-foreground">
                        @{pedido.live}
                      </p>
                    )}
                  </TableCell>
                  <TableCell>
                    <p className="max-w-[125px] truncate text-xs font-medium">
                      {pedido.conjunto}
                    </p>
                    <p className="max-w-[140px] truncate text-[10px] text-muted-foreground">
                      {[pedido.tipo, pedido.color, pedido.talla, pedido.codigo]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </TableCell>
                  <TableCell className="text-right text-xs tabular-nums">
                    {money.format(pedido.total)}
                  </TableCell>
                  <TableCell className="pr-3">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium whitespace-nowrap",
                        estadoHistorial[pedido.estado],
                      )}
                    >
                      {pedido.estado}
                    </span>
                  </TableCell>
                  <TableCell className="pr-2 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          aria-label={`Acciones para el pedido ${pedido.numero}`}
                        >
                          <MoreVCircle size={14} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuLabel>
                          #{pedido.numero}
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Eye size={16} />
                          Ver detalle
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Printer size={16} />
                          Imprimir
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download size={16} />
                          Descargar
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
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Sheet
        open={!esEscritorio && registroAbierto}
        onOpenChange={setRegistroAbierto}
      >
        <SheetContent
          side="bottom"
          showCloseButton={false}
          className="max-h-[90svh] gap-0 overflow-y-auto rounded-t-2xl border-t p-0 pb-[env(safe-area-inset-bottom)]"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Registrar pedido</SheetTitle>
            <SheetDescription>Completa los datos del pedido.</SheetDescription>
          </SheetHeader>
          <div
            aria-hidden="true"
            className="mx-auto mt-2 mb-1 h-1.5 w-10 shrink-0 rounded-full bg-muted-foreground/30"
          />
          {tarjetaRegistro}
        </SheetContent>
      </Sheet>
    </div>
  );
}
