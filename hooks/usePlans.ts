"use client";

import useSWR from "swr";
import { api } from "@/lib/api";

export type Plan = {
  id: number;
  nombre: string;
  descripcion?: string | null;
  numero_mensualidades: number;
  precio_mensualidad: number;
  precio_inscripcion: number;
  vigencia_meses: number;
  extension_meses: number;
  activo: number; // 0 | 1
};

type ListResponse = {
  ok: boolean;
  data: Plan[];
};

const fetcher = async (url: string): Promise<ListResponse> => {
  const { data } = await api.get(url);
  return data;
};

export function usePlans() {
  const { data, error, isLoading, mutate } = useSWR("/planes", fetcher, {
    revalidateOnFocus: false,
  });

  return {
    list: data?.data ?? [],
    isLoading,
    error,
    mutate,
  };
}

export async function createPlan(payload: Partial<Plan>) {
  const { data } = await api.post("/planes", payload);
  return data;
}

export async function updatePlan(id: number, payload: Partial<Plan>) {
  const { data } = await api.put(`/planes/${id}`, payload);
  return data;
}

export async function deletePlan(id: number) {
  const { data } = await api.delete(`/planes/${id}`);
  return data;
}
