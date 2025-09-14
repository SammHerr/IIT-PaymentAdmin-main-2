/*
"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";

type Role = "admin" | "coordinador" | "cajero";
type User = { id: number; nombre: string; email: string; rol: Role };

type Ctx = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthCtx = createContext<Ctx>({} as any);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();*/

  /*useEffect(() => {
    api.get("/auth/me")
      .then(res => setUser(res.data.user))
      .catch(() => setUser(null))
      
      .finally(() => setLoading(false));
  }, []);*/


/*
  useEffect(() => {
  api.get("/auth/me", { withCredentials: true })
    .then(res => setUser(res.data.user))
    .catch(() => {
      setUser(null);
      // ← IMPORTANTE: si /me falla, limpia la bandera
      document.cookie = "hasAuth=; path=/; max-age=0";
    })
    .finally(() => setLoading(false));
}, []);


  const login = async (email: string, password: string) => {
    await api.post("/auth/login", { email, password });
    // Marca no sensible para middleware del FE (NO contiene el token)
    document.cookie = `hasAuth=1; path=/; max-age=${8 * 60 * 60}`;
    const me = await api.get("/auth/me");
    setUser(me.data.user);
    router.replace("/");
  };

  const logout = async () => {
    await api.post("/auth/logout");
    document.cookie = "hasAuth=; path=/; max-age=0";
    setUser(null);
    router.replace("/login");
  };
¨*/

// ...

/*
  useEffect(() => {
    api.get("/auth/me", { withCredentials: true })
      .then(res => setUser(res.data.user))
      .catch(() => {
        setUser(null);
        document.cookie = "hasAuth=; path=/; max-age=0";
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    await api.post("/auth/login", { email, password }, { withCredentials: true }); // ← credenciales
    // Bandera no sensible para el middleware del FE
    document.cookie = `hasAuth=1; path=/; max-age=${8 * 60 * 60}`;

    // Recupera al usuario con la cookie HttpOnly
    const me = await api.get("/auth/me", { withCredentials: true }); // ← credenciales
    setUser(me.data.user);
    router.replace("/");
  };

  const logout = async () => {
    await api.post("/auth/logout", {}, { withCredentials: true }); // ← credenciales
    document.cookie = "hasAuth=; path=/; max-age=0";
    setUser(null);
    router.replace("/login");
  };
// ...

  return (
    <AuthCtx.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);
*/

"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

type Role = "admin" | "coordinador" | "cajero";

export type User = {
  id: number;
  nombre: string;
  email: string;
  rol: Role;
};

type AuthContextShape = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

// Contexto
const AuthCtx = createContext<AuthContextShape | undefined>(undefined);

// Hook de acceso al contexto
export function useAuth(): AuthContextShape {
  const ctx = useContext(AuthCtx);
  if (!ctx) {
    throw new Error("useAuth must be used within <AuthProvider>");
  }
  return ctx;
}

// Provider
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Rehidratación al cargar la app (usa cookie HttpOnly "token")
  useEffect(() => {
    api
      .get("/auth/me", { withCredentials: true })
      .then((res) => setUser(res.data.user as User))
      .catch(() => {
        setUser(null);
        // Limpia bandera no sensible para el middleware del FE
        document.cookie = "hasAuth=; path=/; max-age=0";
      })
      .finally(() => setLoading(false));
  }, []);

  /*
  // Login: guarda cookie HttpOnly en el backend + bandera hasAuth en FE
  const login = async (email: string, password: string) => {
    // 1) Solicitud de login (setea cookie "token" HttpOnly en el backend)
    const res = await api.post(
      "/auth/login",
      { email, password },
      { withCredentials: true }
    );

    // 2) Bandera no sensible para que el middleware del FE permita navegar
    document.cookie = `hasAuth=1; path=/; max-age=${8 * 60 * 60}`;

    // 3) Desbloqueo inmediato usando el user que ya devuelve /auth/login
    const userFromLogin = (res?.data?.data?.user ?? null) as User | null;
    if (userFromLogin) setUser(userFromLogin);

    // 4) Confirmación con /auth/me (si falla, mantén el user previo)
    try {
      const me = await api.get("/auth/me", { withCredentials: true });
      if (me?.data?.user) setUser(me.data.user as User);
    } catch {
      // No vuelvas a bloquear si falla; ya tienes user del paso 3
    }

    // 5) Redirección al dashboard
    router.replace("/");
  };
*/

const login = async (email: string, password: string) => {
  // 1) Autentica y recibe user del backend
  const res = await api.post("/auth/login", { email, password }, { withCredentials: true });

  // 2) Bandera para el middleware del FE (no es el token)
  document.cookie = `hasAuth=1; path=/; max-age=${8 * 60 * 60}`;

  // 3) Actualiza el contexto **antes** de navegar
  setUser(res.data.data.user);

  // 4) Navega y fuerza refresco de componentes del árbol
  router.replace("/");
  // 👇 Esto es la clave para eliminar el “flicker”
  setTimeout(() => router.refresh(), 0);

  // (Opcional) validación silenciosa con /me después
  try {
    const me = await api.get("/auth/me", { withCredentials: true });
    setUser(me.data.user);
  } catch {
    setUser(null);
  }
};





  // Logout: limpia cookie HttpOnly en backend y bandera en FE
  const logout = async () => {
    await api.post("/auth/logout", {}, { withCredentials: true });
    document.cookie = "hasAuth=; path=/; max-age=0";
    setUser(null);
    router.replace("/login");
  };

  return (
    <AuthCtx.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthCtx.Provider>
  );
}
