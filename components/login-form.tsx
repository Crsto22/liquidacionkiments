"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowRight,
  Eye,
  EyeClosed,
  InfoCircle,
  Lock,
  Mailbox,
} from "reicon-react";

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice("Formulario listo. Conecta aquí tu API de autenticación.");
  }

  return (
    <Card className="w-full max-w-sm gap-5 py-6 ring-0 dark:bg-transparent">
      <CardHeader className="px-5">
        <CardTitle className="text-center text-xl">Iniciar sesión</CardTitle>
      </CardHeader>

      <CardContent className="px-5">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Correo electrónico</Label>
            <div className="relative">
              <Mailbox
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="tu@empresa.com"
                className="h-10 pl-9"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <div className="relative">
              <Lock
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••"
                className="h-10 px-9"
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="absolute right-1 top-1/2 -translate-y-1/2 text-muted-foreground"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={
                  showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                }
              >
                {showPassword ? <EyeClosed size={16} /> : <Eye size={16} />}
              </Button>
            </div>
          </div>

          <Button type="submit" size="lg" className="w-full">
            Iniciar sesión
            <ArrowRight size={16} data-icon="inline-end" />
          </Button>

          {notice && (
            <p
              role="status"
              className="flex items-start gap-2 rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground"
            >
              <InfoCircle size={14} className="mt-0.5 shrink-0" />
              {notice}
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
