"use client";

import Link from "next/link";
import { useAuth } from "@/app/(auth)/auth-context";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

export default function UserMenu() {
  const { user, logout } = useAuth();

  if (!user) {
    return (
      <Link href="/login" className="inline-flex items-center justify-center rounded-md border px-3 py-2">
        Iniciar Sesión
      </Link>
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">{user.nombre ?? user.email}</Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-40 p-0">
        <button
          className="w-full text-left px-3 py-2 hover:bg-gray-100"
          onClick={async () => {
            await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/logout`, {
              method: "POST",
              credentials: "include",
            });
            // borra bandera de sesión para el middleware/locks
            document.cookie = "hasAuth=; path=/; max-age=0";
            // vuelve al estado inicial bloqueado
            location.href = "/"; // o router.replace("/")
          }}
        >
          Cerrar sesión
        </button>
      </PopoverContent>
    </Popover>
  );
}
