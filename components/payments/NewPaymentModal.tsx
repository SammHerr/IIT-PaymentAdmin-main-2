'use client'

import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  createPayment,
  createAdjustment,
  type FormaPago,
  type TipoPago,
  normalizeFormaPago,
} from '@/hooks/usePayments'
import { api } from '@/lib/api'

type AlumnoLite = { id: number; nombre: string; matricula?: string }
type MensuLite = {
  id: number
  numero_mensualidad: number
  fecha_vencimiento: string
  monto: number
  estatus: string
}

export default function NewPaymentModal({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
}) {
  const [alumnos, setAlumnos] = useState<AlumnoLite[]>([])
  const [mensualidades, setMensualidades] = useState<MensuLite[]>([])

  const [alumnoId, setAlumnoId] = useState<number | null>(null)
  const [mensuId, setMensuId] = useState<number | null>(null)
  const [tipoPago, setTipoPago] = useState<TipoPago>('mensualidad')

  const [monto, setMonto] = useState<number>(0)
  const [descuento, setDescuento] = useState<number>(0)
  const [moratorio, setMoratorio] = useState<number>(0)

  const [formaPago, setFormaPago] = useState<FormaPago>('efectivo')
  const [fechaPago, setFechaPago] = useState<string>(() => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
      d.getDate()
    ).padStart(2, '0')} 12:00:00`
  })
  const [concepto, setConcepto] = useState('')

  const [saving, setSaving] = useState(false)

  /* ====== cargar catálogos ====== */
  useEffect(() => {
    if (!open) return
    api
      .get('/alumnos?limit=50&page=1&sortBy=id&sortOrder=desc')
      .then((r) => setAlumnos(r.data.data ?? []))
      .catch(() => setAlumnos([]))
  }, [open])

  useEffect(() => {
    if (!alumnoId) {
      setMensualidades([])
      setMensuId(null)
      return
    }
    api
      .get(`/mensualidades?alumno_id=${alumnoId}&estatus=pendiente`)
      .then((r) => setMensualidades(r.data.data ?? []))
      .catch(() => setMensualidades([]))
  }, [alumnoId])

  /* ====== submit ====== */
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!alumnoId) return alert('Selecciona un alumno')

    setSaving(true)
    try {
      // payload general (coincide con el backend)
      const payload = {
        alumno_id: alumnoId,
        mensualidad_id: tipoPago === 'mensualidad' ? mensuId ?? null : null,
        tipo_pago: tipoPago as TipoPago,
        concepto: concepto || (tipoPago === 'mensualidad' ? 'Pago de mensualidad' : 'Pago'),
        monto,
        descuento,
        moratorio,
        forma_pago: normalizeFormaPago(formaPago),
        fecha_pago: fechaPago,
        observaciones: undefined as string | null | undefined,
        comprobante_url: undefined as string | null | undefined,
      }

      if (tipoPago === 'ajuste') {
        // /pagos/ajuste NO acepta tipo_pago ni mensualidad_id
        const { tipo_pago: _omit, mensualidad_id: _omit2, ...ajuste } = payload
        await createAdjustment(ajuste)
      } else {
        await createPayment(payload)
      }

      onOpenChange(false)
    } catch (err) {
      console.error(err)
      alert('Error registrando pago')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Registrar Pago</DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          {/* Alumno / Tipo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">Alumno *</label>
              <Select
                value={alumnoId ? String(alumnoId) : undefined}
                onValueChange={(v) => setAlumnoId(Number(v))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona alumno" />
                </SelectTrigger>
                <SelectContent>
                  {alumnos.map((a) => (
                    <SelectItem key={a.id} value={String(a.id)}>
                      {a.nombre} {a.matricula ? `(${a.matricula})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Tipo *</label>
              <Select value={tipoPago} onValueChange={(v) => setTipoPago(v as TipoPago)}>
                <SelectTrigger>
                  <SelectValue placeholder="Tipo de pago" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mensualidad">Mensualidad</SelectItem>
                  <SelectItem value="inscripcion">Inscripción</SelectItem>
                  <SelectItem value="moratorio">Moratorio</SelectItem>
                  <SelectItem value="extension">Extensión</SelectItem>
                  <SelectItem value="otro">Otro</SelectItem>
                  <SelectItem value="ajuste">Ajuste</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Mensualidad pendiente */}
          {tipoPago === 'mensualidad' && (
            <div>
              <label className="text-sm font-medium">Mensualidad pendiente</label>
              <Select
                value={mensuId ? String(mensuId) : undefined}
                onValueChange={(v) => setMensuId(Number(v))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona mensualidad" />
                </SelectTrigger>
                <SelectContent>
                  {mensualidades.map((m) => (
                    <SelectItem key={m.id} value={String(m.id)}>
                      #{m.numero_mensualidad} — vence{' '}
                      {new Date(m.fecha_vencimiento).toLocaleDateString()} — ${m.monto}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Concepto / Monto / Descuento / Moratorio / Forma / Fecha */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">Concepto</label>
              <Input
                value={concepto}
                onChange={(e) => setConcepto(e.target.value)}
                placeholder="Ej. Pago mensualidad 3/8"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Monto *</label>
              <Input
                type="number"
                value={monto}
                onChange={(e) => setMonto(Number(e.target.value))}
                min={0}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Descuento</label>
              <Input
                type="number"
                value={descuento}
                onChange={(e) => setDescuento(Number(e.target.value))}
                min={0}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Moratorio</label>
              <Input
                type="number"
                value={moratorio}
                onChange={(e) => setMoratorio(Number(e.target.value))}
                min={0}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Forma de pago *</label>
              <Select value={formaPago} onValueChange={(v) => setFormaPago(v as FormaPago)}>
                <SelectTrigger>
                  <SelectValue placeholder="Forma de pago" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="efectivo">Efectivo</SelectItem>
                  <SelectItem value="transferencia">Transferencia</SelectItem>
                  <SelectItem value="tarjeta_debito">Tarjeta débito</SelectItem>
                  <SelectItem value="tarjeta_credito">Tarjeta crédito</SelectItem>
                  <SelectItem value="cheque">Cheque</SelectItem>
                  <SelectItem value="otro">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Fecha de pago *</label>
              <Input value={fechaPago} onChange={(e) => setFechaPago(e.target.value)} />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Guardando…' : 'Registrar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
