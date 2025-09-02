/*import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const reportType = searchParams.get("type") || "monthly"
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const status = searchParams.get("status")

    let reportData: any = {}

    switch (reportType) {
      case "monthly":
        reportData = await generateMonthlyReport(startDate, endDate)
        break
      case "student":
        reportData = await generateStudentReport(status)
        break
      case "plan":
        reportData = await generatePlanReport()
        break
      case "collections":
        reportData = await generateCollectionsReport(startDate, endDate)
        break
      case "overdue":
        reportData = await generateOverdueReport()
        break
      default:
        return NextResponse.json({ error: "Tipo de reporte no válido" }, { status: 400 })
    }

    return NextResponse.json(reportData)
  } catch (error) {
    console.error("Error generating report:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

async function generateMonthlyReport(startDate?: string | null, endDate?: string | null) {
  const start = startDate ? new Date(startDate) : new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  const end = endDate ? new Date(endDate) : new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)

  const totalStudents = await prisma.student.count()
  const activeStudents = await prisma.student.count({
    where: { status: true },
  })

  const payments = await prisma.payment.findMany({
    where: {
      paymentDate: {
        gte: start,
        lte: end,
      },
    },
  })

  const expectedRevenue = await prisma.payment.aggregate({
    where: {
      dueDate: {
        gte: start,
        lte: end,
      },
    },
    _sum: { amount: true },
  })

  const actualRevenue = payments.filter((p) => p.status === "paid").reduce((sum, p) => sum + Number(p.amount), 0)

  const lateFees = payments.reduce((sum, p) => sum + Number(p.lateFeeAmount), 0)

  return {
    period: `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`,
    totalStudents,
    activeStudents,
    graduatedStudents: totalStudents - activeStudents,
    expectedRevenue: Number(expectedRevenue._sum.amount) || 0,
    actualRevenue,
    collectionRate: expectedRevenue._sum.amount
      ? Math.round((actualRevenue / Number(expectedRevenue._sum.amount)) * 10000) / 100
      : 0,
    lateFees: Math.round(lateFees * 100) / 100,
  }
}

async function generateStudentReport(status?: string | null) {
  const where: any = {}
  if (status && status !== "all") {
    where.status = status === "active"
  }

  const students = await prisma.student.findMany({
    where,
    include: {
      membership: {
        include: {
          plan: true,
        },
      },
      payments: true,
    },
  })

  return students.map((student) => {
    const totalPaid = student.payments.filter((p) => p.status === "paid").reduce((sum, p) => sum + Number(p.amount), 0)

    const pendingPayments = student.payments.filter((p) => p.status === "pending")
    const pendingAmount = pendingPayments.reduce((sum, p) => sum + Number(p.amount), 0)

    const lateFees = student.payments.reduce((sum, p) => sum + Number(p.lateFeeAmount), 0)

    const lastPayment = student.payments
      .filter((p) => p.status === "paid")
      .sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime())[0]

    return {
      enrollment: student.enrollment,
      studentName: student.fullName,
      plan: student.membership?.plan?.name || "Sin plan",
      totalPaid: Math.round(totalPaid * 100) / 100,
      pendingAmount: Math.round(pendingAmount * 100) / 100,
      lateFees: Math.round(lateFees * 100) / 100,
      status: student.status ? "active" : "inactive",
      lastPayment: lastPayment?.paymentDate || null,
    }
  })
}

async function generatePlanReport() {
  const plans = await prisma.plan.findMany({
    include: {
      memberships: {
        include: {
          students: true,
          payments: true,
        },
      },
    },
  })

  return plans.map((plan) => {
    const totalStudents = plan.memberships.reduce((sum, m) => sum + m.students.length, 0)
    const totalRevenue = plan.memberships.reduce((sum, membership) => {
      return (
        sum + membership.payments.filter((p) => p.status === "paid").reduce((pSum, p) => pSum + Number(p.amount), 0)
      )
    }, 0)

    return {
      planName: plan.name,
      monthlyPayments: plan.monthlyPayments,
      monthlyAmount: Number(plan.monthlyAmount),
      inscriptionFee: Number(plan.inscriptionFee),
      totalStudents,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      averageRevenuePerStudent: totalStudents > 0 ? Math.round((totalRevenue / totalStudents) * 100) / 100 : 0,
    }
  })
}

async function generateCollectionsReport(startDate?: string | null, endDate?: string | null) {
  const start = startDate ? new Date(startDate) : new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  const end = endDate ? new Date(endDate) : new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)

  const paymentsByType = await prisma.payment.groupBy({
    by: ["paymentType"],
    where: {
      status: "paid",
      paymentDate: {
        gte: start,
        lte: end,
      },
    },
    _sum: {
      amount: true,
      lateFeeAmount: true,
    },
    _count: true,
  })

  const paymentsByMethod = await prisma.payment.groupBy({
    by: ["paymentMethod"],
    where: {
      status: "paid",
      paymentDate: {
        gte: start,
        lte: end,
      },
    },
    _sum: {
      amount: true,
    },
    _count: true,
  })

  return {
    period: `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`,
    paymentsByType,
    paymentsByMethod,
  }
}

async function generateOverdueReport() {
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
          email: true,
        },
      },
    },
    orderBy: { dueDate: "asc" },
  })

  const currentDate = new Date()

  return overduePayments.map((payment) => {
    const dueDate = new Date(payment.dueDate)
    const diffTime = currentDate.getTime() - dueDate.getTime()
    const daysPastDue = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    const lateFeeAmount = Number(payment.amount) * 0.01 * daysPastDue

    return {
      ...payment,
      daysPastDue,
      lateFeeAmount: Math.round(lateFeeAmount * 100) / 100,
      totalAmount: Math.round((Number(payment.amount) + lateFeeAmount) * 100) / 100,
    }
  })
}
*/

import { type NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.API_BASE_URL ||
  "http://localhost:3001"

// headers -> HeadersInit tipado (evita el error de overload)
function headersWithAuth(req: Request, extra: Record<string, string> = {}): HeadersInit {
  const h = new Headers(extra)
  const auth = req.headers.get("authorization")
  if (auth) h.set("Authorization", auth)
  return h
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const reportType = searchParams.get("type") || "monthly"
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const status = searchParams.get("status")

    let reportData: unknown

    switch (reportType) {
      case "monthly":
        reportData = await generateMonthlyReport(request, startDate, endDate)
        break
      case "student":
        reportData = await generateStudentReport(request, status)
        break
      case "plan":
        reportData = await generatePlanReport(request)
        break
      case "collections":
        reportData = await generateCollectionsReport(request, startDate, endDate)
        break
      case "overdue":
        reportData = await generateOverdueReport(request)
        break
      default:
        return NextResponse.json({ error: "Tipo de reporte no válido" }, { status: 400 })
    }

    return NextResponse.json(reportData)
  } catch (error) {
    console.error("Error generating report (proxy):", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

/* ------------- Delegaciones al backend ------------- */

async function proxyReport(
  req: Request,
  params: Record<string, string | undefined>
): Promise<unknown> {
  const sp = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v != null && v !== "") sp.set(k, v)
  })
  const res = await fetch(`${API_BASE}/api/reportes?${sp.toString()}`, {
    headers: headersWithAuth(req, { "cache-control": "no-store" }),
  })
  // Si el backend devuelve error, lo propagamos con el mismo status
  if (!res.ok) {
    const payload = await res.json().catch(() => ({ error: "Error en backend" }))
    throw new Response(JSON.stringify(payload), { status: res.status })
  }
  return res.json()
}

async function generateMonthlyReport(req: Request, startDate?: string | null, endDate?: string | null) {
  return proxyReport(req, { type: "monthly", startDate: startDate ?? undefined, endDate: endDate ?? undefined })
}

async function generateStudentReport(req: Request, status?: string | null) {
  return proxyReport(req, { type: "student", status: status ?? undefined })
}

async function generatePlanReport(req: Request) {
  return proxyReport(req, { type: "plan" })
}

async function generateCollectionsReport(req: Request, startDate?: string | null, endDate?: string | null) {
  return proxyReport(req, { type: "collections", startDate: startDate ?? undefined, endDate: endDate ?? undefined })
}

async function generateOverdueReport(req: Request) {
  return proxyReport(req, { type: "overdue" })
}
