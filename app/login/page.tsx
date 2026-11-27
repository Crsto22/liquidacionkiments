import type { Metadata } from "next";
import Image from "next/image";
import { LoginForm } from "@/components/login-form";
import { ThemeToggle } from "@/components/theme-toggle";
import { Receipt5 } from "reicon-react";

export const metadata: Metadata = {
  title: "Iniciar sesión · Liquidación Kiments",
  description: "Accede a tu panel de liquidaciones de Kiments.",
};

export default function LoginPage() {
  return (
    <main className="grid min-h-svh lg:grid-cols-2">
      <section className="relative hidden overflow-hidden lg:block">
        <Image
          src="/img/login/fondo1.jpg"
          alt="Boutique de ropa con blazers y prendas colgadas en percheros"
          fill
          priority
          sizes="50vw"
          className="object-cover"
        />
      </section>

      <section className="flex flex-col bg-background px-6 py-8 sm:px-10 lg:px-14">
        <header className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Receipt5 size={20} weight="Filled" />
          </div>
          <div>
            <p className="text-sm font-semibold leading-tight">
              Liquidación Kiments
            </p>
            <p className="text-xs text-muted-foreground">Panel de gestión</p>
          </div>
          <ThemeToggle className="ml-auto" />
        </header>

        <div className="flex flex-1 items-center justify-center py-10">
          <LoginForm />
        </div>
      </section>
    </main>
  );
}
