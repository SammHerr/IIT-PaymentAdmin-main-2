// hooks/useStudents.ts

/*
import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";

type Params = {
  search?: string;
  page?: number;
  limit?: number;
  estatus?: string;
  plan_id?: number;
};

export function useStudents(params: Params) {
  const [data, setData] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetcher = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/alumnos", {
        params,
        withCredentials: true,
      });
      setData(res.data?.data ?? []);
    } catch (e: any) {
      setError(e?.response?.data?.error ?? "Error cargando alumnos");
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetcher();
  }, [fetcher]);

  return { data, loading, error, refetch: fetcher };
}
*/
/*
"use client";

import useSWR from "swr";
import qs from "query-string";
import { useMemo } from "react";
import { api } from "@/lib/api";

const fetcher = (url: string) => api.get(url).then(r => r.data);

export type StudentsQuery = {
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  estatus?: string;
  plan_id?: number;
  fecha_inicio_desde?: string;
  fecha_inicio_hasta?: string;
};

export function useStudents(params: StudentsQuery) {
  // Key MEMOIZADA: si params es igual, no refetch
  const key = useMemo(() => {
    return `/alumnos?${qs.stringify(params, {
      skipNull: true,
      skipEmptyString: true,
    })}`;
  }, [
    params.search,
    params.page,
    params.limit,
    params.sortBy,
    params.sortOrder,
    params.estatus,
    params.plan_id,
    params.fecha_inicio_desde,
    params.fecha_inicio_hasta,
  ]);

  const swr = useSWR(key, fetcher, {
    // Evita revalidar al enfocar o reconectar
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    // Deduplica llamadas rápidas a la misma key
    dedupingInterval: 15000,
    // Mantiene la data anterior en paginación/filtros
    keepPreviousData: true,
  });

  return swr;
}
*/

/*
// hooks/useStudents.ts
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { api } from "@/lib/api";

export function useStudents(initial = { search: "", page: 1, limit: 50 }) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState(initial);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/alumnos", {
        params: {
          search: query.search || undefined,
          page: query.page || 1,
          limit: query.limit || 50,
          sortBy: "id",
          sortOrder: "desc",
        },
        // <- lo importante para evitar 304 sin body
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
        // opcional: aceptar 304 pero no romper
        validateStatus: (s) => (s >= 200 && s < 300) || s === 304,
      });

      if (res.status === 304) {
        // si por cualquier motivo llegara 304, conservamos lo que ya teníamos
        setLoading(false);
        return;
      }

      const payload = res.data;
      setData(Array.isArray(payload?.data) ? payload.data : []);
    } catch (e: any) {
      setError(e?.message ?? "Error cargando alumnos");
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    load();
  }, [load]);

  const refetch = useCallback(() => load(), [load]);

  return {
    data,
    loading,
    error,
    setQuery,
    refetch,
  };
}
*/

// hooks/useStudents.ts
import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";

export type StudentsQuery = {
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
};

type ApiListResponse<T> = {
  success: boolean;
  data: T[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export function useStudents(
  initial: StudentsQuery = { page: 1, limit: 50, sortBy: "id", sortOrder: "desc" }
) {
  const [query, setQuery] = useState<StudentsQuery>(initial);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<ApiListResponse<any>>("/alumnos", {
        params: {
          search: query.search || undefined,
          page: query.page ?? 1,
          limit: query.limit ?? 50,
          sortBy: query.sortBy ?? "id",
          sortOrder: query.sortOrder ?? "desc",
        },
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
        validateStatus: (s) => (s >= 200 && s < 300) || s === 304,
      });

      // Si viniera 304, mantenemos el dataset previo
      if (res.status !== 304) {
        setData(Array.isArray(res.data?.data) ? res.data.data : []);
      }
    } catch (e: any) {
      setError(e?.message ?? "Error cargando alumnos");
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    load();
  }, [load]);

  const refetch = useCallback(() => load(), [load]);

  return { data, loading, error, query, setQuery, refetch };
}
