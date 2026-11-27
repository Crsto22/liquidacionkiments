"use client";

import {
  useCallback,
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
  ArrowDown,
  ChevronDown,
  Download,
  Eye,
  Gift,
  MoreVCircle,
  Plus,
  Printer,
  Receipt5,
  Settings,
  Trash,
  X,
} from "reicon-react";

const money = new Intl.NumberFormat("es-PE", {
  style: "currency",
  currency: "PEN",
  maximumFractionDigits: 0,
});

const panel =
  "overflow-hidden bg-[#f6f8f7] ring-0 dark:bg-zinc-900 dark:ring-1 dark:ring-white/10";

const avatarColors = [
  {
    avatar: "bg-rose-500/15 text-rose-600 dark:text-rose-400",
    text: "text-rose-600 dark:text-rose-400",
  },
  {
    avatar: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
    text: "text-blue-600 dark:text-blue-400",
  },
  {
    avatar: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
    text: "text-emerald-600 dark:text-emerald-400",
  },
  {
    avatar: "bg-violet-500/15 text-violet-600 dark:text-violet-400",
    text: "text-violet-600 dark:text-violet-400",
  },
  {
    avatar: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
    text: "text-amber-600 dark:text-amber-400",
  },
  {
    avatar: "bg-sky-500/15 text-sky-600 dark:text-sky-400",
    text: "text-sky-600 dark:text-sky-400",
  },
];

function colorAvatar(usuario: string) {
  let hash = 0;

  for (const char of usuario.trim().toLowerCase()) {
    hash = (hash * 31 + char.charCodeAt(0)) | 0;
  }

  return avatarColors[Math.abs(hash) % avatarColors.length];
}

const palabrasIgnoradas = new Set([
  "hola",
  "holaa",
  "holi",
  "buenas",
  "buenos",
  "dias",
  "tardes",
  "noches",
  "como",
  "estas",
  "estan",
  "que",
  "quien",
  "cual",
  "cuando",
  "donde",
  "porque",
  "por",
  "para",
  "con",
  "sin",
  "los",
  "las",
  "una",
  "uno",
  "unos",
  "unas",
  "del",
  "al",
  "el",
  "la",
  "de",
  "en",
  "mi",
  "me",
  "te",
  "se",
  "su",
  "tu",
  "yo",
  "nosotros",
  "nosotras",
  "ustedes",
  "ellos",
  "ellas",
  "este",
  "esta",
  "esto",
  "estos",
  "estas",
  "ese",
  "esa",
  "eso",
  "esos",
  "esas",
  "son",
  "soy",
  "eres",
  "somos",
  "estoy",
  "estamos",
  "tiene",
  "tienen",
  "tengo",
  "hay",
  "si",
  "no",
  "pero",
  "mas",
  "menos",
  "muy",
  "bien",
  "mal",
  "gracias",
  "porfa",
  "porfavor",
  "favor",
  "talla",
  "tallas",
  "precio",
  "precios",
  "cuanto",
  "cuesta",
  "sale",
  "vale",
  "queda",
  "quedan",
  "color",
  "colores",
  "modelo",
  "modelos",
  "conjunto",
  "conjuntos",
  "blazer",
  "pantalon",
  "pantalones",
  "vestido",
  "vestidos",
  "casaca",
  "chompa",
  "polo",
  "short",
  "falda",
  "enterizo",
  "enterizos",
  "stock",
  "pedido",
  "pedidos",
  "informe",
  "informes",
  "info",
  "whatsapp",
  "wsp",
  "numero",
  "celular",
  "delivery",
  "envio",
  "envios",
  "pago",
  "pagos",
  "yape",
  "plin",
  "transferencia",
  "tarjeta",
  "efectivo",
  "llevo",
  "quiero",
  "quisiera",
  "necesito",
  "busco",
  "vende",
  "venden",
  "comprar",
  "compra",
  "compro",
  "llevar",
  "ultimo",
  "ultima",
  "ultimos",
  "ultimas",
  "primera",
  "primero",
  "segunda",
  "segundo",
  "tercera",
  "tercero",
  "jaja",
  "jajaja",
  "jajajaja",
  "jsjs",
  "sii",
  "siii",
  "noo",
  "dale",
  "oka",
  "okay",
  "ok",
  "buen",
  "buena",
  "lindo",
  "linda",
  "bonito",
  "bonita",
  "hermoso",
  "hermosa",
  "calidad",
  "grande",
  "mediano",
  "oferta",
  "ofertas",
  "rebaja",
  "promo",
  "promocion",
  "sorteo",
  "live",
  "vivo",
  "directo",
  "dime",
  "dame",
  "manda",
  "pasame",
  "senor",
  "senora",
  "amigo",
  "amiga",
]);

function normalizarTexto(texto: string) {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function palabrasDeMensaje(texto: string) {
  const limpio = normalizarTexto(texto)
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/@[\p{L}\p{N}_.]+/gu, " ")
    .replace(/\d{3,}/g, " ")
    .replace(/[^\p{L}\s]/gu, " ");

  return new Set(
    limpio
      .split(/\s+/)
      .filter(
        (palabra) =>
          palabra.length >= 3 && !palabrasIgnoradas.has(palabra),
      ),
  );
}

type Ganador = {
  id: string;
  user: string;
  initials: string;
  avatar?: string;
  codigo: string;
};

type DeteccionSorteo = {
  palabra: string;
  ganadores: Ganador[];
};

type RondaSorteo = {
  id: string;
  palabra: string;
  ganadores: Ganador[];
  abierta: boolean;
};

const posicionesEstilos: Record<number, string> = {
  1: "bg-amber-500 text-white",
  2: "bg-zinc-400 text-white",
  3: "bg-orange-600 text-white",
};



function detectarSorteos(
  mensajes: ChatMessage[],
  cortes: Map<string, number>,
) {
  const porPalabra = new Map<
    string,
    {
      mensajes: ChatMessage[];
      usuarios: Set<string>;
      gatillo: number;
    }
  >();

  mensajes.forEach((mensaje, index) => {
    if (!extraerCodigo(mensaje.message)) return;

    const usuario = mensaje.user.trim().toLowerCase();

    for (const palabra of palabrasDeMensaje(mensaje.message)) {
      const corte = cortes.get(palabra) ?? 0;
      if (mensaje.creadoEn <= corte) continue;

      let registro = porPalabra.get(palabra);

      if (!registro) {
        registro = { mensajes: [], usuarios: new Set(), gatillo: -1 };
        porPalabra.set(palabra, registro);
      }

      registro.mensajes.push(mensaje);
      registro.usuarios.add(usuario);

      if (registro.usuarios.size === 2 && registro.gatillo === -1) {
        registro.gatillo = index;
      }
    }
  });

  return [...porPalabra.entries()]
    .filter(([, registro]) => registro.usuarios.size >= 2)
    .sort((a, b) => a[1].gatillo - b[1].gatillo)
    .map(([palabra, registro]): DeteccionSorteo => {
      const usuariosVistos = new Set<string>();
      const ganadores: Ganador[] = [];

      for (const mensaje of registro.mensajes) {
        const usuario = mensaje.user.trim().toLowerCase();
        if (usuariosVistos.has(usuario)) continue;
        usuariosVistos.add(usuario);

        const codigo = extraerCodigo(mensaje.message);
        if (!codigo) continue;

        ganadores.push({
          id: mensaje.id,
          user: mensaje.user,
          initials: mensaje.initials,
          avatar: mensaje.avatar,
          codigo,
        });

        if (ganadores.length === 3) break;
      }

      return { palabra, ganadores };
    });
}

type ChatMessage = {
  id: string;
  user: string;
  initials: string;
  avatar?: string;
  message: string;
  time: string;
  creadoEn: number;
};

type LiveMessage = {
  user: string;
  avatar?: string;
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
  conteoCodigos,
  mensajesRegistrados,
  onUsarCodigo,
}: {
  username: string;
  active: boolean;
  conteoCodigos: Record<string, number>;
  mensajesRegistrados: string[];
  onUsarCodigo: (codigo: string, mensajeId: string) => void;
}) {
  const [mensajes, setMensajes] = useState<ChatMessage[]>([]);
  const [estado, setEstado] = useState<EstadoConexion>("conectando");
  const [errorLive, setErrorLive] = useState<string | null>(null);
  const [intento, setIntento] = useState(0);
  const [filtroChat, setFiltroChat] = useState<"todos" | "codigos">("todos");
  const scrollRef = useRef<HTMLDivElement>(null);
  const siguiendo = useRef(true);
  const bajando = useRef(false);
  const [mostrarIrAlFinal, setMostrarIrAlFinal] = useState(false);
  const [rondas, setRondas] = useState<RondaSorteo[]>([]);
  const rondasRef = useRef<RondaSorteo[]>([]);
  const timersRondas = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map(),
  );
  const cortesRef = useRef<Map<string, number>>(new Map());
  const mensajesRef = useRef<ChatMessage[]>([]);

  const actualizarRondas = useCallback((siguientes: RondaSorteo[]) => {
    rondasRef.current = siguientes;
    setRondas(siguientes);
  }, []);

  const quitarRonda = useCallback(
    (id: string) => {
      const ronda = rondasRef.current.find((item) => item.id === id);

      if (ronda) {
        cortesRef.current.set(ronda.palabra, Date.now());
      }

      const timer = timersRondas.current.get(id);
      if (timer) {
        clearTimeout(timer);
        timersRondas.current.delete(id);
      }

      const restantes = rondasRef.current.filter((item) => item.id !== id);

      if (restantes.length > 0 && ronda?.abierta) {
        restantes[restantes.length - 1] = {
          ...restantes[restantes.length - 1],
          abierta: true,
        };
      }

      actualizarRondas(restantes);
    },
    [actualizarRondas],
  );

  const mostrarRonda = useCallback(
    (deteccion: DeteccionSorteo) => {
      const id = crypto.randomUUID();
      const nueva: RondaSorteo = {
        id,
        palabra: deteccion.palabra,
        ganadores: deteccion.ganadores.slice(0, 3),
        abierta: true,
      };

      actualizarRondas([
        ...rondasRef.current.map((ronda) => ({ ...ronda, abierta: false })),
        nueva,
      ]);

      const timer = setTimeout(() => {
        timersRondas.current.delete(id);
        quitarRonda(id);
      }, 120_000);

      timersRondas.current.set(id, timer);
    },
    [actualizarRondas, quitarRonda],
  );

  const alternarRonda = useCallback(
    (id: string) => {
      actualizarRondas(
        rondasRef.current.map((ronda) =>
          ronda.id === id
            ? { ...ronda, abierta: !ronda.abierta }
            : ronda,
        ),
      );
    },
    [actualizarRondas],
  );

  const cerrarAcordeon = useCallback(
    (id: string) => {
      actualizarRondas(
        rondasRef.current.map((ronda) =>
          ronda.id === id ? { ...ronda, abierta: false } : ronda,
        ),
      );
    },
    [actualizarRondas],
  );

  const procesarSorteo = useCallback(
    (mensajes: ChatMessage[]) => {
      const detecciones = detectarSorteos(mensajes, cortesRef.current);
      const ultima = rondasRef.current[rondasRef.current.length - 1];

      if (ultima) {
        const deteccionActual = detecciones.find(
          (deteccion) => deteccion.palabra === ultima.palabra,
        );

        if (deteccionActual) {
          const nuevos = deteccionActual.ganadores.filter(
            (ganador) =>
              !ultima.ganadores.some(
                (existente) =>
                  existente.user.trim().toLowerCase() ===
                  ganador.user.trim().toLowerCase(),
              ),
          );

          if (nuevos.length > 0 && ultima.ganadores.length < 3) {
            const actualizada: RondaSorteo = {
              ...ultima,
              ganadores: [...ultima.ganadores, ...nuevos].slice(0, 3),
            };

            actualizarRondas([
              ...rondasRef.current.slice(0, -1),
              actualizada,
            ]);
          }
        }
      }

      const palabrasActivas = new Set(
        rondasRef.current.map((ronda) => ronda.palabra),
      );
      const nueva = detecciones.find(
        (deteccion) =>
          !palabrasActivas.has(deteccion.palabra) &&
          deteccion.ganadores.length > 0,
      );

      if (nueva) mostrarRonda(nueva);
    },
    [actualizarRondas, mostrarRonda],
  );

  const agregarMensaje = useCallback(
    (mensaje: ChatMessage) => {
      const siguiente = [...mensajesRef.current.slice(-49), mensaje];
      mensajesRef.current = siguiente;
      setMensajes(siguiente);
      procesarSorteo(siguiente);
    },
    [procesarSorteo],
  );

  useEffect(() => {
    const timers = timersRondas.current;

    return () => {
      for (const timer of timers.values()) {
        clearTimeout(timer);
      }

      timers.clear();
    };
  }, []);

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
        const nuevo: ChatMessage = {
          id: crypto.randomUUID(),
          user,
          initials: user.slice(0, 2).toUpperCase(),
          avatar: data.avatar?.trim() || undefined,
          message: comment,
          time: data.time ?? "",
          creadoEn: Date.now(),
        };
        agregarMensaje(nuevo);
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
  }, [username, intento, agregarMensaje]);

  useEffect(() => {
    const contenedor = scrollRef.current;
    if (contenedor && siguiendo.current) {
      contenedor.scrollTop = contenedor.scrollHeight;
    }
  }, [mensajes]);

  useEffect(() => {
    const contenedor = scrollRef.current;
    if (!contenedor) return;

    contenedor.scrollTop = contenedor.scrollHeight;
    siguiendo.current = true;
    bajando.current = false;
  }, [filtroChat]);

  useEffect(() => {
    if (!active) return;

    const contenedor = scrollRef.current;
    if (contenedor && siguiendo.current) {
      contenedor.scrollTop = contenedor.scrollHeight;
    }
  }, [active]);

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
    mensajesRef.current = [];
    for (const timer of timersRondas.current.values()) {
      clearTimeout(timer);
    }
    timersRondas.current.clear();
    cortesRef.current.clear();
    actualizarRondas([]);
    setErrorLive(null);
    setEstado("conectando");
    setIntento((value) => value + 1);
    siguiendo.current = true;
    bajando.current = false;
    setMostrarIrAlFinal(false);
  }

  function cambiarFiltro(nuevo: "todos" | "codigos") {
    setFiltroChat(nuevo);
    siguiendo.current = true;
    bajando.current = false;
    setMostrarIrAlFinal(false);
  }

  function alDesplazar() {
    const contenedor = scrollRef.current;
    if (!contenedor) return;

    const distancia =
      contenedor.scrollHeight - contenedor.scrollTop - contenedor.clientHeight;
    const alFondo = distancia < 80;

    if (bajando.current) {
      if (alFondo) {
        bajando.current = false;
        siguiendo.current = true;
        setMostrarIrAlFinal(false);
      }
      return;
    }

    siguiendo.current = alFondo;
    setMostrarIrAlFinal(!alFondo);
  }

  function irAlFinal() {
    const contenedor = scrollRef.current;
    if (!contenedor) return;

    bajando.current = true;
    siguiendo.current = true;
    setMostrarIrAlFinal(false);

    contenedor.scrollTo({ top: contenedor.scrollHeight, behavior: "smooth" });

    window.setTimeout(() => {
      if (!siguiendo.current) return;

      const actual = scrollRef.current;
      if (!actual) return;

      actual.scrollTop = actual.scrollHeight;
      bajando.current = false;
    }, 400);
  }

  return (
    <div
      className={cn(
        "relative min-h-0 flex-1 flex-col",
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
            onClick={() => cambiarFiltro("todos")}
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
            onClick={() => cambiarFiltro("codigos")}
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

      <div
        ref={scrollRef}
        onScroll={alDesplazar}
        className="flex-1 overflow-y-auto p-3 sm:p-4"
      >
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
            {mensajesVisibles.map((mensaje) => {
              const codigoChat = extraerCodigo(mensaje.message);
              const veces = codigoChat ? (conteoCodigos[codigoChat] ?? 0) : 0;
              const registrado = mensajesRegistrados.includes(mensaje.id);
              const avatar = colorAvatar(mensaje.user);

              return (
                <div key={mensaje.id} className="flex gap-2.5">
                  <div
                    className={cn(
                      "relative flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full text-[11px] font-semibold",
                      avatar.avatar,
                    )}
                  >
                    {mensaje.initials}
                    {mensaje.avatar && (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={mensaje.avatar}
                          alt={mensaje.user}
                          loading="lazy"
                          decoding="async"
                          referrerPolicy="no-referrer"
                          className="absolute inset-0 size-full object-cover"
                          onError={(event) => {
                            event.currentTarget.style.display = "none";
                          }}
                        />
                      </>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2">
                      <p
                        className={cn(
                          "truncate text-xs font-medium",
                          avatar.text,
                        )}
                      >
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
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                          <p className="font-mono text-sm font-semibold tracking-widest text-emerald-700 dark:text-emerald-400">
                            {codigoChat}
                          </p>
                          {registrado ? (
                            <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
                              <CheckCircle size={14} />
                              Registrado
                            </span>
                          ) : (
                            <div className="flex items-center gap-2">
                              <Button
                                type="button"
                                size="sm"
                                onClick={() =>
                                  onUsarCodigo(codigoChat, mensaje.id)
                                }
                              >
                                Registrar
                              </Button>
                              {veces > 0 && (
                                <span
                                  title={`${veces} registro${veces === 1 ? "" : "s"} con este código`}
                                  className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-muted px-1.5 text-[10px] font-semibold text-muted-foreground tabular-nums"
                                >
                                  {veces}
                                </span>
                              )}
                            </div>
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

      {mostrarIrAlFinal && (
        <Button
          type="button"
          size="icon"
          onClick={irAlFinal}
          aria-label="Ir a los últimos mensajes"
          title="Ir a los últimos mensajes"
          className="absolute bottom-4 right-4 z-10 rounded-full shadow-lg animate-in fade-in slide-in-from-bottom-2"
        >
          <ArrowDown size={16} />
        </Button>
      )}

      {active && rondas.length > 0 && (
        <div className="absolute left-1/2 top-20 z-20 flex max-h-[calc(100%-6rem)] w-[calc(100%-1rem)] max-w-[360px] -translate-x-1/2 flex-col gap-2 overflow-y-auto overscroll-contain">
          {rondas.map((sorteo) => (
            <Card
              key={sorteo.id}
              className="gap-0 overflow-hidden rounded-xl border border-border/60 bg-popover py-0 text-popover-foreground shadow-xl ring-0 animate-in fade-in slide-in-from-top-2 duration-200"
            >
              <div className="flex items-center gap-1 border-b px-2 py-1.5">
                <button
                  type="button"
                  onClick={() => alternarRonda(sorteo.id)}
                  aria-expanded={sorteo.abierta}
                  className="flex min-w-0 flex-1 items-center gap-2 rounded-md px-1 py-1 text-left transition-colors hover:bg-muted/60"
                >
                  <p className="text-xs font-semibold">Ganadores</p>
                  <span className="truncate text-[11px] text-muted-foreground">
                    “{sorteo.palabra}”
                  </span>
                  <ChevronDown
                    size={14}
                    className={cn(
                      "ml-auto shrink-0 transition-transform duration-200",
                      sorteo.abierta && "rotate-180",
                    )}
                  />
                </button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => quitarRonda(sorteo.id)}
                  aria-label="Cerrar sorteo"
                  title="Cerrar sorteo"
                  className="shrink-0"
                >
                  <X size={14} />
                </Button>
              </div>

              {sorteo.abierta && (
                <div className="grid grid-cols-3 gap-2 p-3 animate-in fade-in duration-150">
                  {[0, 1, 2].map((indice) => {
                    const ganador = sorteo.ganadores[indice];
                    const avatar = ganador
                      ? colorAvatar(ganador.user)
                      : null;

                    return (
                      <div
                        key={indice}
                        className="flex min-w-0 flex-col items-center gap-1.5 rounded-lg bg-[#f6f8f7] px-1.5 py-2 text-center dark:bg-zinc-900"
                      >
                        <div className="relative mt-2">
                          <span
                            className={cn(
                              "absolute -top-2 left-1/2 z-10 flex size-5 -translate-x-1/2 items-center justify-center rounded-full text-[10px] font-bold tabular-nums ring-2 ring-[#f6f8f7] dark:ring-zinc-900",
                              posicionesEstilos[indice + 1],
                            )}
                          >
                            {indice + 1}
                          </span>

                          {ganador ? (
                            <div
                              className={cn(
                                "relative flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-full text-[11px] font-semibold",
                                avatar?.avatar,
                              )}
                            >
                              {ganador.initials}
                              {ganador.avatar && (
                                <>
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src={ganador.avatar}
                                    alt={ganador.user}
                                    loading="lazy"
                                    decoding="async"
                                    referrerPolicy="no-referrer"
                                    className="absolute inset-0 size-full object-cover"
                                    onError={(event) => {
                                      event.currentTarget.style.display =
                                        "none";
                                    }}
                                  />
                                </>
                              )}
                            </div>
                          ) : (
                            <div className="flex size-11 shrink-0 items-center justify-center rounded-full border border-dashed border-border text-[11px] text-muted-foreground">
                              —
                            </div>
                          )}
                        </div>

                        {ganador ? (
                          <>
                            <p
                              className={cn(
                                "w-full truncate text-[11px] font-semibold",
                                avatar?.text,
                              )}
                            >
                              {ganador.user}
                            </p>
                            <p className="font-mono text-[10px] tracking-widest text-muted-foreground">
                              {ganador.codigo}
                            </p>
                            {mensajesRegistrados.includes(ganador.id) ? (
                              <span className="mt-0.5 flex h-6 w-full items-center justify-center gap-1 rounded-md bg-emerald-500/10 text-[10px] font-medium text-emerald-700 dark:text-emerald-400">
                                <CheckCircle size={11} />
                                Registrado
                              </span>
                            ) : (
                              <Button
                                type="button"
                                size="xs"
                                onClick={() => {
                                  onUsarCodigo(ganador.codigo, ganador.id);
                                  cerrarAcordeon(sorteo.id);
                                }}
                                aria-label={`Registrar pedido de ${ganador.user}`}
                                title="Registrar pedido"
                                className="mt-0.5 w-full px-1 text-[10px]"
                              >
                                Registrar
                              </Button>
                            )}
                          </>
                        ) : (
                          <p className="text-[11px] text-muted-foreground">
                            Esperando…
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
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
  const [regalo, setRegalo] = useState(false);
  const [historialPrecios, setHistorialPrecios] = useState<number[]>([
    85, 80, 120, 150,
  ]);
  const [ajustesAbierto, setAjustesAbierto] = useState(false);
  const [mostrarColor, setMostrarColor] = useState(true);
  const [mostrarTalla, setMostrarTalla] = useState(true);
  const [mostrarTipo, setMostrarTipo] = useState(true);
  const [lives, setLives] = useState<string[]>([]);
  const [liveActivo, setLiveActivo] = useState(0);
  const [nuevoLive, setNuevoLive] = useState("");
  const [agregarLiveAbierto, setAgregarLiveAbierto] = useState(false);
  const [registroAbierto, setRegistroAbierto] = useState(false);
  const [mensajesRegistrados, setMensajesRegistrados] = useState<string[]>([]);
  const [mensajePendiente, setMensajePendiente] = useState<{
    id: string;
    codigo: string;
  } | null>(null);
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

  const conteoCodigos: Record<string, number> = {};
  for (const pedido of pedidos) {
    conteoCodigos[pedido.codigo] = (conteoCodigos[pedido.codigo] ?? 0) + 1;
  }

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
    (regalo || Number(precio) > 0);

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

  function usarCodigo(codigoChat: string, mensajeId: string) {
    setCodigo(codigoChat);
    setMensajePendiente({ id: mensajeId, codigo: codigoChat });
    if (window.matchMedia("(max-width: 1023px)").matches) {
      setRegistroAbierto(true);
    } else {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  function registrar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!formularioValido) return;

    const nombre = conjunto.trim();
    setHistorial((prev) =>
      [
        nombre,
        ...prev.filter((item) => item.toLowerCase() !== nombre.toLowerCase()),
      ].slice(0, 6),
    );

    const monto = regalo ? 0 : Number(precio);
    if (!regalo) {
      setHistorialPrecios((prev) =>
        [monto, ...prev.filter((valor) => valor !== monto)].slice(0, 6),
      );
    }

    agregarPedido({
      codigo,
      conjunto: nombre,
      tipo,
      color,
      talla,
      total: monto,
      live: lives[liveActivo] ?? "",
      regalo,
    });

    if (mensajePendiente && mensajePendiente.codigo === codigo) {
      setMensajesRegistrados((prev) =>
        prev.includes(mensajePendiente.id)
          ? prev
          : [...prev, mensajePendiente.id],
      );
    }
    setMensajePendiente(null);

    const resumen = [
      lives[liveActivo] ? `@${lives[liveActivo]}` : "",
      tipo,
      conjunto.trim(),
      color.trim(),
      talla ? `Talla ${talla}` : "",
      regalo ? "Regalo" : money.format(monto),
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
    setRegalo(false);
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
          <div className="flex items-center justify-between gap-2">
            <Label htmlFor="codigo">Código del cliente</Label>
            {codigoValido && (conteoCodigos[codigo] ?? 0) > 0 && (
              <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-700 dark:text-emerald-400">
                <CheckCircle size={12} />
                Registrado
                <span className="rounded-full bg-emerald-500/15 px-1.5 py-0.5 font-semibold tabular-nums">
                  {conteoCodigos[codigo]}
                </span>
              </span>
            )}
          </div>
          <Input
            id="codigo"
            value={codigo}
            onChange={(event) => {
              const valor = event.target.value.replace(/\D/g, "").slice(0, 4);
              setCodigo(valor);
              if (mensajePendiente && valor !== mensajePendiente.codigo) {
                setMensajePendiente(null);
              }
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
          <div className="flex items-center justify-between gap-2">
            <Label htmlFor="precio">Precio</Label>
            {regalo && (
              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-700 dark:text-emerald-400">
                <Gift size={12} weight="Filled" />
                Gratis
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                S/
              </span>
              <Input
                id="precio"
                type="number"
                min="0"
                step="1"
                inputMode="numeric"
                value={precio}
                onChange={(event) => {
                  setRegalo(false);
                  setPrecio(event.target.value);
                }}
                placeholder="320"
                className="h-10 pl-9"
                disabled={regalo}
                required
              />
            </div>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => {
                if (regalo) {
                  setRegalo(false);
                  setPrecio("");
                } else {
                  setRegalo(true);
                  setPrecio("0");
                }
              }}
              aria-pressed={regalo}
              aria-label={regalo ? "Quitar regalo" : "Marcar como regalo"}
              title={regalo ? "Quitar regalo" : "Pedido de regalo"}
              className={cn(
                "size-10 shrink-0",
                regalo &&
                  "border-emerald-500/40 bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/20 dark:text-emerald-400",
              )}
            >
              <Gift size={17} weight={regalo ? "Filled" : "Outline"} />
            </Button>
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
                  setRegalo(false);
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
    <div className="grid w-full grid-cols-1 gap-4 p-0 max-lg:fixed max-lg:inset-x-0 max-lg:top-14 max-lg:bottom-0 max-lg:z-10 max-lg:block max-lg:min-h-0 max-lg:gap-0 max-lg:pb-[env(safe-area-inset-bottom)] lg:grid-cols-[260px_minmax(0,1fr)_300px] lg:p-6 xl:grid-cols-[320px_minmax(0,1fr)_380px] 2xl:grid-cols-[390px_minmax(0,1fr)_470px]">
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
                      className="shrink-0 max-lg:size-8"
                    >
                      <Plus size={14} className="size-4 lg:size-3" />
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
                  className="max-lg:size-8 lg:hidden"
                >
                  <Receipt5 size={14} className="size-4" />
                </Button>
              </div>
            </div>

            {lives.map((usuario, index) => (
              <LiveChatPanel
                key={usuario}
                username={usuario}
                active={index === liveActivo}
                conteoCodigos={conteoCodigos}
                mensajesRegistrados={mensajesRegistrados}
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
                    {pedido.regalo ? (
                      <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                        Regalo
                      </span>
                    ) : (
                      money.format(pedido.total)
                    )}
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
          className="max-h-[90svh] gap-0 overflow-y-auto overscroll-contain rounded-t-2xl border-t p-0 pb-[env(safe-area-inset-bottom)] [scrollbar-color:var(--border)_transparent] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-track]:bg-transparent"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Registrar pedido</SheetTitle>
            <SheetDescription>Completa los datos del pedido.</SheetDescription>
          </SheetHeader>
          <div
            aria-hidden="true"
            className="mx-auto mt-2 mb-1 h-1.5 w-10 shrink-0 rounded-full bg-muted-foreground/30"
          />
          <div className="shrink-0">{tarjetaRegistro}</div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
