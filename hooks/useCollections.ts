/*
'use client'
import useSWR from 'swr'
import { api } from '@/lib/api'

export type MesKey = string // 'YYYY-MM'

export function useResumenCobranza(mes: MesKey) {
  return useSWR(['cobranza/resumen', mes], async ([, m]) => {
    const { data } = await api.get('/cobranza/resumen', { params: { mes: m } })
    return data.data as {
      mes: string
      monto_esperado: number
      monto_cobrado: number
      porcentaje: number
      moratorios_acumulados: number
      alumnos_morosos: number
    }
  }, { revalidateOnFocus: false })
}

export type FilaCobranza = {
  alumno_id: number
  alumno_nombre: string
  matricula: string
  telefono: string | null
  mensualidad_id: number
  monto: number
  fecha_vencimiento: string
  dias_vencido: number
  moratorio: number
  total_a_pagar: number
}

export function useListaCobranza(mes: MesKey, page = 1, pageSize = 20) {
  return useSWR(['cobranza/lista', mes, page, pageSize], async ([, m, p, ps]) => {
    const { data } = await api.get('/cobranza/lista', { params: { mes: m, page: p, pageSize: ps } })
    return data as {
      success: boolean
      data: FilaCobranza[]
      meta: { page: number; pageSize: number; total: number; totalPages: number }
    }
  }, { revalidateOnFocus: false })
}

export function useIngresosCobranza(mes: MesKey) {
  return useSWR(['cobranza/ingresos', mes], async ([, m]) => {
    const { data } = await api.get('/cobranza/ingresos', { params: { mes: m } })
    return data.data as {
      normales: number
      moratorios: number
      inscripciones: number
      otros: number
    }
  }, { revalidateOnFocus: false })
}

export async function exportarCobranza(mes: MesKey) {
  const res = await api.get('/cobranza/exportar', {
    params: { mes },
    responseType: 'blob'
  })
  const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `cobranza_${mes}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
*/

'use client';

import useSWR from 'swr';
import { api } from '@/lib/api';

export type CollectionsFilters = {
  mes?: number;
  anio?: number;
  page?: number;
  pageSize?: number;
  sortBy?: 'vencimiento' | 'alumno' | 'monto';
  sortDir?: 'asc' | 'desc';
};

export function useCollections(filters: CollectionsFilters) {
  const { data, error, isLoading, mutate } = useSWR(
    ['/api/cobranza', filters],
    async ([, f]) => {
      const res = await api.get('/cobranza', { params: f });
      return res.data as {
        success: boolean;
        kpis: {
          esperado: number;
          cobrado: number;
          porcentaje_cobranza: number;
          moratorio: number;
          inscripciones: number;
          alumnos_total: number;
          alumnos_con_deuda: number;
        };
        data: Array<{
          alumno_id: number;
          alumno_nombre: string;
          matricula: string | null;
          telefono: string | null;
          mensualidad_id: number;
          monto: number;
          fecha_vencimiento: string;
          dias_vencido: number;
          moratorio_estimado: number;
        }>;
        meta: {
          page: number;
          pageSize: number;
          total: number;
          totalPages: number;
          range: { desde: string; hasta: string };
          sortBy: string;
          sortDir: string;
        };
      };
    },
    { revalidateOnFocus: false }
  );

  return {
    kpis: data?.kpis,
    list: data?.data ?? [],
    meta: data?.meta,
    isLoading,
    error: error ? 'Error cargando cobranza' : null,
    mutate,
  };
}
