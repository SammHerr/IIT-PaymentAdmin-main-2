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
import { Plus, Edit, Trash2 } from "lucide-react"

export default function PlansPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Datos de ejemplo para planes
  const plans = [
    {
      planId: "1",
      name: "Plan 5 Mensualidades",
      monthlyPayments: 5,
      monthlyAmount: 1200,
      inscriptionFee: 500,
      validityMonths: 12,
      extensionMonths: 4,
      totalStudents: 45,
      status: true,
    },
    {
      planId: "2",
      name: "Plan 8 Mensualidades",
      monthlyPayments: 8,
      monthlyAmount: 1500,
      inscriptionFee: 800,
      validityMonths: 12,
      extensionMonths: 4,
      totalStudents: 128,
      status: true,
    },
    {
      planId: "3",
      name: "Plan 10 Mensualidades",
      monthlyPayments: 10,
      monthlyAmount: 1800,
      inscriptionFee: 1000,
      validityMonths: 12,
      extensionMonths: 4,
      totalStudents: 72,
      status: true,
    },
  ]

  const getStatusBadge = (status: boolean) => {
    return status ? <Badge variant="default">Activo</Badge> : <Badge variant="destructive">Inactivo</Badge>
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Gestión de Planes</CardTitle>
              <CardDescription>Administra los planes de mensualidades disponibles</CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Plan
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Crear Nuevo Plan</DialogTitle>
                  <DialogDescription>Define los parámetros del nuevo plan de mensualidades</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="planName" className="text-right">
                      Nombre
                    </Label>
                    <Input id="planName" className="col-span-3" placeholder="Ej: Plan 12 Mensualidades" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="monthlyPayments" className="text-right">
                      Mensualidades
                    </Label>
                    <Input id="monthlyPayments" type="number" className="col-span-3" placeholder="5, 8, 10..." />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="monthlyAmount" className="text-right">
                      Monto Mensual
                    </Label>
                    <Input id="monthlyAmount" type="number" className="col-span-3" placeholder="1500" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="inscriptionFee" className="text-right">
                      Inscripción
                    </Label>
                    <Input id="inscriptionFee" type="number" className="col-span-3" placeholder="800" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="validityMonths" className="text-right">
                      Vigencia (meses)
                    </Label>
                    <Input id="validityMonths" type="number" className="col-span-3" placeholder="12" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="extensionMonths" className="text-right">
                      Extensión (meses)
                    </Label>
                    <Input id="extensionMonths" type="number" className="col-span-3" placeholder="4" />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" onClick={() => setIsDialogOpen(false)}>
                    Crear Plan
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre del Plan</TableHead>
                <TableHead>Mensualidades</TableHead>
                <TableHead>Monto Mensual</TableHead>
                <TableHead>Inscripción</TableHead>
                <TableHead>Vigencia</TableHead>
                <TableHead>Alumnos Inscritos</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {plans.map((plan) => (
                <TableRow key={plan.planId}>
                  <TableCell className="font-medium">{plan.name}</TableCell>
                  <TableCell>{plan.monthlyPayments}</TableCell>
                  <TableCell>${plan.monthlyAmount.toLocaleString()}</TableCell>
                  <TableCell>${plan.inscriptionFee.toLocaleString()}</TableCell>
                  <TableCell>
                    {plan.validityMonths} + {plan.extensionMonths} meses
                  </TableCell>
                  <TableCell>{plan.totalStudents} alumnos</TableCell>
                  <TableCell>{getStatusBadge(plan.status)}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4" />
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
