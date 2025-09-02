/*import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const student = await prisma.student.findUnique({
      where: { userId: params.id },
      include: {
        membership: {
          include: {
            plan: true,
          },
        },
        payments: {
          orderBy: { paymentDate: "desc" },
        },
      },
    })

    if (!student) {
      return NextResponse.json({ error: "Estudiante no encontrado" }, { status: 404 })
    }

    return NextResponse.json(student)
  } catch (error) {
    console.error("Error fetching student:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { name, lastName, email, phone, status } = body

    const fullName = name && lastName ? `${name} ${lastName}` : undefined

    const student = await prisma.student.update({
      where: { userId: params.id },
      data: {
        ...(name && { name }),
        ...(lastName && { lastName }),
        ...(fullName && { fullName }),
        ...(email && { email }),
        ...(phone && { phone }),
        ...(status !== undefined && { status }),
      },
      include: {
        membership: {
          include: {
            plan: true,
          },
        },
      },
    })

    return NextResponse.json({
      student,
      message: "Estudiante actualizado exitosamente",
    })
  } catch (error) {
    console.error("Error updating student:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.student.delete({
      where: { userId: params.id },
    })

    return NextResponse.json({
      message: "Estudiante eliminado exitosamente",
    })
  } catch (error) {
    console.error("Error deleting student:", error)
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

// GET /api/students/:id -> proxy a /api/alumnos/:id
export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const res = await fetch(`${API_BASE}/api/alumnos/${params.id}`, {
      headers: { "cache-control": "no-store" } as HeadersInit,
    })
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (error) {
    console.error("Error fetching student (proxy):", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

// PUT /api/students/:id -> proxy a /api/alumnos/:id
// Mapeo mínimo de campos del body a nombres esperados por el backend.
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json() as {
      name?: string
      lastName?: string
      email?: string
      phone?: string
      status?: boolean
    }

    // Adaptación ligera de nombres -> backend (puedes ajustar a tu schema)
    const payload: Record<string, unknown> = {}
    if (body.name) payload["nombre"] = body.name
    if (body.lastName) payload["apellido_paterno"] = body.lastName
    if (body.email) payload["email"] = body.email
    if (body.phone) payload["telefono"] = body.phone
    if (typeof body.status === "boolean") payload["estatus"] = body.status ? "activo" : "baja"

    const res = await fetch(`${API_BASE}/api/alumnos/${params.id}`, {
      method: "PUT",
      headers: headersWithAuth(request, { "content-type": "application/json" }),
      body: JSON.stringify(payload),
    })

    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (error) {
    console.error("Error updating student (proxy):", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

// DELETE /api/students/:id -> proxy a /api/alumnos/:id
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const res = await fetch(`${API_BASE}/api/alumnos/${params.id}`, {
      method: "DELETE",
      headers: headersWithAuth(request),
    })
    const data = await res.json().catch(() => ({}))
    return NextResponse.json(data, { status: res.status })
  } catch (error) {
    console.error("Error deleting student (proxy):", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

