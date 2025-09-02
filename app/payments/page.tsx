"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Receipt, AlertTriangle } from "lucide-react"

export default function PaymentsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Datos de ejemplo
  const payments = [
    {
      paymentId: "1",
      receiptNumber: "REC001",
      studentName: "Juan Pérez García",
      enrollment: "ENG001",
      amount: 1500,
      paymentDate: "2024-01-15",
      dueDate: "2024-01-10",
      paymentMethod: "Efectivo",
      paymentType: "Mensualidad",
      status: "paid",
      lateFeeDays: 5,
      lateFeeAmount: 75,
    },
    {
      paymentId: "2",
      receiptNumber: "REC002",
      studentName: "María López Hernández",
      enrollment: "ENG002",
      amount: 1800,
      paymentDate: "2024-02-01",
      dueDate: "2024-02-01",
      paymentMethod: "Transferencia",
      paymentType: "Mensualidad",
      status: "paid",
      lateFeeDays: 0,
      lateFeeAmount: 0,
    },
    {
      paymentId: "3",
      receiptNumber: "REC003",
      studentName: "Carlos Rodríguez Sánchez",
      enrollment: "ENG003",
      amount: 1200,
      paymentDate: "",
      dueDate: "2024-01-05",
      paymentMethod: "",
      paymentType: "Mensualidad",
      status: "pending",
      lateFeeDays: 25,
      lateFeeAmount: 300,
    },
  ]

  const filteredPayments = payments.filter(
    (payment) =>
      payment.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.enrollment.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return (
          <Badge variant="default" className="bg-green-500">
            Pagado
          </Badge>
        )
      case "pending":
        return <Badge variant="destructive">Pendiente</Badge>
      case "cancelled":
        return <Badge variant="secondary">Cancelado</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const calculateLateFee = (dueDate: string, currentDate: string = new Date().toISOString()) => {
    const due = new Date(dueDate)
    const current = new Date(currentDate)
    const diffTime = current.getTime() - due.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays > 0 ? diffDays : 0
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Control de Pagos</CardTitle>
          <CardDescription>Gestiona los pagos de mensualidades, inscripciones y moratorios</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por alumno, recibo o matrícula..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Registrar Pago
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Registrar Nuevo Pago</DialogTitle>
                  <DialogDescription>Ingresa los detalles del pago recibido</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="student" className="text-right">
                      Alumno
                    </Label>
                    <Select>
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Seleccionar alumno" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="eng001">ENG001 - Juan Pérez García</SelectItem>
                        <SelectItem value="eng002">ENG002 - María López Hernández</SelectItem>
                        <SelectItem value="eng003">ENG003 - Carlos Rodríguez Sánchez</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="amount" className="text-right">
                      Monto
                    </Label>
                    <Input id="amount" type="number" className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="paymentMethod" className="text-right">
                      Método
                    </Label>
                    <Select>
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Método de pago" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">Efectivo</SelectItem>
                        <SelectItem value="card">Tarjeta</SelectItem>
                        <SelectItem value="transfer">Transferencia</SelectItem>
                        <SelectItem value="check">Cheque</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="paymentType" className="text-right">
                      Tipo
                    </Label>
                    <Select>
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Tipo de pago" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">Mensualidad</SelectItem>
                        <SelectItem value="inscription">Inscripción</SelectItem>
                        <SelectItem value="late_fee">Moratorio</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" onClick={() => setIsDialogOpen(false)}>
                    Registrar Pago
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

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
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayments.map((payment) => (
                <TableRow key={payment.paymentId}>
                  <TableCell className="font-medium">{payment.receiptNumber}</TableCell>
                  <TableCell>{payment.studentName}</TableCell>
                  <TableCell>{payment.enrollment}</TableCell>
                  <TableCell>${payment.amount.toLocaleString()}</TableCell>
                  <TableCell>{new Date(payment.dueDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    {payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString() : "-"}
                  </TableCell>
                  <TableCell>{payment.paymentMethod || "-"}</TableCell>
                  <TableCell>{getStatusBadge(payment.status)}</TableCell>
                  <TableCell>
                    {payment.lateFeeDays > 0 ? (
                      <div className="flex items-center space-x-1">
                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                        <span className="text-orange-600">
                          {payment.lateFeeDays}d - ${payment.lateFeeAmount}
                        </span>
                      </div>
                    ) : (
                      <span className="text-green-600">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm">
                      <Receipt className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
