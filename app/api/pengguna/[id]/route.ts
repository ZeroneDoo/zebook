import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'

type Params = { params: Promise<{ id: string }> }

// GET pengguna by id
export async function GET(_: NextRequest, { params }: Params) {
  try {
    const { id: id_pengguna } = await params
    const pengguna = await prisma.pengguna.findUnique({
      where: { id_pengguna },
      select: {
        id_pengguna: true,
        nama_pengguna: true,
        email: true,
        koin: true,
        stamp: true,
      }
    })

    if (!pengguna) {
      return NextResponse.json({ error: 'Pengguna tidak ditemukan' }, { status: 404 })
    }

    return NextResponse.json(pengguna)
  } catch {
    return NextResponse.json({ error: 'Gagal mengambil data' }, { status: 500 })
  }
}

// PUT update pengguna
export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const body = await req.json()
    const { nama_pengguna, email, koin, stamp, password } = body
    const { id: id_pengguna } = await params
    const hashedPassword = await bcrypt.hash(password, 10)
    

    const pengguna = await prisma.pengguna.update({
      where: { id_pengguna },
      data: { nama_pengguna, email, koin, stamp, password: hashedPassword }
    })

    return NextResponse.json(pengguna)
  } catch (error: unknown) {
    if (error instanceof Error && 'code' in error && error.code === 'P2025') {
      return NextResponse.json({ error: 'Pengguna tidak ditemukan' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Gagal mengupdate pengguna' }, { status: 500 })
  }

}

// DELETE pengguna
export async function DELETE(_: NextRequest, { params }: Params) {
  try {
    const { id: id_pengguna } = await params
    await prisma.pengguna.delete({
      where: { id_pengguna }
    })

    return NextResponse.json({ message: 'Pengguna berhasil dihapus' })
  } catch (error: unknown) {
    if (error instanceof Error && 'code' in error && error.code === 'P2025') {
      return NextResponse.json({ error: 'Pengguna tidak ditemukan' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Gagal mengupdate pengguna' }, { status: 500 })
  }
}