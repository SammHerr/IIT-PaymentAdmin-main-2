'use client'

import { useMemo, useState } from 'react'
import {
  usePayments,
  getReceipt,
  type PagoRow,
  type PaymentsFilters,
} from '@/hooks/usePayments'

import { Input } from '@/components/ui/input'
  import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Plus, DollarSign } from 'lucide-react'
import NewPaymentModal from './NewPaymentModal'
import ReceiptDrawer from './ReceiptDrawer'

export default function PaymentsTable() {
  // Filtros iniciales: sortDir en minúsculas para empatar con Zod del backend
  const [filters, setFilters] = useState<PaymentsFilters>({
    alumno: undefined,
    sortBy: 'fecha_pago',
    sortDir: 'desc',
    page: 1,
    pageSize: 20,
  })

  const { list, meta, isLoading, error, mutate } = usePayments(filters)

  const [openNew, setOpenNew] = useState(false)
  const [openRecibo, setOpenRecibo] = useState(false)
  const [recibo, setRecibo] = useState<any>(null)

  const rows = useMemo(() => list ?? [], [list])

  async function onVerRecibo(row: PagoRow) {
    const det = await getReceipt(row.id)
    setRecibo(det.recibo)
    setOpenRecibo(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <Input
          placeholder="Buscar por alumno, recibo o matríc..."
          value={filters.alumno ?? ''}
          onChange={(e) => {
            const raw = e.target.value
            const cleaned = raw.trim()
            setFilters((f) => ({
              ...f,
              alumno: cleaned.length ? cleaned : undefined, // <-- evita enviar ''
              page: 1,
            }))
          }}
          className="max-w-md"
        />
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => mutate()}>
            Recargar
          </Button>
          <Button onClick={() => setOpenNew(true)}>
            <Plus className="h-4 w-4 mr-2" /> Registrar Pago
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Recibo</TableHead>
              <TableHead>Alumno</TableHead>
              <TableHead>Matrícula</TableHead>
              <TableHead>Monto</TableHead>
              <TableHead>Fecha Vencimiento</TableHead>
              <TableHead>Fecha Pago</TableHead>
              <TableHead>Método</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Moratorio</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={10} className="py-8 text-center">
                  Cargando…
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell
                  colSpan={10}
                  className="py-8 text-center text-red-600"
                >
                  {error}
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="py-8 text-center">
                  Sin resultados
                </TableCell>
              </TableRow>
            ) : (
              rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>{r.numero_recibo}</TableCell>
                  <TableCell>{r.alumno_nombre ?? r.alumno_id}</TableCell>
                  <TableCell>
                    {/* si en tu GET incluyes la matrícula, muéstrala aquí */}
                  </TableCell>
                  <TableCell>${r.total?.toLocaleString()}</TableCell>
                  <TableCell>
                    {r.fecha_vencimiento
                      ? new Date(r.fecha_vencimiento).toLocaleDateString()
                      : '-'}
                  </TableCell>
                  <TableCell>
                    {r.fecha_pago
                      ? new Date(r.fecha_pago).toLocaleDateString()
                      : '-'}
                  </TableCell>
                  <TableCell className="capitalize">
                    {(r.forma_pago ?? '').replace('_', ' ')}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={r.estatus === 'activo' ? 'default' : 'secondary'}
                    >
                      {r.estatus === 'activo' ? 'Pagado' : 'Cancelado'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {r.moratorio && r.moratorio > 0 ? (
                      <span className="text-orange-600">
                        ${r.moratorio.toLocaleString?.() ?? r.moratorio}
                      </span>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => onVerRecibo(r)}
                      title="Ver recibo"
                    >
                      <DollarSign className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <NewPaymentModal
        open={openNew}
        onOpenChange={(v) => {
          setOpenNew(v)
          if (!v) mutate()
        }}
      />

      <ReceiptDrawer open={openRecibo} onOpenChange={setOpenRecibo} recibo={recibo} />
    </div>
  )
}
