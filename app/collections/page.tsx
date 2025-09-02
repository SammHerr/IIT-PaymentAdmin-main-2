"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Download, Calendar, TrendingUp, AlertTriangle } from "lucide-react"

export default function CollectionsPage() {
  const [selectedMonth, setSelectedMonth] = useState("2024-01")

  // Datos de ejemplo para cobranza
  const collectionData = {
    month: "Enero 2024",
    expectedAmount: 980000,
    collectedAmount: 350000,
    collectionPercentage: 35.7,
    totalStudents: 245,
    paidStudents: 87,
    overdueStudents: 158,
    totalLateFees: 15600,
  }

  const overduePayments = [
    {
      studentId: "1",
      enrollment: "ENG001",
      studentName: "Juan Pérez García",
      dueAmount: 1500,
      dueDate: "2024-01-10",
      daysPastDue: 25,
      lateFeeAmount: 375,
      totalAmount: 1875,
      phone: "962-123-4567",
    },
    {
      studentId: "2",
      enrollment: "ENG002",
      studentName: "María López Hernández",
      dueAmount: 1800,
      dueDate: "2024-01-15",
      daysPastDue: 20,
      lateFeeAmount: 360,
      totalAmount: 2160,
      phone: "962-234-5678",
    },
    {
      studentId: "3",
      enrollment: "ENG003",
      studentName: "Carlos Rodríguez Sánchez",
      dueAmount: 1200,
      dueDate: "2024-01-05",
      daysPastDue: 30,
      lateFeeAmount: 360,
      totalAmount: 1560,
      phone: "962-345-6789",
    },
  ]

  const getDaysPastDueBadge = (days: number) => {
    if (days <= 7) return <Badge variant="secondary">{days} días</Badge>
    if (days <= 15)
      return (
        <Badge variant="default" className="bg-orange-500">
          {days} días
        </Badge>
      )
    return <Badge variant="destructive">{days} días</Badge>
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
            <div className="text-2xl font-bold">${collectionData.expectedAmount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{collectionData.month}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monto Cobrado</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${collectionData.collectedAmount.toLocaleString()}</div>
            <Progress value={collectionData.collectionPercentage} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Porcentaje de Cobranza</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{collectionData.collectionPercentage}%</div>
            <p className="text-xs text-muted-foreground">
              {collectionData.paidStudents} de {collectionData.totalStudents} alumnos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Moratorios Acumulados</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">${collectionData.totalLateFees.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{collectionData.overdueStudents} alumnos morosos</p>
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
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024-01">Enero 2024</SelectItem>
                  <SelectItem value="2023-12">Diciembre 2023</SelectItem>
                  <SelectItem value="2023-11">Noviembre 2023</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
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
              {overduePayments.map((payment) => (
                <TableRow key={payment.studentId}>
                  <TableCell className="font-medium">{payment.enrollment}</TableCell>
                  <TableCell>{payment.studentName}</TableCell>
                  <TableCell>${payment.dueAmount.toLocaleString()}</TableCell>
                  <TableCell>{new Date(payment.dueDate).toLocaleDateString()}</TableCell>
                  <TableCell>{getDaysPastDueBadge(payment.daysPastDue)}</TableCell>
                  <TableCell className="text-orange-600">${payment.lateFeeAmount.toLocaleString()}</TableCell>
                  <TableCell className="font-bold">${payment.totalAmount.toLocaleString()}</TableCell>
                  <TableCell>{payment.phone}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        Llamar
                      </Button>
                      <Button variant="outline" size="sm">
                        WhatsApp
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Resumen por Tipo de Ingreso */}
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
                ${(collectionData.collectedAmount * 0.85).toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">85% del total cobrado</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Moratorios</p>
              <p className="text-2xl font-bold text-orange-600">${collectionData.totalLateFees.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Penalizaciones por pago tardío</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Inscripciones</p>
              <p className="text-2xl font-bold text-blue-600">
                ${(collectionData.collectedAmount * 0.15 - collectionData.totalLateFees).toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">Pagos de nuevos ingresos</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
