import { getServerSession } from "next-auth"
import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"
import { authOptions } from "@/core/auth"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const user = await prisma.pengguna.findUnique({
    where: { id_pengguna: session.user.id },
    select: {
      id_pengguna: true,
      nama_pengguna: true,
      email: true,
      koin: true,
      stamp: true,
    }
  })

  return NextResponse.json(user)
}