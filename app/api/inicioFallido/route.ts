import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const { email, password } = await req.json()

  // Aquí iría la validación contra tu base de datos o servicio de auth
  if (email === "admin@test.com" && password === "123456") {
    // ejemplo: devuelve token
    return NextResponse.json({
      success: true,
      role: "admin",
      token: "fake-jwt-token"
    })
  }

  return NextResponse.json({ success: false }, { status: 401 })
}
