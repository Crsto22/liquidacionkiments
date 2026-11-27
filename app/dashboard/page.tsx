import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  ArrowDown,
  ArrowUp,
  CartShopping,
  DollarCircle,
  Hanger,
  MoneyRecive,
} from "reicon-react";

const money = new Intl.NumberFormat("es-PE", {
  style: "currency",
  currency: "PEN",
  maximumFractionDigits: 0,
});

const panel =
  "overflow-hidden bg-[#f6f8f7] ring-0 dark:bg-[#0f172a] dark:ring-1 dark:ring-white/10";

type Kpi = {
  label: string;
  value: string;
  change: string;
  trend: "up" | "down" | "neutral";
  icon: ReactNode;
  spark: number[];
  iconClass: string;
  badgeClass: string;
  accent: string;
  cardClass?: string;
  featured?: boolean;
  inverted?: boolean;
};

const kpis: Kpi[] = [
  {
    label: "Ventas totales",
    value: money.format(456789),
    change: "+20,1%",
    trend: "up",
    icon: <DollarCircle size={18} />,
    spark: [26, 30, 27, 38, 34, 46, 44, 55],
    iconClass: "bg-white/15 text-white",
    badgeClass: "bg-white/20 text-white",
    accent: "text-white/80",
    featured: true,
  },
  {
    label: "Pedidos",
    value: "342",
    change: "+12,4%",
    trend: "up",
    icon: <CartShopping size={18} />,
    spark: [30, 32, 28, 35, 40, 38, 45, 48],
    iconClass: "bg-white/10 text-teal-300",
    badgeClass: "bg-emerald-400/15 text-emerald-300",
    accent: "text-teal-300",
    cardClass: "bg-zinc-700 text-white ring-0 dark:bg-zinc-700 dark:ring-white/10",
    inverted: true,
  },
  {
    label: "Liquidaciones pendientes",
    value: "8",
    change: "Por pagar",
    trend: "neutral",
    icon: <MoneyRecive size={18} />,
    spark: [40, 38, 42, 41, 39, 43, 42, 45],
    iconClass: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
    badgeClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    accent: "text-violet-500",
  },
  {
    label: "Productos vendidos",
    value: "1,654",
    change: "-4,2%",
    trend: "down",
    icon: <Hanger size={18} />,
    spark: [55, 52, 48, 50, 44, 40, 36, 32],
    iconClass: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
    badgeClass: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
    accent: "text-rose-500",
  },
];

const categorias = [
  { label: "Blazers", value: 42, color: "#3b82f6" },
  { label: "Vestidos", value: 26, color: "#ef4444" },
  { label: "Pantalones", value: 20, color: "#10b981" },
  { label: "Accesorios", value: 12, color: "#a855f7" },
];

const meses = [
  { mes: "Jun", vendido: 42, restante: 18 },
  { mes: "Jul", vendido: 55, restante: 12 },
  { mes: "Ago", vendido: 38, restante: 22 },
  { mes: "Sep", vendido: 62, restante: 8 },
  { mes: "Oct", vendido: 48, restante: 16 },
  { mes: "Nov", vendido: 68, restante: 6 },
];

const maxMes = Math.max(...meses.map((m) => m.vendido + m.restante));

const crecimiento = [18, 26, 22, 35, 30, 48, 42, 55, 48, 62, 58, 72, 66, 80, 74, 88];

function Sparkline({
  data,
  className,
}: {
  data: number[];
  className?: string;
}) {
  const width = 88;
  const height = 32;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data
    .map((value, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - 3 - ((value - min) / range) * (height - 6);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={cn("h-8 w-24 shrink-0", className)}
      fill="none"
      aria-hidden="true"
    >
      <polyline
        points={points}
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Donut() {
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const gap = 8;

  const segments = categorias.map((categoria, index) => {
    const length = (categoria.value / 100) * circumference;
    const offset = categorias
      .slice(0, index)
      .reduce(
        (sum, item) => sum + (item.value / 100) * circumference,
        0,
      );

    return {
      ...categoria,
      dash: Math.max(length - gap, 0),
      offset,
    };
  });

  return (
    <svg viewBox="0 0 100 100" className="size-44 -rotate-90" aria-hidden="true">
      <circle
        cx="50"
        cy="50"
        r={radius}
        fill="none"
        strokeWidth={10}
        className="stroke-muted"
      />
      {segments.map((segmento) => (
        <circle
          key={segmento.label}
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke={segmento.color}
          strokeWidth={10}
          strokeLinecap="round"
          strokeDasharray={`${segmento.dash} ${circumference - segmento.dash}`}
          strokeDashoffset={-segmento.offset}
        />
      ))}
    </svg>
  );
}

function AreaChart({ data }: { data: number[] }) {
  const width = 320;
  const height = 150;
  const pad = 10;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const x = (index: number) =>
    pad + (index / (data.length - 1)) * (width - pad * 2);
  const y = (value: number) =>
    height - pad - ((value - min) / range) * (height - pad * 2);

  const line = data
    .map(
      (value, index) =>
        `${index === 0 ? "M" : "L"}${x(index).toFixed(1)},${y(value).toFixed(1)}`,
    )
    .join(" ");
  const area = `${line} L${x(data.length - 1).toFixed(1)},${height} L${x(0).toFixed(1)},${height} Z`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="h-44 w-full"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2dd4bf" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#2dd4bf" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#areaFill)" />
      <path
        d={line}
        fill="none"
        stroke="#2dd4bf"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

export default function DashboardPage() {
  return (
    <div className="w-full space-y-6 p-4 sm:p-6">
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="grid gap-4 sm:grid-cols-2 lg:col-span-2">
          {kpis.map((kpi) => (
            <Card
              key={kpi.label}
              className={cn(
                panel,
                kpi.cardClass,
                kpi.featured
                  ? "border-0 bg-blue-950 text-white ring-0 dark:bg-blue-950"
                  : "",
              )}
            >
              <CardHeader>
                <div
                  className={cn(
                    "flex size-9 items-center justify-center rounded-lg",
                    kpi.iconClass,
                  )}
                >
                  {kpi.icon}
                </div>
                <CardAction>
                  <Badge
                    variant="outline"
                    className={cn(
                      "h-6 gap-1 rounded-full border-0 px-2 text-[11px]",
                      kpi.badgeClass,
                    )}
                  >
                    {kpi.trend === "up" && <ArrowUp size={11} />}
                    {kpi.trend === "down" && <ArrowDown size={11} />}
                    {kpi.change}
                  </Badge>
                </CardAction>
              </CardHeader>
              <CardContent className="flex items-end justify-between gap-3">
                <div className="min-w-0">
                  <p
                    className={cn(
                      "text-xs",
                      kpi.featured || kpi.inverted
                        ? "text-white/70"
                        : "text-muted-foreground",
                    )}
                  >
                    {kpi.label}
                  </p>
                  <p className="mt-1.5 truncate text-2xl font-semibold tracking-tight">
                    {kpi.value}
                  </p>
                </div>
                <Sparkline data={kpi.spark} className={kpi.accent} />
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className={cn(panel, "flex flex-col")}>
          <CardHeader>
            <CardTitle>Ventas por categoría</CardTitle>
            <CardDescription>Distribución del mes</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col items-center justify-center gap-6">
            <div className="relative">
              <Donut />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-semibold tracking-tight">
                  1,654
                </span>
                <span className="text-[11px] text-muted-foreground">
                  prendas
                </span>
              </div>
            </div>
            <div className="grid w-full grid-cols-2 gap-x-6 gap-y-3">
              {categorias.map((categoria) => (
                <div
                  key={categoria.label}
                  className="flex items-center gap-2 text-xs"
                >
                  <span
                    className="size-2 shrink-0 rounded-full"
                    style={{ backgroundColor: categoria.color }}
                  />
                  <span className="text-muted-foreground">
                    {categoria.label}
                  </span>
                  <span className="ml-auto font-medium tabular-nums">
                    {categoria.value}%
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <Card className={cn(panel, "lg:col-span-3")}>
          <CardHeader className="border-b pb-3">
            <CardTitle>Ventas vs. meta</CardTitle>
            <CardDescription>Meta mensual del período</CardDescription>
            <CardAction>
              <div className="hidden items-center gap-3 text-[11px] text-muted-foreground sm:flex">
                <span className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-blue-500" />
                  Vendido
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-emerald-500" />
                  Restante
                </span>
              </div>
            </CardAction>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="relative h-48">
              <div className="pointer-events-none absolute inset-x-0 top-2 flex h-40 flex-col justify-between">
                {[0, 1, 2, 3].map((line) => (
                  <div key={line} className="border-t border-border/60" />
                ))}
              </div>
              <div className="relative flex h-full items-end gap-2 sm:gap-4">
                {meses.map((mes) => (
                  <div
                    key={mes.mes}
                    className="flex h-full flex-1 flex-col items-center justify-end gap-2"
                  >
                    <div className="flex h-40 w-full flex-col justify-end gap-[3px]">
                      <div
                        className="w-full rounded-t-md bg-emerald-500"
                        style={{
                          height: `${(mes.restante / maxMes) * 100}%`,
                        }}
                        title={`Restante: ${mes.restante} mil`}
                      />
                      <div
                        className="w-full rounded-b-md bg-blue-500"
                        style={{
                          height: `${(mes.vendido / maxMes) * 100}%`,
                        }}
                        title={`Vendido: ${mes.vendido} mil`}
                      />
                    </div>
                    <span className="text-[11px] text-muted-foreground">
                      {mes.mes}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={cn(panel, "lg:col-span-2")}>
          <CardHeader className="border-b pb-3">
            <CardTitle>Crecimiento de ventas</CardTitle>
            <CardDescription>Últimos 30 días</CardDescription>
            <CardAction>
              <Badge
                variant="outline"
                className="h-6 gap-1 rounded-full border-0 bg-emerald-500/10 px-2 text-[11px] text-emerald-600 dark:text-emerald-400"
              >
                <ArrowUp size={11} />
                +18,6%
              </Badge>
            </CardAction>
          </CardHeader>
          <CardContent className="pt-4">
            <AreaChart data={crecimiento} />
            <div className="mt-2 flex justify-between text-[11px] text-muted-foreground">
              <span>01 nov</span>
              <span>15 nov</span>
              <span>30 nov</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
