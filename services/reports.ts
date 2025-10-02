// services/reports.ts
import { api } from '@/lib/api'

export type DateRange = { fecha_desde?: string; fecha_hasta?: string }

export async function getResumen(range: DateRange) {
  const { data } = await api.get('/reportes/resumen', { params: range })
  return data as {
    success: boolean
    data: {
      tasa_cobranza: number
      ingresos_totales: number
      moratorios_totales: number
      alumnos_con_atraso: number
      esperado: number
      cobrado: number
    }
  }
}

export async function getCobranza(params: DateRange & { estatus?: string; plan_id?: number }) {
  const { data } = await api.get('/reportes/cobranza', { params })
  return data as {
    success: boolean
    data: {
      porTipo: { tipo_pago: string; monto: number }[]
      porMetodo: { forma_pago: string; monto: number }[]
      porPlan: { plan: string; monto: number }[]
    }
  }
}

export async function getAlumnos(range: DateRange) {
  const { data } = await api.get('/reportes/alumnos', { params: range })
  return data as {
    success: boolean
    data: {
      distribucion: { estatus: string; cantidad: number }[]
      topAtraso: {
        alumno_id: number
        matricula: string | null
        nombre_alumno: string
        mensualidades_vencidas: number
        monto_vencido: number
        dias_max_vencido: number
      }[]
    }
  }
}

export async function getPlanes(range: DateRange) {
  const { data } = await api.get('/reportes/planes', { params: range })
  return data as {
    success: boolean
    data: {
      revenuePorPlan: { id: number; nombre: string; revenue: number }[]
      activosPorPlan: { id: number; nombre: string; alumnos_activos: number }[]
    }
  }
}
