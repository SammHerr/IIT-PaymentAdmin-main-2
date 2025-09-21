'use client'
import { useEffect, useMemo, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createPayment, createAdjustment } from '@/hooks/usePayments'
import type { FormaPago, TipoPago } from '@/types/payments'
import { api } from '@/lib/api'
import { Checkbox } from '@/components/ui/checkbox' // si ya usas uno, o sustituye por un input type="checkbox"

type AlumnoLite = { id: number; nombre: string; matricula?: string }
type MensuLite = { id: number; numero_mensualidad: number; fecha_vencimiento: string; monto: number; estatus: string }
type MensuResp = { success: boolean; data: MensuLite[]; sugerido?: { numero_mensualidad: number; fecha_vencimiento: string } | null }

export default function NewPaymentModal({
  open, onOpenChange
}: { open: boolean; onOpenChange: (v: boolean) => void }) {

  const [alumnos, setAlumnos] = useState<AlumnoLite[]>([])
  const [mensualidades, setMensualidades] = useState<MensuLite[]>([])
  const [sugerido, setSugerido] = useState<MensuResp['sugerido']>(null)

  const [alumnoId, setAlumnoId] = useState<number | null>(null)
  const [mensuId, setMensuId] = useState<number | null>(null)
  const [tipoPago, setTipoPago] = useState<TipoPago>('mensualidad')
  const [adelantar, setAdelantar] = useState(false)

  const [monto, setMonto] = useState<number>(0)
  const [formaPago, setFormaPago] = useState<FormaPago>('efectivo')
  const [fechaPago, setFechaPago] = useState<string>(() => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')} 12:00:00`
  })
  const [concepto, setConcepto] = useState('pago mensualidad')
  const [descuento, setDescuento] = useState<number>(0)
  const [moratorio, setMoratorio] = useState<number>(0)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    // carga lite de alumnos
    api.get('/alumnos?limit=50&page=1&sortBy=id&sortOrder=desc')
      .then(r => setAlumnos(r.data.data ?? []))
      .catch(() => setAlumnos([]))
  }, [open])

  // traer mensualidades cuando cambia alumno
  useEffect(() => {
    if (!open) return
    setMensualidades([])
    setMensuId(null)
    setAdelantar(false)
    setSugerido(null)

    if (!alumnoId) return

    api.get<MensuResp>(`/mensualidades?alumno_id=${alumnoId}`)
      .then(r => {
        setMensualidades(r.data.data ?? [])
        setSugerido(r.data.sugerido ?? null)
        // si no hay pendientes y hay sugerido, proponemos "adelantar"
        if ((r.data.data ?? []).length === 0 && r.data.sugerido) {
          setAdelantar(true)
        }
      })
      .catch(() => {
        setMensualidades([])
        setSugerido(null)
      })
  }, [open, alumnoId])

  const noPendientes = useMemo(() => mensualidades.length === 0, [mensualidades])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!alumnoId) return alert('Selecciona un alumno')

    // validación básica en UI
    if (tipoPago === 'mensualidad' && !adelantar && !mensuId) {
      return alert('Selecciona una mensualidad o marca "Adelantar"')
    }

    setSaving(true)
    try {
      const payload = {
        alumno_id: alumnoId,
        mensualidad_id: tipoPago === 'mensualidad' ? (adelantar ? null : (mensuId ?? null)) : null,
        tipo_pago: tipoPago as TipoPago,
        concepto: concepto || (tipoPago === 'mensualidad' ? 'Pago de mensualidad' : 'Pago'),
        monto,
        descuento,
        moratorio,
        forma_pago: formaPago,
        fecha_pago: fechaPago,
        observaciones: undefined as string | null | undefined,
        comprobante_url: undefined as string | null | undefined,
        adelantar: tipoPago === 'mensualidad' ? adelantar : undefined
      }

      if (tipoPago === 'ajuste') {
        const { tipo_pago: _omit, mensualidad_id: _omit2, adelantar: _omit3, ...ajuste } = payload
        await createAdjustment(ajuste)
      } else {
        await createPayment(payload as any)
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
      <DialogContent className="max-w-2xl">
        <DialogHeader><DialogTitle>Registrar Pago</DialogTitle></DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">Alumno *</label>
              <Select value={alumnoId ? String(alumnoId) : undefined} onValueChange={(v) => setAlumnoId(Number(v))}>
                <SelectTrigger><SelectValue placeholder="Selecciona alumno" /></SelectTrigger>
                <SelectContent>
                  {alumnos.map(a => (
                    <SelectItem key={a.id} value={String(a.id)}>
                      {a.nombre} {a.matricula ? `(${a.matricula})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Tipo *</label>
              <Select value={tipoPago} onValueChange={(v) => setTipoPago(v as any)}>
                <SelectTrigger><SelectValue placeholder="Tipo de pago" /></SelectTrigger>
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

          {tipoPago === 'mensualidad' && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Mensualidad pendiente</label>

              {!noPendientes && (
                <Select value={mensuId ? String(mensuId) : undefined} onValueChange={(v) => { setMensuId(Number(v)); setAdelantar(false) }}>
                  <SelectTrigger><SelectValue placeholder="Selecciona mensualidad" /></SelectTrigger>
                  <SelectContent>
                    {mensualidades.map(m => (
                      <SelectItem key={m.id} value={String(m.id)}>
                        #{m.numero_mensualidad} — vence {new Date(m.fecha_vencimiento).toLocaleDateString()} — ${m.monto}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {/* Opción de adelantar */}
              {(noPendientes || sugerido) && (
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox checked={adelantar} onCheckedChange={(v) => setAdelantar(Boolean(v))} />
                  Adelantar siguiente mensualidad
                  {sugerido ? (
                    <span className="ml-2 text-xs text-muted-foreground">
                      (#{sugerido.numero_mensualidad} vence {new Date(sugerido.fecha_vencimiento).toLocaleDateString()})
                    </span>
                  ) : null}
                </label>
              )}
            </div>
          )}

          {/* Concepto / Monto / Forma / Fecha */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">Concepto</label>
              <Input value={concepto} onChange={(e) => setConcepto(e.target.value)} placeholder="Ej. pago mensualidad 3/8" />
            </div>
            <div>
              <label className="text-sm font-medium">Monto *</label>
              <Input type="number" value={monto} onChange={(e) => setMonto(Number(e.target.value))} min={0} />
            </div>
            <div>
              <label className="text-sm font-medium">Descuento</label>
              <Input type="number" value={descuento} onChange={(e) => setDescuento(Number(e.target.value))} min={0} />
            </div>
            <div>
              <label className="text-sm font-medium">Moratorio</label>
              <Input type="number" value={moratorio} onChange={(e) => setMoratorio(Number(e.target.value))} min={0} />
            </div>
            <div>
              <label className="text-sm font-medium">Forma de pago *</label>
              <Select value={formaPago} onValueChange={(v) => setFormaPago(v as any)}>
                <SelectTrigger><SelectValue placeholder="Forma de pago" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="efectivo">Efectivo</SelectItem>
                  <SelectItem value="transferencia">Transferencia</SelectItem>
                  <SelectItem value="tarjeta_debito">Tarjeta débito</SelectItem>
                  <SelectItem value="tarjeta_credito">Tarjeta crédito</SelectItem>
                  <SelectItem value="cheque">Cheque</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Fecha de pago *</label>
              <Input value={fechaPago} onChange={(e) => setFechaPago(e.target.value)} />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Guardando…' : 'Registrar'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
