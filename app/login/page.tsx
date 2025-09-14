/*

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })

    if (res.ok) {
      const data = await res.json()
      console.log("Login success:", data)

      // Aquí podrías guardar token en localStorage o cookies
      localStorage.setItem("token", data.token)
      localStorage.setItem("role", data.role)

      // Redirige al dashboard
      window.location.href = "/"
    } else {
      setError("Credenciales inválidas, intenta de nuevo.")
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl shadow-md w-96"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Iniciar Sesión</h2>

        {error && (
          <p className="text-red-600 text-sm mb-4 text-center">{error}</p>
        )}

        <input
          type="email"
          placeholder="Correo"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
          required
        />
        <Button type="submit" className="w-full">
          Entrar
        </Button>
      </form>
    </div>
  )
}
*/

/*
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/login`,
        {
          method: "POST",
          credentials: "include",              // ← importante para cookie HttpOnly
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );

      if (!res.ok) {
        const payload = await res.json().catch(() => null);
        throw new Error(payload?.error || "Credenciales inválidas, intenta de nuevo.");
      }

      // Marca no sensible para que el middleware del FE deje pasar
      document.cookie = `hasAuth=1; path=/; max-age=${8 * 60 * 60}`;

      // (Opcional) validar sesión
      // await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/me`, { credentials: "include" });

      // Redirige al dashboard (app/page.tsx)
      router.replace("/");
    } catch (err: any) {
      setError(err?.message ?? "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">Iniciar Sesión</h2>

        {error && <p className="text-red-600 text-sm mb-4 text-center">{error}</p>}

        <input
          type="email"
          placeholder="Correo"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
          required
        />
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Ingresando..." : "Entrar"}
        </Button>
      </form>
    </div>
  );
}
*/

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "../(auth)/auth-context"; // 👈 usa el contexto

export default function LoginPage() {
  const { login } = useAuth(); // 👈 usaremos esta función
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      // 👇 usa tu login del AuthProvider (hace /auth/login, /auth/me, setUser y redirect)
      await login(email, password);
    } catch (err: any) {
      setError(err?.message ?? "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  // Bloquea el sidebar en /login (puede quedarse aquí; no usa styled-jsx)
  const css = `
    [data-sidebar="sidebar"],
    [data-sidebar="rail"],
    [data-sidebar="trigger"] {
      pointer-events: none !important;
      user-select: none !important;
    }
    [data-sidebar="menu-button"],
    [data-sidebar="menu-sub-button"],
    [data-sidebar="menu-action"] {
      pointer-events: none !important;
      user-select: none !important;
      opacity: 0.5 !important;
      cursor: not-allowed !important;
    }
  `;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-md w-96">
          <h2 className="text-2xl font-bold mb-6 text-center">Iniciar Sesión</h2>

          {error && <p className="text-red-600 text-sm mb-4 text-center">{error}</p>}

          <input
            type="email"
            placeholder="Correo"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 mb-4 border rounded"
            required
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 mb-4 border rounded"
            required
          />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Ingresando..." : "Entrar"}
          </Button>
        </form>
      </div>
    </>
  );
}
