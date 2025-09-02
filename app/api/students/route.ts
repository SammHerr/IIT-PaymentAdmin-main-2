/*import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""
    const status = searchParams.get("status") || "all"

    const skip = (page - 1) * limit

    const where: any = {}

    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: "insensitive" } },
        { enrollment: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ]
    }

    if (status !== "all") {
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
        payments: {
          orderBy: { paymentDate: "desc" },
          take: 1,
        },
      },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    })

    const total = await prisma.student.count({ where })

    return NextResponse.json({
      students,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching students:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, lastName, email, phone, planId, siteId = "default-site-id" } = body

    // Validaciones básicas
    if (!name || !lastName || !planId) {
      return NextResponse.json({ error: "Nombre, apellidos y plan son requeridos" }, { status: 400 })
    }

    // Generar matrícula única
    const lastStudent = await prisma.student.findFirst({
      orderBy: { enrollment: "desc" },
    })

    let enrollmentNumber = 1
    if (lastStudent?.enrollment) {
      const lastNumber = Number.parseInt(lastStudent.enrollment.replace("ENG", ""))
      enrollmentNumber = lastNumber + 1
    }

    const enrollment = `ENG${enrollmentNumber.toString().padStart(3, "0")}`

    // Crear username único
    const username = `${name.toLowerCase()}.${lastName.toLowerCase()}`.replace(/\s+/g, "")

    // Password temporal
    const tempPassword = Math.random().toString(36).slice(-8)
    const hashedPassword = await bcrypt.hash(tempPassword, 10)

    const fullName = `${name} ${lastName}`

    // Obtener información del plan
    const plan = await prisma.plan.findUnique({
      where: { planId },
    })

    if (!plan) {
      return NextResponse.json({ error: "Plan no encontrado" }, { status: 404 })
    }

    // Crear membresía
    const startDate = new Date()
    const endDate = new Date()
    endDate.setMonth(endDate.getMonth() + plan.validityMonths)

    const extensionDate = new Date(endDate)
    extensionDate.setMonth(extensionDate.getMonth() + plan.extensionMonths)

    const membership = await prisma.membership.create({
      data: {
        planId,
        startDate,
        endDate,
        extensionDate,
        totalAmount: plan.monthlyAmount * plan.monthlyPayments + plan.inscriptionFee,
        paidAmount: 0,
        status: "active",
      },
    })

    // Crear estudiante
    const student = await prisma.student.create({
      data: {
        siteId,
        membershipId: membership.membershipId,
        enrollment,
        username,
        name,
        lastName,
        fullName,
        email,
        phone,
        password: hashedPassword,
        registration: startDate,
        expiration: endDate,
        expirationExtension: extensionDate,
      },
      include: {
        membership: {
          include: {
            plan: true,
          },
        },
      },
    })

    return NextResponse.json(
      {
        student,
        tempPassword,
        message: "Estudiante creado exitosamente",
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating student:", error)
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

function headersWithAuth(req: Request, extra: Record<string, string> = {}): HeadersInit {
  const h = new Headers(extra)
  const auth = req.headers.get("authorization")
  if (auth) h.set("Authorization", auth)
  return h
}

// GET /api/students -> proxy a /api/alumnos
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = searchParams.get("page") ?? "1"
    const limit = searchParams.get("limit") ?? "10"
    const search = searchParams.get("search") ?? ""

    // status(front) -> estatus(backend)
    const status = searchParams.get("status") ?? "all"
    const estatus =
      status === "all" ? undefined : status === "active" ? "activo" : "baja" // ajusta si tu backend usa otro valor

    const sp = new URLSearchParams({
      page,
      limit,
      ...(search ? { search } : {}),
      ...(estatus ? { estatus } : {}),
    })

    const res = await fetch(`${API_BASE}/api/alumnos?${sp.toString()}`, {
      headers: { "cache-control": "no-store" } as HeadersInit,
    })

    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (error) {
    console.error("Error fetching students (proxy):", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

// POST /api/students -> proxy a /api/alumnos
// Nota: si tu backend espera un schema distinto (campos en español), aquí es donde mapeas.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      name?: string
      lastName?: string
      email?: string
      phone?: string
      planId?: number | string
      siteId?: string
    }

    // Adaptación mínima a nombres del backend.
    const todayISO = new Date().toISOString().slice(0, 10)
    const payload: Record<string, unknown> = {
      // valores por defecto razonables para que el backend no truene por campos requeridos
      fecha_inscripcion: todayISO,
      fecha_inicio: todayISO,
      estatus: "activo",
    }

    if (body.name) payload["nombre"] = body.name
    if (body.lastName) payload["apellido_paterno"] = body.lastName
    if (body.email) payload["email"] = body.email
    if (body.phone) payload["telefono"] = body.phone
    if (body.planId) payload["plan_id"] = Number(body.planId)

    const res = await fetch(`${API_BASE}/api/alumnos`, {
      method: "POST",
      headers: headersWithAuth(request, { "content-type": "application/json" }),
      body: JSON.stringify(payload),
    })

    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (error) {
    console.error("Error creating student (proxy):", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
