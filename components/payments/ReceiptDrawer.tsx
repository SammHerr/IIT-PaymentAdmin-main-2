'use client'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'

export default function ReceiptDrawer({
  open, onOpenChange, recibo
}: { open: boolean; onOpenChange: (v: boolean) => void; recibo: any }) {

  if (!recibo) return null

  const p = recibo.pago
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>Recibo {recibo.numero_recibo}</DialogTitle></DialogHeader>
        <div className="space-y-2 text-sm">
          <div><b>Fecha:</b> {new Date(recibo.fecha_pago).toLocaleString()}</div>
          <div><b>Alumno:</b> {recibo.alumno?.nombre} {recibo.alumno?.matricula ? `(${recibo.alumno.matricula})` : ''}</div>
          {recibo.alumno?.plan && <div><b>Plan:</b> {recibo.alumno.plan}</div>}

          <hr className="my-2"/>
          <div className="grid grid-cols-2 gap-2">
            <div><b>Tipo:</b> {p.tipo}</div>
            <div><b>Concepto:</b> {p.concepto}</div>
            <div><b>Monto:</b> ${p.monto}</div>
            <div><b>Descuento:</b> ${p.descuento}</div>
            <div><b>Moratorio:</b> ${p.moratorio}</div>
            <div><b>Total:</b> <b>${p.total}</b></div>
            <div><b>Forma:</b> {p.forma_pago}</div>
            <div><b>Estatus:</b> <Badge variant={p.estatus === 'activo' ? 'default' : 'secondary'}>{p.estatus}</Badge></div>
          </div>

          {recibo.mensualidad && (
            <>
              <hr className="my-2"/>
              <div><b>Mensualidad:</b> #{recibo.mensualidad.id} — vence {new Date(recibo.mensualidad.fecha_vencimiento).toLocaleDateString()} — ${recibo.mensualidad.monto}</div>
            </>
          )}

          {recibo.observaciones && (
            <>
              <hr className="my-2"/>
              <div><b>Observaciones:</b> {recibo.observaciones}</div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
