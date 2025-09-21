'use client'

import { useMemo, useState } from 'react'
import { useCollections } from '@/hooks/useCollections'

import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Download, Calendar, TrendingUp, AlertTriangle } from 'lucide-react'

function fmtMoney(n: number | undefined | null) {
  if (n == null || Number.isNaN(n)) return '$0'
  return `$${Number(n).toLocaleString()}`
}

function MonthSelect({
  value,
  onChange,
}: { value: string; onChange: (v: string) => void }) {
  // puedes generar los últimos 12 meses dinámicamente si quieres
  const options = useMemo(() => {
    const arr: string[] = []
    const d = new Date()
    for (let i = 0; i < 12; i++) {
      const y = d.getFullYear()
      const m = String(d.getMonth() + 1).padStart(2, '0')
      arr.push(`${y}-${m}`)
      d.setMonth(d.getMonth() - 1)
    }
    return arr
  }, [])

  const monthName = (s: string) => {
    const [yy, mm] = s.split('-').map(Number)
    const dt = new Date(yy, (mm ?? 1) - 1, 1)
    return dt.toLocaleString('es-MX', { month: 'long', year: 'numeric' })
  }

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-44">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((opt) => (
          <SelectItem key={opt} value={opt}>
            {monthName(opt)[0].toUpperCase() + monthName(opt).slice(1)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export default function CollectionsPage() {
  // valor inicial: mes actual en formato YYYY-MM
  const now = new Date()
  const initial = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const [selectedMonth, setSelectedMonth] = useState(initial)

  // descomponer YYYY-MM -> mes/anio para el hook
  const [anio, mes] = selectedMonth.split('-').map((v) => Number(v))
  const { kpis, list, meta, isLoading, error, mutate } = useCollections({
    mes,
    anio,
    page: 1,
    pageSize: 20,
    sortBy: 'vencimiento',
    sortDir: 'asc',
  })

  const monthLabel = useMemo(() => {
    const dt = new Date(anio, (mes ?? 1) - 1, 1)
    return dt.toLocaleString('es-MX', { month: 'long', year: 'numeric' })
  }, [anio, mes])

  const getDaysPastDueBadge = (days: number) => {
    if (!days || days <= 0) return <Badge variant="secondary">0 días</Badge>
    if (days <= 7) return <Badge variant="secondary">{days} días</Badge>
    if (days <= 15)
      return (
        <Badge variant="default" className="bg-orange-500">
          {days} días
        </Badge>
      )
    return <Badge variant="destructive">{days} días</Badge>
  }

  function exportCSV() {
    const headers = [
      'Matricula',
      'Alumno',
      'Monto',
      'Vencimiento',
      'DiasVencido',
      'MoratorioEstimado',
      'Telefono',
    ]
    const rows = (list ?? []).map((r) => [
      r.matricula ?? '',
      r.alumno_nombre ?? '',
      r.monto ?? 0,
      r.fecha_vencimiento ?? '',
      r.dias_vencido ?? 0,
      r.moratorio_estimado ?? 0,
      r.telefono ?? '',
    ])
    const csv =
      [headers, ...rows]
        .map((arr) => arr.map((x) => `"${String(x).replace(/"/g, '""')}"`).join(','))
        .join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `cobranza_${selectedMonth}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-4">
      {/* Resumen de Cobranza */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monto Esperado</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fmtMoney(kpis?.esperado)}</div>
            <p className="text-xs text-muted-foreground">
              {monthLabel[0].toUpperCase() + monthLabel.slice(1)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monto Cobrado</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{fmtMoney(kpis?.cobrado)}</div>
            <Progress value={kpis?.porcentaje_cobranza ?? 0} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Porcentaje de Cobranza</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(kpis?.porcentaje_cobranza ?? 0).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {(kpis?.alumnos_total ?? 0) > 0
                ? `${(kpis?.alumnos_total ?? 0) - (kpis?.alumnos_con_deuda ?? 0)} de ${kpis?.alumnos_total} alumnos`
                : '—'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Moratorios Acumulados</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{fmtMoney(kpis?.moratorio)}</div>
            <p className="text-xs text-muted-foreground">
              {(kpis?.alumnos_con_deuda ?? 0)} alumnos morosos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Cobranza */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Lista de Cobranza Mensual</CardTitle>
              <CardDescription>Alumnos con pagos pendientes y moratorios</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <MonthSelect value={selectedMonth} onChange={setSelectedMonth} />
              <Button variant="outline" onClick={() => mutate()}>Recargar</Button>
              <Button variant="outline" onClick={exportCSV}>
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-10 text-center text-sm text-muted-foreground">Cargando…</div>
          ) : error ? (
            <div className="py-10 text-center text-sm text-red-600">{error}</div>
          ) : (list?.length ?? 0) === 0 ? (
            <div className="py-10 text-center text-sm text-muted-foreground">Sin resultados</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Matrícula</TableHead>
                  <TableHead>Alumno</TableHead>
                  <TableHead>Monto Adeudado</TableHead>
                  <TableHead>Fecha Vencimiento</TableHead>
                  <TableHead>Días Vencido</TableHead>
                  <TableHead>Moratorio</TableHead>
                  <TableHead>Total a Pagar</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list!.map((r) => {
                  const total = (r.monto ?? 0) + (r.moratorio_estimado ?? 0)
                  return (
                    <TableRow key={`${r.alumno_id}-${r.mensualidad_id}`}>
                      <TableCell className="font-medium">{r.matricula ?? '—'}</TableCell>
                      <TableCell>{r.alumno_nombre}</TableCell>
                      <TableCell>{fmtMoney(r.monto)}</TableCell>
                      <TableCell>
                        {r.fecha_vencimiento
                          ? new Date(r.fecha_vencimiento).toLocaleDateString()
                          : '—'}
                      </TableCell>
                      <TableCell>{getDaysPastDueBadge(Number(r.dias_vencido ?? 0))}</TableCell>
                      <TableCell className="text-orange-600">{fmtMoney(r.moratorio_estimado)}</TableCell>
                      <TableCell className="font-bold">{fmtMoney(total)}</TableCell>
                      <TableCell>{r.telefono ?? '—'}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">Llamar</Button>
                          <Button variant="outline" size="sm">WhatsApp</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Desglose de Ingresos */}
      <Card>
        <CardHeader>
          <CardTitle>Desglose de Ingresos</CardTitle>
          <CardDescription>Separación de ingresos por tipo de pago</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <p className="text-sm font-medium">Mensualidades Normales</p>
              <p className="text-2xl font-bold text-green-600">
                {/* este dato no viene directo; como ejemplo, mostramos cobrado - moratorio - inscripciones */}
                {fmtMoney((kpis?.cobrado ?? 0) - (kpis?.moratorio ?? 0) - (kpis?.inscripciones ?? 0))}
              </p>
              <p className="text-xs text-muted-foreground">
                {kpis?.esperado
                  ? `${Math.round((((kpis?.cobrado ?? 0) - (kpis?.moratorio ?? 0) - (kpis?.inscripciones ?? 0)) / (kpis?.cobrado ?? 1)) * 100)}% del total cobrado`
                  : '—'}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Moratorios</p>
              <p className="text-2xl font-bold text-orange-600">{fmtMoney(kpis?.moratorio)}</p>
              <p className="text-xs text-muted-foreground">Penalizaciones por pago tardío</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Inscripciones</p>
              <p className="text-2xl font-bold text-blue-600">{fmtMoney(kpis?.inscripciones)}</p>
              <p className="text-xs text-muted-foreground">Pagos de nuevos ingresos</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
