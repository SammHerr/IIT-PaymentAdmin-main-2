"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Download, FileText, BarChart3, PieChart } from "lucide-react"
import type { DateRange } from "react-day-picker"

export default function ReportsPage() {
  const [reportType, setReportType] = useState("monthly")
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [filterStatus, setFilterStatus] = useState("all")

  // Datos de ejemplo para reportes
  const monthlyReport = {
    period: "Enero 2024",
    totalStudents: 245,
    activeStudents: 198,
    graduatedStudents: 32,
    inactiveStudents: 15,
    expectedRevenue: 980000,
    actualRevenue: 350000,
    collectionRate: 35.7,
    lateFees: 15600,
    newEnrollments: 12,
    dropouts: 3,
  }

  const studentReports = [
    {
      enrollment: "ENG001",
      studentName: "Juan Pérez López",
      plan: "Plan 8 Mensualidades",
      totalPaid: 12000,
      pendingAmount: 3000,
      lateFees: 375,
      status: "active",
      lastPayment: "2024-01-15",
    },
    {
      enrollment: "ENG002",
      studentName: "María López Hernández",
      plan: "Plan 10 Mensualidades",
      totalPaid: 18000,
      pendingAmount: 0,
      lateFees: 0,
      status: "graduated",
      lastPayment: "2024-01-30",
    },
    {
      enrollment: "233107",
      studentName: "Carlos Rodríguez Sánchez",
      plan: "Plan 5 Mensualidades",
      totalPaid: 4500,
      pendingAmount: 1500,
      lateFees: 360,
      status: "active",
      lastPayment: "2023-12-15",
    },
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="default">Activo</Badge>
      case "graduated":
        return <Badge variant="secondary">Graduado</Badge>
      case "inactive":
        return <Badge variant="destructive">Baja</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const generateReport = () => {
    // Aquí se implementaría la lógica para generar el reporte
    console.log("Generando reporte:", { reportType, dateRange, filterStatus })
  }

  return (
    <div className="space-y-4">
      {/* Filtros de Reportes */}
      <Card>
        <CardHeader>
          <CardTitle>Generador de Reportes</CardTitle>
          <CardDescription>Configura los parámetros para generar reportes personalizados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo de Reporte</label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Reporte Mensual</SelectItem>
                  <SelectItem value="student">Por Alumno</SelectItem>
                  <SelectItem value="plan">Por Plan</SelectItem>
                  <SelectItem value="collections">Cobranza</SelectItem>
                  <SelectItem value="overdue">Morosidad</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Rango de Fechas</label>
              <DatePickerWithRange date={dateRange} setDate={setDateRange} />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Filtrar por Estado</label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Activos</SelectItem>
                  <SelectItem value="graduated">Graduados</SelectItem>
                  <SelectItem value="inactive">Dados de Baja</SelectItem>
                  <SelectItem value="overdue">Morosos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Acciones</label>
              <div className="flex space-x-2">
                <Button onClick={generateReport}>
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Generar
                </Button>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resumen Mensual */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <PieChart className="h-5 w-5 mr-2" />
            Resumen Mensual - {monthlyReport.period}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Total de Alumnos</p>
              <p className="text-2xl font-bold">{monthlyReport.totalStudents}</p>
              <div className="text-xs text-muted-foreground">
                <span className="text-green-600">{monthlyReport.activeStudents} activos</span> •
                <span className="text-blue-600"> {monthlyReport.graduatedStudents} graduados</span> •
                <span className="text-red-600"> {monthlyReport.inactiveStudents} bajas</span>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Ingresos</p>
              <p className="text-2xl font-bold text-green-600">${monthlyReport.actualRevenue.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">
                de ${monthlyReport.expectedRevenue.toLocaleString()} esperados
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Tasa de Cobranza</p>
              <p className="text-2xl font-bold">{monthlyReport.collectionRate}%</p>
              <Badge variant={monthlyReport.collectionRate > 70 ? "default" : "destructive"}>
                {monthlyReport.collectionRate > 70 ? "Buena" : "Baja"}
              </Badge>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Moratorios</p>
              <p className="text-2xl font-bold text-orange-600">${monthlyReport.lateFees.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">
                Nuevos: {monthlyReport.newEnrollments} • Bajas: {monthlyReport.dropouts}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reporte Detallado por Alumnos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Reporte Detallado por Alumno
          </CardTitle>
          <CardDescription>Estado financiero individual de cada estudiante</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Matrícula</TableHead>
                <TableHead>Alumno</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Total Pagado</TableHead>
                <TableHead>Monto Pendiente</TableHead>
                <TableHead>Moratorios</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Último Pago</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {studentReports.map((student) => (
                <TableRow key={student.enrollment}>
                  <TableCell className="font-medium">{student.enrollment}</TableCell>
                  <TableCell>{student.studentName}</TableCell>
                  <TableCell>{student.plan}</TableCell>
                  <TableCell className="text-green-600">${student.totalPaid.toLocaleString()}</TableCell>
                  <TableCell className={student.pendingAmount > 0 ? "text-red-600" : "text-green-600"}>
                    ${student.pendingAmount.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-orange-600">${student.lateFees.toLocaleString()}</TableCell>
                  <TableCell>{getStatusBadge(student.status)}</TableCell>
                  <TableCell>{new Date(student.lastPayment).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
