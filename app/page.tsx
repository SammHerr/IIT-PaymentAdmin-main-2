/*

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Users, CreditCard, TrendingUp, AlertTriangle } from "lucide-react"

// ▼ NUEVO: para mostrar “Inicia sesión para ver estos datos”
import ProtectedValue from "@/components/ProtectedValue"

export default function Dashboard() {
  // En una implementación real, estos datos vendrían de la API
  const stats = {
    totalStudents: 245,
    activeStudents: 199,
    expectedAmount: 980000,
    collectedAmount: 350000,
    collectionPercentage: 35.7,
    overduePayments: 47,
    totalLateFees: 15600,
  }

  return (
    <div className="p-4">
      {/* Título (sin botón; ahora va en el header del layout) *//*}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alumnos Activos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <ProtectedValue> {stats.activeStudents} </ProtectedValue>
            </div>
            <p className="text-xs text-muted-foreground">
              <ProtectedValue>de {stats.totalStudents} total</ProtectedValue>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cobranza Mensual</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <ProtectedValue>${stats.collectedAmount.toLocaleString()}</ProtectedValue>
            </div>
            <p className="text-xs text-muted-foreground">
              <ProtectedValue>de ${stats.expectedAmount.toLocaleString()} esperados</ProtectedValue>
            </p>
            <ProtectedValue>
              <Progress value={stats.collectionPercentage} className="mt-2" />
            </ProtectedValue>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Porcentaje de Cobranza</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <ProtectedValue>{stats.collectionPercentage}%</ProtectedValue>
            </div>
            <ProtectedValue>
              <Badge variant={stats.collectionPercentage > 70 ? "default" : "destructive"}>
                {stats.collectionPercentage > 70 ? "Bueno" : "Bajo"}
              </Badge>
            </ProtectedValue>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pagos Vencidos</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <ProtectedValue>{stats.overduePayments}</ProtectedValue>
            </div>
            <p className="text-xs text-muted-foreground">
              <ProtectedValue>Moratorios: ${stats.totalLateFees.toLocaleString()}</ProtectedValue>
            </p>
          </CardContent>
        </Card>

        <Card className="col-span-full">
          <CardHeader>
            <CardTitle>Resumen de Cobranza</CardTitle>
            <CardDescription>Estado actual de pagos y morosidad</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <p className="text-sm font-medium">Mensualidades Normales</p>
                <p className="text-2xl font-bold text-green-600">
                  <ProtectedValue>
                    ${(stats.collectedAmount * 0.85).toLocaleString()}
                  </ProtectedValue>
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Moratorios</p>
                <p className="text-2xl font-bold text-orange-600">
                  <ProtectedValue>${stats.totalLateFees.toLocaleString()}</ProtectedValue>
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Inscripciones</p>
                <p className="text-2xl font-bold text-blue-600">
                  <ProtectedValue>
                    ${(stats.collectedAmount * 0.15 - stats.totalLateFees).toLocaleString()}
                  </ProtectedValue>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

*/

// app/page.tsx
import DashboardClient from "@/components/dashboard/DashboardClient"

export const dynamic = "force-dynamic"  // evita cache SSR
export const revalidate = 0

export default function DashboardPage() {
  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
      </div>
      <DashboardClient />
    </div>
  )
}
