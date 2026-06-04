import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

type Params = { params: Promise<{ id: string }> }

export async function GET(_: NextRequest, { params }: Params) {
  try {
    const { id: id_koin } = await params
    const koin = await prisma.koin.findUnique({
      where: { id_koin }
    })
    if (!koin) return NextResponse.json({ error: 'Koin tidak ditemukan' }, { status: 404 })
    return NextResponse.json(koin)
  } catch (_) {
    return NextResponse.json({ error: 'Gagal mengambil data' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const { id: id_koin } = await params
    const { jum_koin, harga } = await req.json()
    const koin = await prisma.koin.update({
      where: { id_koin },
      data: { jum_koin, harga }
    })
    return NextResponse.json(koin)
  } catch (error: unknown) {
    if (error instanceof Error && 'code' in error && error.code === 'P2025') {
      return NextResponse.json({ error: 'Koin tidak ditemukan' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Gagal mengupdate koin' }, { status: 500 })
  }
}

export async function DELETE(_: NextRequest, { params }: Params) {
  try {
    const { id: id_koin } = await params
    await prisma.$transaction([
      prisma.koin.delete({ where: { id_koin } })
    ])
    return NextResponse.json({ message: 'Koin berhasil dihapus' })
  } catch (error: unknown) {
    if (error instanceof Error && 'code' in error && error.code === 'P2025') {
      return NextResponse.json({ error: 'Koin tidak ditemukan' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Gagal menghapus koin' }, { status: 500 })
  }
}