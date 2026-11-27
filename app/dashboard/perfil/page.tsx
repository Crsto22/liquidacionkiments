"use client";

import { useState, type FormEvent } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  Calendar,
  Camera,
  CheckCircle,
  Mailbox,
  Phone,
  ShieldCheck,
} from "reicon-react";

const panel =
  "overflow-hidden bg-[#f6f8f7] ring-0 dark:bg-[#0f172a] dark:ring-1 dark:ring-white/10";

export default function PerfilPage() {
  const [nombre, setNombre] = useState("Cristhofer Leonardo");
  const [email, setEmail] = useState("arturo200512@gmail.com");
  const [telefono, setTelefono] = useState("+51 987 654 321");
  const [guardado, setGuardado] = useState(false);

  const [actual, setActual] = useState("");
  const [nueva, setNueva] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [claveEstado, setClaveEstado] = useState<string | null>(null);
  const [errorClave, setErrorClave] = useState<string | null>(null);

  function guardarDatos(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setGuardado(true);
  }

  function cambiarClave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (nueva !== confirmar) {
      setErrorClave("Las contraseñas no coinciden.");
      setClaveEstado(null);
      return;
    }
    setErrorClave(null);
    setClaveEstado("Contraseña actualizada correctamente.");
    setActual("");
    setNueva("");
    setConfirmar("");
  }

  return (
    <div className="w-full p-4 sm:p-6">
      <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <Card className={cn(panel, "h-fit gap-0 py-0 lg:sticky lg:top-20")}>
          <div className="flex flex-col items-center gap-3 px-6 py-6 text-center">
            <div className="flex size-20 items-center justify-center rounded-full bg-zinc-900 text-2xl font-semibold text-white dark:bg-zinc-700">
              {nombre.charAt(0).toUpperCase()}
            </div>
            <div className="space-y-1">
              <p className="text-lg font-semibold leading-tight">{nombre}</p>
              <p className="text-sm text-muted-foreground">{email}</p>
            </div>
            <Badge
              variant="outline"
              className="border-0 bg-secondary text-secondary-foreground"
            >
              <ShieldCheck size={12} />
              Administrador
            </Badge>
            <Button variant="outline" size="sm" className="mt-1 w-full">
              <Camera size={14} data-icon="inline-start" />
              Cambiar foto
            </Button>
          </div>

          <Separator />

          <div className="space-y-4 px-6 py-5">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 text-muted-foreground">
                <Mailbox size={16} />
              </span>
              <div className="min-w-0">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  Correo
                </p>
                <p className="truncate text-sm">{email}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="mt-0.5 text-muted-foreground">
                <Phone size={16} />
              </span>
              <div className="min-w-0">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  Teléfono
                </p>
                <p className="text-sm">{telefono}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="mt-0.5 text-muted-foreground">
                <Calendar size={16} />
              </span>
              <div className="min-w-0">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  Miembro desde
                </p>
                <p className="text-sm">Noviembre 2026</p>
              </div>
            </div>

            <div className="flex items-center justify-between border-t pt-4">
              <span className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="size-1.5 rounded-full bg-emerald-500" />
                Estado
              </span>
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                Activo
              </span>
            </div>
          </div>
        </Card>

        <div className="space-y-6">
          <Card className={cn(panel, "gap-0 py-0")}>
            <div className="border-b px-6 py-4">
              <p className="text-sm font-semibold">Información personal</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Actualiza tus datos de contacto.
              </p>
            </div>

            <form onSubmit={guardarDatos} className="space-y-5 p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="nombre">Nombre completo</Label>
                  <Input
                    id="nombre"
                    value={nombre}
                    onChange={(event) => {
                      setNombre(event.target.value);
                      setGuardado(false);
                    }}
                    className="h-10"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Correo electrónico</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);
                      setGuardado(false);
                    }}
                    className="h-10"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="telefono">Teléfono</Label>
                  <Input
                    id="telefono"
                    value={telefono}
                    onChange={(event) => {
                      setTelefono(event.target.value);
                      setGuardado(false);
                    }}
                    className="h-10"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Button type="submit">Guardar cambios</Button>
                {guardado && (
                  <span
                    role="status"
                    className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400"
                  >
                    <CheckCircle size={14} />
                    Cambios guardados
                  </span>
                )}
              </div>
            </form>
          </Card>

          <Card className={cn(panel, "gap-0 py-0")}>
            <div className="border-b px-6 py-4">
              <p className="text-sm font-semibold">Seguridad</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Cambia tu contraseña de acceso.
              </p>
            </div>

            <form onSubmit={cambiarClave} className="max-w-xl space-y-5 p-6">
              <div className="space-y-2">
                <Label htmlFor="actual">Contraseña actual</Label>
                <Input
                  id="actual"
                  type="password"
                  value={actual}
                  onChange={(event) => {
                    setActual(event.target.value);
                    setClaveEstado(null);
                    setErrorClave(null);
                  }}
                  className="h-10"
                  autoComplete="current-password"
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="nueva">Nueva contraseña</Label>
                  <Input
                    id="nueva"
                    type="password"
                    value={nueva}
                    onChange={(event) => {
                      setNueva(event.target.value);
                      setClaveEstado(null);
                      setErrorClave(null);
                    }}
                    className="h-10"
                    autoComplete="new-password"
                    minLength={8}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmar">Confirmar contraseña</Label>
                  <Input
                    id="confirmar"
                    type="password"
                    value={confirmar}
                    onChange={(event) => {
                      setConfirmar(event.target.value);
                      setClaveEstado(null);
                      setErrorClave(null);
                    }}
                    className="h-10"
                    autoComplete="new-password"
                    minLength={8}
                    required
                  />
                </div>
              </div>

              <p className="text-[11px] text-muted-foreground">
                Usa al menos 8 caracteres.
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <Button type="submit">Actualizar contraseña</Button>
                {claveEstado && (
                  <span
                    role="status"
                    className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400"
                  >
                    <CheckCircle size={14} />
                    {claveEstado}
                  </span>
                )}
                {errorClave && (
                  <span className="text-xs font-medium text-rose-600 dark:text-rose-400">
                    {errorClave}
                  </span>
                )}
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
