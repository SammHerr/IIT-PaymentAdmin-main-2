
/*
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
*/

// app/hooks/useStudents.ts
"use client";
import useSWR from "swr";
import { useState } from "react";
import { api } from "@/lib/api";

type Query = {
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
};

const fetcher = async (url: string) => {
  const { data } = await api.get(url, { withCredentials: true });
  return data;
};

export function useStudents(initial: Query = {}) {
  const [query, setQuery] = useState<Query>({
    page: 1,
    limit: 10,
    sortBy: "id",
    sortOrder: "desc",
    ...initial,
  });

  const qs = new URLSearchParams(
    Object.entries(query).reduce((acc, [k, v]) => {
      if (v !== undefined && v !== null && v !== "") acc[k] = String(v);
      return acc;
    }, {} as Record<string, string>)
  ).toString();

  const { data, error, isLoading, mutate } = useSWR(`/alumnos?${qs}`, fetcher, {
    revalidateOnFocus: false,
  });

  return {
    data: data?.data ?? [],
    isLoading,
    error: error ? "Demasiadas solicitudes. Intenta de nuevo más tarde." : null,
    mutate,
    setQuery,
  };
}
