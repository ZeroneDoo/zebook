import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'

type Params = { params: Promise<{ id: string }> }

// PUT update data staff
export async function PUT(req: NextRequest, { params }: Params) {
  try {
    console.log('Received PUT request with params:', params)
    const { id: id_staff } = await params
    const body = await req.json()
    const { username, nama_staff, password } = body

    // Cek apakah staff ada
    const existing = await prisma.staff.findUnique({ where: { id_staff } })
    if (!existing) return NextResponse.json({ error: 'Staff tidak ditemukan' }, { status: 404 })

    const updatedData: Record<string, string> = {
      username,
      nama_staff,
    }

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10)
      updatedData.password = hashedPassword
    }

    const updatedStaff = await prisma.staff.update({
      where: { id_staff },
      data: updatedData
    })

    return NextResponse.json(updatedStaff, { status: 200 })
  } catch (error: unknown) {
    console.error(error)
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002') {
      return NextResponse.json({ error: 'Username sudah digunakan' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Gagal memperbarui data staff' }, { status: 500 })
  }
}

// DELETE hapus data staff
export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const { id: id_staff } = await params

    const existing = await prisma.staff.findUnique({ where: { id_staff } })
    if (!existing) return NextResponse.json({ error: 'Staff tidak ditemukan' }, { status: 404 })

    await prisma.staff.delete({ where: { id_staff } })

    return NextResponse.json({ message: 'Staff berhasil dihapus' }, { status: 200 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Gagal menghapus staff' }, { status: 500 })
  }
}