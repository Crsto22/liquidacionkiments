type ApiItem = {
  producto?: {
    idProducto?: number;
    nombre?: string;
    slug?: string;
    imagenGlobalUrl?: string | null;
    imagenGlobalThumbUrl?: string | null;
  };
  color?: {
    nombre?: string;
  };
  imagenPrincipal?: {
    url?: string;
    urlThumb?: string;
  } | null;
  precioMinimo?: number;
};

type ApiPagina = {
  content?: ApiItem[];
  totalPages?: number;
};

export type ProductoCatalogo = {
  id: number;
  nombre: string;
  slug: string;
  precio: number;
  imagen: string;
  color: string;
};

const BASE = "https://kiments.com.pe/api/public/ecommerce/productos";

async function fetchPagina(page: number): Promise<ApiPagina> {
  const response = await fetch(
    `${BASE}?page=${page}&size=100&soloDisponibles=true`,
    {
      headers: { Accept: "application/json" },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(`Kiments respondió ${response.status}`);
  }

  return (await response.json()) as ApiPagina;
}

export async function GET() {
  try {
    const primera = await fetchPagina(1);
    const totalPages = Math.min(primera.totalPages ?? 1, 3);
    const paginas: ApiPagina[] = [primera];

    for (let page = 2; page <= totalPages; page += 1) {
      paginas.push(await fetchPagina(page));
    }

    const productos = new Map<number, ProductoCatalogo>();

    for (const pagina of paginas) {
      for (const item of pagina.content ?? []) {
        const producto = item.producto;
        if (!producto?.idProducto || productos.has(producto.idProducto)) {
          continue;
        }

        const imagen =
          item.imagenPrincipal?.urlThumb ??
          item.imagenPrincipal?.url ??
          producto.imagenGlobalThumbUrl ??
          producto.imagenGlobalUrl;

        if (!imagen || !producto.nombre) continue;

        productos.set(producto.idProducto, {
          id: producto.idProducto,
          nombre: producto.nombre,
          slug: producto.slug ?? "",
          precio: Number(item.precioMinimo ?? 0),
          imagen,
          color: item.color?.nombre ?? "",
        });
      }
    }

    return Response.json({ productos: [...productos.values()] });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "No se pudo cargar el catálogo de Kiments",
      },
      { status: 502 },
    );
  }
}
