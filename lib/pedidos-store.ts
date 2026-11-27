export type EstadoPedido = "Pendiente" | "Pagado" | "Anulado";

export type Pedido = {
  id: string;
  numero: string;
  fecha: string;
  fechaISO: string;
  codigo: string;
  conjunto: string;
  tipo?: string;
  color: string;
  talla: string;
  total: number;
  estado: EstadoPedido;
  live?: string;
};

const STORAGE_KEY = "kiments:pedidos";
const CHANGE_EVENT = "kiments:pedidos-change";

export const pedidosIniciales: Pedido[] = [
  {
    id: "p-1042",
    numero: "1042",
    fecha: "12 nov 2026",
    fechaISO: "2026-11-12",
    codigo: "4821",
    conjunto: "Blazer oversize",
    color: "Beige",
    talla: "M",
    total: 320,
    estado: "Pendiente",
  },
  {
    id: "p-1041",
    numero: "1041",
    fecha: "12 nov 2026",
    fechaISO: "2026-11-12",
    codigo: "7392",
    conjunto: "Conjunto lila",
    color: "Lila",
    talla: "S",
    total: 480,
    estado: "Pagado",
  },
  {
    id: "p-1040",
    numero: "1040",
    fecha: "11 nov 2026",
    fechaISO: "2026-11-11",
    codigo: "1056",
    conjunto: "Vestido floral",
    color: "Rojo",
    talla: "M",
    total: 260,
    estado: "Pendiente",
  },
  {
    id: "p-1039",
    numero: "1039",
    fecha: "11 nov 2026",
    fechaISO: "2026-11-11",
    codigo: "2450",
    conjunto: "Pantalón palazzo",
    color: "Negro",
    talla: "L",
    total: 380,
    estado: "Pagado",
  },
  {
    id: "p-1038",
    numero: "1038",
    fecha: "10 nov 2026",
    fechaISO: "2026-11-10",
    codigo: "8093",
    conjunto: "Blazer negro",
    color: "Negro",
    talla: "S",
    total: 390,
    estado: "Anulado",
  },
];

let cache: Pedido[] | null = null;

function basePedidos(): Pedido[] {
  return pedidosIniciales.map((pedido) => ({ ...pedido }));
}

export function getPedidos(): Pedido[] {
  if (typeof window === "undefined") return pedidosIniciales;
  if (cache) return cache;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    cache = raw ? (JSON.parse(raw) as Pedido[]) : basePedidos();
  } catch {
    cache = basePedidos();
  }

  return cache;
}

export function getPedidosServidor(): Pedido[] {
  return pedidosIniciales;
}

export function subscribePedidos(callback: () => void) {
  if (typeof window === "undefined") return () => {};

  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) {
      cache = null;
      callback();
    }
  };

  window.addEventListener(CHANGE_EVENT, callback);
  window.addEventListener("storage", onStorage);

  return () => {
    window.removeEventListener(CHANGE_EVENT, callback);
    window.removeEventListener("storage", onStorage);
  };
}

export function agregarPedido(input: {
  codigo: string;
  conjunto: string;
  tipo?: string;
  color: string;
  talla: string;
  total: number;
  live?: string;
}): Pedido {
  const actuales = getPedidos();
  const maximo = actuales.reduce(
    (max, pedido) => Math.max(max, Number(pedido.numero) || 1000),
    1000,
  );
  const ahora = new Date();
  const live = input.live?.trim().replace(/^@/, "").toLowerCase() || undefined;

  const nuevo: Pedido = {
    id: crypto.randomUUID(),
    numero: String(maximo + 1),
    fecha: ahora.toLocaleDateString("es-PE", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
    fechaISO: ahora.toISOString().slice(0, 10),
    codigo: input.codigo,
    conjunto: input.conjunto,
    tipo: input.tipo,
    color: input.color,
    talla: input.talla,
    total: input.total,
    estado: "Pendiente",
    live,
  };

  const siguiente = [nuevo, ...actuales];
  cache = siguiente;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(siguiente));
  } catch {
    // Si el almacenamiento no está disponible, el pedido vive en memoria.
  }

  window.dispatchEvent(new Event(CHANGE_EVENT));
  return nuevo;
}
