// components/dashboard/DashboardClient.tsx
"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Users, CreditCard, TrendingUp, AlertTriangle } from "lucide-react"
import { useDashboardSummary } from "@/hooks/useDashboardSummary"
import { useAuth } from "@/app/(auth)/auth-context"

export default function DashboardClient() {
  const { user, loading: authLoading } = useAuth()
  const { data, loading, error } = useDashboardSummary() // mes actual por defecto

  const isLocked = !user && !authLoading

  if (error) {
    return <div className="text-sm text-red-600">Error: {error}</div>
  }

  // Skeletons simples mientras carga
  const LoadingBox = () => <div className="h-6 w-24 bg-muted rounded animate-pulse" />

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Alumnos Activos */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Alumnos Activos</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {loading || authLoading ? (
              <LoadingBox />
            ) : isLocked ? (
              <span className="text-muted-foreground/60">Inicia sesión para ver estos datos</span>
            ) : (
              data?.activeStudents?.toLocaleString()
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {loading || authLoading ? (
              <LoadingBox />
            ) : isLocked ? (
              <span className="text-muted-foreground/60">
                Inicia sesión para ver estos datos
              </span>
            ) : (
              <>de {data?.totalStudents?.toLocaleString()} total</>
            )}
          </p>
        </CardContent>
      </Card>

      {/* Cobranza Mensual */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Cobranza Mensual</CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {loading || authLoading ? (
              <LoadingBox />
            ) : isLocked ? (
              <span className="text-muted-foreground/60">Inicia sesión para ver estos datos</span>
            ) : (
              <>${data?.collectedAmount?.toLocaleString()}</>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {loading || authLoading ? (
              <LoadingBox />
            ) : isLocked ? (
              <span className="text-muted-foreground/60">
                Inicia sesión para ver estos datos
              </span>
            ) : (
              <>de ${data?.expectedAmount?.toLocaleString()} esperados</>
            )}
          </p>
          {loading || authLoading ? null : isLocked ? null : (
            <Progress value={data?.collectionPercentage ?? 0} className="mt-2" />
          )}
        </CardContent>
      </Card>

      {/* Porcentaje de Cobranza */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Porcentaje de Cobranza</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {loading || authLoading ? (
              <LoadingBox />
            ) : isLocked ? (
              <span className="text-muted-foreground/60">Inicia sesión para ver estos datos</span>
            ) : (
              <>{data?.collectionPercentage}%</>
            )}
          </div>
          {!loading && !authLoading && !isLocked && (
            <Badge variant={(data?.collectionPercentage ?? 0) > 70 ? "default" : "destructive"}>
              {(data?.collectionPercentage ?? 0) > 70 ? "Bueno" : "Bajo"}
            </Badge>
          )}
        </CardContent>
      </Card>

      {/* Pagos Vencidos */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pagos Vencidos</CardTitle>
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {loading || authLoading ? (
              <LoadingBox />
            ) : isLocked ? (
              <span className="text-muted-foreground/60">Inicia sesión para ver estos datos</span>
            ) : (
              data?.overduePayments?.toLocaleString()
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {loading || authLoading ? null : isLocked ? null : (
              <>Moratorios: ${data?.totalLateFees?.toLocaleString()}</>
            )}
          </p>
        </CardContent>
      </Card>


{/* Resumen de Cobranza (desglose) */}
<Card className="col-span-full">
  <CardHeader>
    <CardTitle>Resumen de Cobranza</CardTitle>
    <CardDescription>Estado actual de pagos y morosidad</CardDescription>
  </CardHeader>

  <CardContent>
    <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
      {/* Mensualidades */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Mensualidades</p>
        <p className="text-2xl font-bold text-green-600">
          {loading || authLoading ? (
            <LoadingBox />
          ) : isLocked ? (
            <span className="text-muted-foreground/60">Inicia sesión para ver estos datos</span>
          ) : (
            <>${data?.breakdown.monthlyNormal.toLocaleString()}</>
          )}
        </p>
      </div>

      {/* Inscripciones */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Inscripciones</p>
        <p className="text-2xl font-bold text-blue-600">
          {loading || authLoading ? (
            <LoadingBox />
          ) : isLocked ? (
            <span className="text-muted-foreground/60">Inicia sesión para ver estos datos</span>
          ) : (
            <>${data?.breakdown.inscriptions.toLocaleString()}</>
          )}
        </p>
      </div>

      {/* Moratorios */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Moratorios</p>
        <p className="text-2xl font-bold text-orange-600">
          {loading || authLoading ? (
            <LoadingBox />
          ) : isLocked ? (
            <span className="text-muted-foreground/60">Inicia sesión para ver estos datos</span>
          ) : (
            <>${data?.breakdown.lateFees.toLocaleString()}</>
          )}
        </p>
      </div>

      {/* Extensión */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Extensión</p>
        <p className="text-2xl font-bold text-purple-400">
          {loading || authLoading ? (
            <LoadingBox />
          ) : isLocked ? (
            <span className="text-muted-foreground/60">Inicia sesión para ver estos datos</span>
          ) : (
            <>${data?.breakdown.extension.toLocaleString()}</>
          )}
        </p>
      </div>

      {/* Otros */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Otros</p>
        <p className="text-2xl font-bold text-amber-400">
          {loading || authLoading ? (
            <LoadingBox />
          ) : isLocked ? (
            <span className="text-muted-foreground/60">Inicia sesión para ver estos datos</span>
          ) : (
            <>${data?.breakdown.other.toLocaleString()}</>
          )}
        </p>
      </div>

      {/* Ajustes */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Ajustes</p>
        <p className="text-2xl font-bold text-cyan-600">
          {loading || authLoading ? (
            <LoadingBox />
          ) : isLocked ? (
            <span className="text-muted-foreground/60">Inicia sesión para ver estos datos</span>
          ) : (
            <>${data?.breakdown.adjustment.toLocaleString()}</>
          )}
        </p>
      </div>
    </div>
  </CardContent>
</Card>



    </div>
  )
}
