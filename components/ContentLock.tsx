"use client";
import { useAuth } from "@/app/(auth)/auth-context";
import { usePathname } from "next/navigation";

export default function ContentLock() {
  const { user, loading } = useAuth();
  const pathname = usePathname();

  if (loading || user) return null;
  if (pathname.startsWith("/login")) return null; // ← no bloquear login

  // Intercepta interacción sobre el contenido (no el header)
  return <div className="fixed left-[280px] right-0 top-16 bottom-0 z-[50] cursor-not-allowed" />;
}

/*
"use client";
import { useAuth } from "@/app/(auth)/auth-context";
import { usePathname } from "next/navigation";

export default function ContentLock() {
  const { user, loading } = useAuth();
  const pathname = usePathname();

  if (pathname === "/login") return null; // ← no bloquea el form
  if (loading || !user)
    return <div className="fixed left-[280px] right-0 top-16 bottom-0 z-[50] cursor-not-allowed" />;
  return null;
}
*/