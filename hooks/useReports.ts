'use client'

import useSWR from 'swr'
import { getResumen, getCobranza, getAlumnos, getPlanes, type DateRange } from '@/services/reports'

const swrCfg = { revalidateOnFocus: false }

export function useReporteResumen(range: DateRange) {
  return useSWR(['/reportes/resumen', range], () => getResumen(range), swrCfg)
}

export function useReporteCobranza(range: DateRange & { estatus?: string; plan_id?: number }) {
  return useSWR(['/reportes/cobranza', range], () => getCobranza(range), swrCfg)
}

export function useReporteAlumnos(range: DateRange) {
  return useSWR(['/reportes/alumnos', range], () => getAlumnos(range), swrCfg)
}

export function useReportePlanes(range: DateRange) {
  return useSWR(['/reportes/planes', range], () => getPlanes(range), swrCfg)
}
