"use client";
import { useAuth } from "@/app/(auth)/auth-context";
import { usePathname } from "next/navigation";


export default function SidebarLock() {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  if (loading || user) return null;
  if (pathname.startsWith("/login")) return null; // ← no bloquear login

    // SIEMPRE bloquear la barra lateral en /login
  const isLogin = pathname === "/login";
  const mustBlock = isLogin || loading || !user;
  if (!mustBlock) return null;


  // Capa transparente que intercepta clicks sobre el sidebar
  //return <div className="fixed left-0 top-0 h-screen w-[280px] z-[60] cursor-not-allowed" />
  return (
    <div
      className="fixed left-0 top-0 h-screen w-[280px] z-[9999] pointer-events-auto cursor-not-allowed"
      aria-hidden="true"
    />);
}
/*
// components/SidebarLock.tsx
"use client";
import { useAuth } from "@/app/(auth)/auth-context";
import { usePathname } from "next/navigation";

export default function SidebarLock() {
  const { user, loading } = useAuth();
  const pathname = usePathname();

  const isLogin = pathname === "/login";
  const mustBlock = isLogin || loading || !user;

  if (!mustBlock) return null;

  // ajusta el ancho si tu sidebar no es de 16rem (256px)
  return (
    <div
      className="fixed left-0 top-0 h-screen w-[16rem] z-[9999] pointer-events-auto cursor-not-allowed"
      aria-hidden="true"
    />
  );
}
*/