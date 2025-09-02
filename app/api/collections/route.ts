/*import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const month = searchParams.get("month") || new Date().toISOString().slice(0, 7)

    // Obtener fecha de inicio y fin del mes
    const startDate = new Date(`${month}-01`)
    const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0)

    // Estadísticas generales
    const totalStudents = await prisma.student.count({
      where: { status: true },
    })

    const activeStudents = await prisma.student.count({
      where: {
        status: true,
        expiration: { gte: new Date() },
      },
    })

    // Pagos del mes
    const monthlyPayments = await prisma.payment.findMany({
      where: {
        dueDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        student: {
          select: {
            enrollment: true,
            fullName: true,
          },
        },
      },
    })

    const expectedAmount = monthlyPayments.reduce((sum, payment) => sum + Number(payment.amount), 0)
    const collectedAmount = monthlyPayments
      .filter((payment) => payment.status === "paid")
      .reduce((sum, payment) => sum + Number(payment.amount), 0)

    const collectionPercentage = expectedAmount > 0 ? (collectedAmount / expectedAmount) * 100 : 0

    // Pagos vencidos
    const overduePayments = await prisma.payment.findMany({
      where: {
        status: "pending",
        dueDate: { lt: new Date() },
      },
      include: {
        student: {
          select: {
            enrollment: true,
            fullName: true,
            phone: true,
          },
        },
      },
      orderBy: { dueDate: "asc" },
    })

    // Calcular moratorios
    const currentDate = new Date()
    const overdueWithLateFees = overduePayments.map((payment) => {
      const dueDate = new Date(payment.dueDate)
      const diffTime = currentDate.getTime() - dueDate.getTime()
      const daysPastDue = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      const lateFeeAmount = Number(payment.amount) * 0.01 * daysPastDue

      return {
        ...payment,
        daysPastDue,
        lateFeeAmount,
        totalAmount: Number(payment.amount) + lateFeeAmount,
      }
    })

    const totalLateFees = overdueWithLateFees.reduce((sum, payment) => sum + payment.lateFeeAmount, 0)

    // Desglose por tipo de pago
    const paymentsByType = await prisma.payment.groupBy({
      by: ["paymentType"],
      where: {
        status: "paid",
        paymentDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      _sum: {
        amount: true,
      },
    })

    return NextResponse.json({
      summary: {
        month: month,
        totalStudents,
        activeStudents,
        expectedAmount,
        collectedAmount,
        collectionPercentage: Math.round(collectionPercentage * 100) / 100,
        overdueStudents: overduePayments.length,
        totalLateFees: Math.round(totalLateFees * 100) / 100,
      },
      overduePayments: overdueWithLateFees,
      paymentsByType,
    })
  } catch (error) {
    console.error("Error fetching collections data:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
*/

import { NextResponse, type NextRequest } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.API_BASE_URL ||
  "http://localhost:3001"

type StudentLite = {
  enrollment: string
  fullName: string
  phone?: string | null
}

type Payment = {
  id: number
  amount: number | string
  status: "paid" | "pending" | string
  paymentType?: string | null
  paymentDate?: string | null
  dueDate: string
  student?: StudentLite
}

/** Helper para hacer fetch al backend con manejo de errores y fallback */
async function fetchJSON<T>(path: string, init?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      cache: "no-store",
      ...init,
      headers: {
        "content-type": "application/json",
        ...(init?.headers || {}),
      },
    })
    if (!res.ok) return null
    return (await res.json()) as T
  } catch {
    return null
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const month = searchParams.get("month") || new Date().toISOString().slice(0, 7)

    // Rango del mes
    const startDate = new Date(`${month}-01`)
    const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0)

    // ---------------------------
    // 1) Estadísticas de alumnos
    // ---------------------------
    // Intentamos obtener desde dashboard del backend (si lo tienes)
    // Estructura esperada: { ok: true, data: { alumnos, ingresos, pendientes, vencidas } }
    const dashboard = await fetchJSON<{
      ok: boolean
      data: { alumnos: number; ingresos: number; pendientes: number; vencidas: number }
    }>("/api/dashboard")

    const totalStudents = dashboard?.data?.alumnos ?? 0

    // Activos = con estatus activo y vigentes (si tu backend lo calcula).
    // Si no está disponible, usamos el mismo total como aproximación conservadora.
    const activeStudents = dashboard?.data?.alumnos ?? 0

    // ---------------------------
    // 2) Pagos del mes
    // ---------------------------
    // Idealmente tu backend debería exponer:
    // GET /api/pagos?from=YYYY-MM-DD&to=YYYY-MM-DD
    // De no existir todavía, devolvemos []
    const from = startDate.toISOString().slice(0, 10)
    const to = endDate.toISOString().slice(0, 10)

    const monthlyPaymentsResp = await fetchJSON<{
      ok?: boolean
      data?: Payment[]
    }>(`/api/pagos?from=${from}&to=${to}`)

    const monthlyPayments: Payment[] = monthlyPaymentsResp?.data ?? []

    // Monto esperado del mes (suma de todas las mensualidades del rango)
    const expectedAmount = monthlyPayments.reduce<number>((sum, payment) => {
      return sum + Number(payment.amount ?? 0)
    }, 0)

    // Monto cobrado del mes (solo pagos en estado "paid")
    const collectedAmount = monthlyPayments
      .filter((p) => p.status === "paid")
      .reduce<number>((sum, payment) => sum + Number(payment.amount ?? 0), 0)

    const collectionPercentage =
      expectedAmount > 0 ? (collectedAmount / expectedAmount) * 100 : 0

    // ---------------------------
    // 3) Pagos vencidos y moratorios
    // ---------------------------
    const now = new Date()

    // Si backend no devuelve vencidos, los inferimos de los del mes:
    const overduePaymentsSource: Payment[] =
      monthlyPaymentsResp?.data?.length
        ? monthlyPayments.filter(
            (p) => p.status === "pending" && new Date(p.dueDate) < now
          )
        : []

    const overdueWithLateFees = overduePaymentsSource.map((payment) => {
      const due = new Date(payment.dueDate)
      const diffMs = now.getTime() - due.getTime()
      const daysPastDue = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)))
      const baseAmount = Number(payment.amount ?? 0)
      const lateFeeAmount = baseAmount * 0.01 * daysPastDue

      return {
        ...payment,
        daysPastDue,
        lateFeeAmount,
        totalAmount: baseAmount + lateFeeAmount,
      }
    })

    const totalLateFees = overdueWithLateFees.reduce<number>(
      (sum, p) => sum + (Number(p.lateFeeAmount) || 0),
      0
    )

    // ---------------------------
    // 4) Desglose por tipo de pago (paid en el rango)
    // ---------------------------
    const paidInRange = monthlyPayments.filter(
      (p) =>
        p.status === "paid" &&
        new Date(p.dueDate) >= startDate &&
        new Date(p.dueDate) <= endDate
    )

    const paymentsByTypeMap = new Map<
      string,
      { paymentType: string; _sum: { amount: number } }
    >()

    for (const p of paidInRange) {
      const t = p.paymentType ?? "unknown"
      const current = paymentsByTypeMap.get(t) ?? { paymentType: t, _sum: { amount: 0 } }
      current._sum.amount += Number(p.amount ?? 0)
      paymentsByTypeMap.set(t, current)
    }

    const paymentsByType = Array.from(paymentsByTypeMap.values())

    // ---------------------------
    // 5) Respuesta
    // ---------------------------
    return NextResponse.json({
      summary: {
        month,
        totalStudents,
        activeStudents,
        expectedAmount,
        collectedAmount,
        collectionPercentage: Math.round(collectionPercentage * 100) / 100,
        overdueStudents: overdueWithLateFees.length,
        totalLateFees: Math.round(totalLateFees * 100) / 100,
      },
      overduePayments: overdueWithLateFees,
      paymentsByType,
    })
  } catch (error) {
    console.error("Error fetching collections data (proxy):", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
