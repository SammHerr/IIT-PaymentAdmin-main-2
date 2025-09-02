/*import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const studentId = searchParams.get("studentId")
    const status = searchParams.get("status")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    const skip = (page - 1) * limit

    const where: any = {}

    if (studentId) {
      where.studentId = studentId
    }

    if (status && status !== "all") {
      where.status = status
    }

    if (startDate && endDate) {
      where.paymentDate = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      }
    }

    const payments = await prisma.payment.findMany({
      where,
      include: {
        student: {
          select: {
            enrollment: true,
            fullName: true,
          },
        },
        membership: {
          include: {
            plan: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    })

    const total = await prisma.payment.count({ where })

    return NextResponse.json({
      payments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching payments:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { studentId, amount, paymentMethod, paymentType, dueDate, notes } = body

    // Validaciones
    if (!studentId || !amount || !paymentMethod || !paymentType) {
      return NextResponse.json({ error: "Datos requeridos faltantes" }, { status: 400 })
    }

    // Verificar que el estudiante existe
    const student = await prisma.student.findUnique({
      where: { userId: studentId },
      include: { membership: true },
    })

    if (!student) {
      return NextResponse.json({ error: "Estudiante no encontrado" }, { status: 404 })
    }

    // Generar número de recibo único
    const lastPayment = await prisma.payment.findFirst({
      orderBy: { receiptNumber: "desc" },
    })

    let receiptNumber = "REC001"
    if (lastPayment?.receiptNumber) {
      const lastNumber = Number.parseInt(lastPayment.receiptNumber.replace("REC", ""))
      receiptNumber = `REC${(lastNumber + 1).toString().padStart(3, "0")}`
    }

    // Calcular moratorio si aplica
    const paymentDate = new Date()
    const dueDateObj = new Date(dueDate)
    const diffTime = paymentDate.getTime() - dueDateObj.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    const lateFeeDays = diffDays > 0 ? diffDays : 0
    const lateFeeAmount = lateFeeDays > 0 ? amount * 0.01 * lateFeeDays : 0

    const payment = await prisma.payment.create({
      data: {
        studentId,
        membershipId: student.membershipId,
        receiptNumber,
        amount: Number.parseFloat(amount),
        paymentDate,
        dueDate: dueDateObj,
        paymentMethod,
        paymentType,
        lateFeeDays,
        lateFeeAmount,
        status: "paid",
        notes,
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

    // Actualizar el monto pagado en la membresía
    if (student.membershipId) {
      await prisma.membership.update({
        where: { membershipId: student.membershipId },
        data: {
          paidAmount: {
            increment: Number.parseFloat(amount) + lateFeeAmount,
          },
        },
      })
    }

    return NextResponse.json(
      {
        payment,
        message: "Pago registrado exitosamente",
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating payment:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

*/

import { type NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.API_BASE_URL ||
  "http://localhost:3001"

// Helper: arma HeadersInit con auth opcional
function headersWithAuth(req: Request, extra: Record<string, string> = {}): HeadersInit {
  const h = new Headers(extra)
  const auth = req.headers.get("authorization")
  if (auth) h.set("Authorization", auth)
  return h
}

// GET /api/payments -> proxy al backend /api/pagos
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const qs = new URLSearchParams({
      page: searchParams.get("page") ?? "1",
      limit: searchParams.get("limit") ?? "10",
      ...(searchParams.get("studentId") ? { studentId: searchParams.get("studentId")! } : {}),
      ...(searchParams.get("status") ? { status: searchParams.get("status")! } : {}),
      ...(searchParams.get("startDate") ? { startDate: searchParams.get("startDate")! } : {}),
      ...(searchParams.get("endDate") ? { endDate: searchParams.get("endDate")! } : {}),
    }).toString()

    const res = await fetch(`${API_BASE}/api/pagos${qs ? `?${qs}` : ""}`, {
      headers: headersWithAuth(request, { "cache-control": "no-store" }),
    })

    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (error) {
    console.error("Error fetching payments (proxy):", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

// POST /api/payments -> proxy al backend /api/pagos
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { studentId, amount, paymentMethod, paymentType } = body ?? {}
    if (!studentId || !amount || !paymentMethod || !paymentType) {
      return NextResponse.json({ error: "Datos requeridos faltantes" }, { status: 400 })
    }

    const res = await fetch(`${API_BASE}/api/pagos`, {
      method: "POST",
      headers: headersWithAuth(request, { "content-type": "application/json" }),
      body: JSON.stringify(body),
    })

    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (error) {
    console.error("Error creating payment (proxy):", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
