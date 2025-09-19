'use client'

import useSWR from 'swr'
import { api } from '@/lib/api'

/* =========================
 * Tipos compartidos
 * ========================= */

export type FormaPago =
  | 'efectivo'
  | 'transferencia'
  | 'tarjeta_debito'
  | 'tarjeta_credito'
  | 'cheque'
  | 'otro'

export type TipoPago =
  | 'mensualidad'
  | 'inscripcion'
  | 'moratorio'
  | 'extension'
  | 'otro'
  | 'ajuste'

export type PaymentsFilters = {
  alumno?: string
  alumno_id?: number
  forma_pago?: FormaPago
  estatus?: 'activo' | 'cancelado'
  fecha_ini?: string
  fecha_fin?: string
  sortBy?: 'fecha_pago' | 'total' | 'id' | 'alumno'
  sortDir?: 'ASC' | 'DESC' | 'asc' | 'desc'
  page: number
  pageSize: number
}

export type PagoRow = {
  id: number
  numero_recibo: string
  alumno_id: number
  alumno_nombre?: string
  mensualidad_id?: number | null
  tipo_pago: TipoPago
  concepto?: string | null
  monto: number
  descuento?: number | null
  moratorio?: number | null
  total: number
  forma_pago: FormaPago
  referencia?: string | null
  banco?: string | null
  fecha_pago: string | null
  fecha_vencimiento?: string | null
  dias_retraso?: number | null
  estatus: 'activo' | 'cancelado'
  observaciones?: string | null
  comprobante_url?: string | null
}

/* =========================
 * Hook: usePayments
 * ========================= */

export function usePayments(filters: PaymentsFilters) {
  const { data, error, isLoading, mutate } = useSWR(
    ['/api/pagos', filters],
    async ([, f]) => {
      // —— Normalización de filtros antes de llamar al backend
      const q: Record<string, unknown> = {}

      // alumno: si está vacío o solo espacios, no lo mandes
      const alumno = (f.alumno ?? '').trim()
      if (alumno.length > 0) q.alumno = alumno

      if (f.alumno_id) q.alumno_id = f.alumno_id
      if (f.forma_pago) q.forma_pago = f.forma_pago
      if (f.estatus) q.estatus = f.estatus
      if (f.fecha_ini) q.fecha_ini = f.fecha_ini
      if (f.fecha_fin) q.fecha_fin = f.fecha_fin
      if (f.sortBy) q.sortBy = f.sortBy

      // sortDir en minúsculas para coincidir con tu Zod ('asc' | 'desc')
      const dir = (f.sortDir ?? 'desc').toString().toLowerCase()
      q.sortDir = dir === 'asc' ? 'asc' : 'desc'

      // paginación (obligatoria)
      q.page = Number.isFinite(f.page) ? f.page : 1
      q.pageSize = Number.isFinite(f.pageSize) ? f.pageSize : 20

      const res = await api.get('/pagos', { params: q })
      return res.data as {
        success: boolean
        data: PagoRow[]
        meta: {
          page: number
          pageSize: number
          total: number
          totalPages: number
          sums: { suma_total: number; suma_moratorio: number; suma_descuento: number }
        }
      }
    },
    { revalidateOnFocus: false }
  )

  return {
    list: data?.data ?? [],
    meta: data?.meta,
    isLoading,
    error: error ? 'Error cargando pagos' : null,
    mutate,
  }
}

/* =========================
 * Mutaciones
 * ========================= */

export type PagoCreatePayload = {
  alumno_id: number
  mensualidad_id?: number | null
  tipo_pago: TipoPago
  concepto?: string
  monto: number
  descuento?: number
  moratorio?: number
  forma_pago: FormaPago
  fecha_pago: string // ISO (yyyy-mm-dd HH:mm:ss) o ISODate
  referencia?: string | null
  banco?: string | null
  observaciones?: string | null
  comprobante_url?: string | null
}

export async function createPayment(payload: PagoCreatePayload) {
  const { data } = await api.post('/pagos', payload)
  return data
}

/** Para ajustes, el backend espera /pagos/ajuste y NO acepta 'tipo_pago' ni 'mensualidad_id'. */
export async function createAdjustment(
  payload: Omit<PagoCreatePayload, 'tipo_pago' | 'mensualidad_id'>
) {
  const { data } = await api.post('/pagos/ajuste', payload)
  return data
}

export async function getReceipt(id: number) {
  const { data } = await api.get(`/pagos/${id}`)
  return data as {
    success: boolean
    data: PagoRow
    recibo: any
  }
}

/* Utils opcionales */
export const normalizeFormaPago = (v: string): FormaPago =>
  ([
    'efectivo',
    'transferencia',
    'tarjeta_debito',
    'tarjeta_credito',
    'cheque',
    'otro',
  ] as const).includes(v as FormaPago)
    ? (v as FormaPago)
    : 'otro'
