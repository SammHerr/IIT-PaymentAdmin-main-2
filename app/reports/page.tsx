'use client'

import { useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Download, Calendar, BarChart3 } from 'lucide-react'
import { useReporteResumen, useReporteAlumnos } from '@/hooks/useReports'

// Util simple para formatear moneda
const money = (n: number | undefined | null) =>
  `$${Number(n ?? 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}`

export default function ReportsPage() {
  // Filtros básicos: tipo reporte y rango de fechas (simple: mes actual)
  const [tipo, setTipo] = useState<'mensual' | 'personalizado'>('mensual')
  const [range, setRange] = useState<{ fecha_desde?: string; fecha_hasta?: string }>(() => {
    const d = new Date()
    const y = d.getFullYear()
    const m = `${d.getMonth() + 1}`.padStart(2, '0')
    const desde = `${y}-${m}-01`
    const hasta = new Date(y, d.getMonth() + 1, 0).toISOString().slice(0, 10)
    return { fecha_desde: desde, fecha_hasta: hasta }
  })

  const { data: resumenResp, isLoading: loadResumen } = useReporteResumen(range)
  const resumen = resumenResp?.data

  const { data: alumnosResp, isLoading: loadAlumnos } = useReporteAlumnos(range)
  const top = alumnosResp?.data.topAtraso ?? []

  const pct = useMemo(() => resumen?.tasa_cobranza ?? 0, [resumen])

  const handleExport = () => {
    // Exportación rápida: CSV cliente del “top atraso”
    const rows = [
      ['Matricula', 'Alumno', 'Mensualidades Vencidas', 'Monto Vencido', 'Max Días Vencido'],
      ...top.map(r => [
        r.matricula ?? '',
        r.nombre_alumno,
        String(r.mensualidades_vencidas),
        String(r.monto_vencido),
        String(r.dias_max_vencido),
      ]),
    ]
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'reporte_alumnos.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Generador de Reportes</CardTitle>
          <CardDescription>Configura los parámetros para generar reportes personalizados</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Tipo de Reporte</p>
            <Select value={tipo} onValueChange={(v: any) => setTipo(v)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mensual">Reporte Mensual</SelectItem>
                <SelectItem value="personalizado">Personalizado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Rango de Fechas</p>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <input
                type="date"
                className="border rounded px-2 py-1 w-[140px]"
                value={range.fecha_desde ?? ''}
                onChange={e => setRange(r => ({ ...r, fecha_desde: e.target.value }))}
              />
              <span className="text-muted-foreground">—</span>
              <input
                type="date"
                className="border rounded px-2 py-1 w-[140px]"
                value={range.fecha_hasta ?? ''}
                onChange={e => setRange(r => ({ ...r, fecha_hasta: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Filtrar por Estado</p>
            <Select defaultValue="todos">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="activo">Activos</SelectItem>
                <SelectItem value="graduado">Graduados</SelectItem>
                <SelectItem value="baja">Bajas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end gap-2">
            <Button className="w-full" variant="default">
              <BarChart3 className="h-4 w-4 mr-2" />
              Generar
            </Button>
            <Button className="w-full" variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Resumen */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Monto Esperado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{money(resumen?.esperado)}</div>
            <p className="text-xs text-muted-foreground">
              {new Date(range.fecha_desde ?? '').toLocaleString('es-MX', { month: 'long', year: 'numeric' })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Monto Cobrado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{money(resumen?.cobrado)}</div>
            <Progress value={pct} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Tasa de Cobranza</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(resumen?.tasa_cobranza ?? 0).toFixed(1)}%</div>
            <Badge variant="secondary" className="mt-2">
              {pct < 50 ? 'Baja' : pct < 80 ? 'Media' : 'Alta'}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Moratorios Acumulados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{money(resumen?.moratorios_totales)}</div>
            <p className="text-xs text-muted-foreground">
              {resumen?.alumnos_con_atraso ?? 0} alumnos morosos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabla “Reporte Detallado por Alumno” */}
      <Card>
        <CardHeader>
          <CardTitle>Reporte Detallado por Alumno</CardTitle>
          <CardDescription>Estado financiero individual</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Matrícula</TableHead>
                <TableHead>Alumno</TableHead>
                <TableHead className="text-right">Mensualidades vencidas</TableHead>
                <TableHead className="text-right">Monto vencido</TableHead>
                <TableHead className="text-right">Máx. días vencido</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {top.map((r) => (
                <TableRow key={r.alumno_id}>
                  <TableCell className="font-medium">{r.matricula ?? '—'}</TableCell>
                  <TableCell>{r.nombre_alumno}</TableCell>
                  <TableCell className="text-right">{r.mensualidades_vencidas}</TableCell>
                  <TableCell className="text-right" style={{ color: '#ef4444' }}>
                    {money(r.monto_vencido)}
                  </TableCell>
                  <TableCell className="text-right">{r.dias_max_vencido}</TableCell>
                </TableRow>
              ))}
              {!loadAlumnos && top.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No hay datos para el rango seleccionado
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
