/*import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET() {
  try {
    const plans = await prisma.plan.findMany({
      include: {
        memberships: {
          include: {
            students: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    const plansWithStats = plans.map((plan) => ({
      ...plan,
      totalStudents: plan.memberships.reduce((sum, membership) => sum + membership.students.length, 0),
    }))

    return NextResponse.json(plansWithStats)
  } catch (error) {
    console.error("Error fetching plans:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      name,
      monthlyPayments,
      monthlyAmount,
      inscriptionFee,
      validityMonths = 12,
      extensionMonths = 4,
      siteId = "default-site-id",
    } = body

    // Validaciones
    if (!name || !monthlyPayments || !monthlyAmount || !inscriptionFee) {
      return NextResponse.json({ error: "Todos los campos son requeridos" }, { status: 400 })
    }

    const plan = await prisma.plan.create({
      data: {
        siteId,
        name,
        monthlyPayments: Number.parseInt(monthlyPayments),
        monthlyAmount: Number.parseFloat(monthlyAmount),
        inscriptionFee: Number.parseFloat(inscriptionFee),
        validityMonths: Number.parseInt(validityMonths),
        extensionMonths: Number.parseInt(extensionMonths),
        status: true,
      },
    })

    return NextResponse.json(
      {
        plan,
        message: "Plan creado exitosamente",
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating plan:", error)
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

// Helper compartido
function headersWithAuth(req: Request, extra: Record<string, string> = {}): HeadersInit {
  const h = new Headers(extra)
  const auth = req.headers.get("authorization")
  if (auth) h.set("Authorization", auth)
  return h
}

type PlanMembership = { students?: unknown[] }
type Plan = { memberships?: PlanMembership[]; [k: string]: unknown }

// GET /api/plans -> proxy a /api/planes
export async function GET() {
  try {
    const res = await fetch(`${API_BASE}/api/planes?include=memberships`, {
      headers: { "cache-control": "no-store" } as HeadersInit,
    })
    const raw = await res.json()

    const items: Plan[] = Array.isArray(raw) ? raw : raw?.data || []
    const plansWithStats = items.map((plan: Plan) => {
      const memberships = plan.memberships ?? []
      const totalStudents = memberships.reduce((sum: number, m: PlanMembership) => {
        const count = Array.isArray(m?.students) ? m.students!.length : 0
        return sum + count
      }, 0)
      return { ...plan, totalStudents }
    })

    return NextResponse.json(plansWithStats, { status: res.status })
  } catch (error) {
    console.error("Error fetching plans (proxy):", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

// POST /api/plans -> proxy a /api/planes
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      name,
      monthlyPayments,
      monthlyAmount,
      inscriptionFee,
      validityMonths = 12,
      extensionMonths = 4,
      siteId = "default-site-id",
    } = body ?? {}

    if (!name || !monthlyPayments || !monthlyAmount || !inscriptionFee) {
      return NextResponse.json({ error: "Todos los campos son requeridos" }, { status: 400 })
    }

    const res = await fetch(`${API_BASE}/api/planes`, {
      method: "POST",
      headers: headersWithAuth(request, { "content-type": "application/json" }),
      body: JSON.stringify({
        name,
        monthlyPayments,
        monthlyAmount,
        inscriptionFee,
        validityMonths,
        extensionMonths,
        siteId,
      }),
    })

    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (error) {
    console.error("Error creating plan (proxy):", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
