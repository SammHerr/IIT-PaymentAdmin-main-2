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
import { Plus, Search, Edit, Eye } from "lucide-react"

export default function StudentsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Datos de ejemplo - en implementación real vendrían de la API
  const students = [
    {
      userId: "1",
      enrollment: "ENG001",
      fullName: "Juan Pérez García",
      email: "juan@email.com",
      phone: "962-123-4567",
      status: "active",
      registration: "2024-01-15",
      expiration: "2025-01-15",
      planName: "Plan 8 Mensualidades",
      paymentStatus: "al día",
    },
    {
      userId: "2",
      enrollment: "ENG002",
      fullName: "María López Hernández",
      email: "maria@email.com",
      phone: "962-234-5678",
      status: "active",
      registration: "2024-02-01",
      expiration: "2025-02-01",
      planName: "Plan 10 Mensualidades",
      paymentStatus: "moroso",
    },
    {
      userId: "3",
      enrollment: "ENG003",
      fullName: "Carlos Rodríguez Sánchez",
      email: "carlos@email.com",
      phone: "962-345-6789",
      status: "graduated",
      registration: "2023-06-01",
      expiration: "2024-06-01",
      planName: "Plan 5 Mensualidades",
      paymentStatus: "completado",
    },
  ]

  const filteredStudents = students.filter(
    (student) =>
      student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.enrollment.toLowerCase().includes(searchTerm.toLowerCase()),
  )

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

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case "al día":
        return (
          <Badge variant="default" className="bg-green-500">
            Al día
          </Badge>
        )
      case "moroso":
        return <Badge variant="destructive">Moroso</Badge>
      case "completado":
        return <Badge variant="secondary">Completado</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Gestión de Alumnos</CardTitle>
          <CardDescription>Administra la información de los estudiantes y su estatus académico</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre o matrícula..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Alumno
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Registrar Nuevo Alumno</DialogTitle>
                  <DialogDescription>Ingresa la información del nuevo estudiante</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Nombre
                    </Label>
                    <Input id="name" className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="lastName" className="text-right">
                      Apellidos
                    </Label>
                    <Input id="lastName" className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="email" className="text-right">
                      Email
                    </Label>
                    <Input id="email" type="email" className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="phone" className="text-right">
                      Teléfono
                    </Label>
                    <Input id="phone" className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="plan" className="text-right">
                      Plan
                    </Label>
                    <Select>
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Seleccionar plan" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="plan5">Plan 5 Mensualidades</SelectItem>
                        <SelectItem value="plan8">Plan 8 Mensualidades</SelectItem>
                        <SelectItem value="plan10">Plan 10 Mensualidades</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" onClick={() => setIsDialogOpen(false)}>
                    Registrar Alumno
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Matrícula</TableHead>
                <TableHead>Nombre Completo</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Estatus</TableHead>
                <TableHead>Estado de Pago</TableHead>
                <TableHead>Fecha de Registro</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.map((student) => (
                <TableRow key={student.userId}>
                  <TableCell className="font-medium">{student.enrollment}</TableCell>
                  <TableCell>{student.fullName}</TableCell>
                  <TableCell>{student.planName}</TableCell>
                  <TableCell>{getStatusBadge(student.status)}</TableCell>
                  <TableCell>{getPaymentStatusBadge(student.paymentStatus)}</TableCell>
                  <TableCell>{new Date(student.registration).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
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
