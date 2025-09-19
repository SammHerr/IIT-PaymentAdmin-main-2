export type FormaPago = 'efectivo' | 'transferencia' | 'tarjeta_debito' | 'tarjeta_credito' | 'cheque'
export type TipoPago  = 'mensualidad' | 'inscripcion' | 'moratorio' | 'extension' | 'otro' | 'ajuste'
export type EstatusPago = 'activo' | 'cancelado'

export interface PagoRow {
  id: number
  numero_recibo: string
  alumno_id: number
  alumno_nombre?: string
  mensualidad_id: number | null
  tipo_pago: TipoPago
  concepto: string
  monto: number
  descuento: number
  moratorio: number
  total: number
  forma_pago: FormaPago
  referencia?: string | null
  banco?: string | null
  fecha_pago: string // ISO
  fecha_vencimiento?: string | null
  dias_retraso?: number
  usuario_id?: number | null
  observaciones?: string | null
  comprobante_url?: string | null
  estatus: EstatusPago
  fecha_creacion?: string
}

export type SortDir = 'asc' | 'desc';
export interface PagosFilters {
  alumno?: string
  alumno_id?: number
  forma_pago?: FormaPago
  estatus?: EstatusPago
  fecha_ini?: string  // 'YYYY-MM-DD'
  fecha_fin?: string  // 'YYYY-MM-DD'
  sortBy?: 'fecha_pago' | 'total' | 'id' | 'alumno'
  sortDir?: SortDir;
  page?: number
  pageSize?: number
}

export interface PagosListResponse {
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

export interface PagoCreatePayload {
  alumno_id: number
  mensualidad_id?: number | null
  tipo_pago: TipoPago
  concepto: string
  monto: number
  descuento?: number
  moratorio?: number
  forma_pago: FormaPago
  referencia?: string | null
  banco?: string | null
  fecha_pago: string // 'YYYY-MM-DD HH:mm:ss'
  observaciones?: string | null
  comprobante_url?: string | null
}
