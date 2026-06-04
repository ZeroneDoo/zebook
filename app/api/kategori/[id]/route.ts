import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

type Params = { params: Promise<{ id: string }> }

export async function GET(_: NextRequest, { params }: Params) {
  try {
    const { id : id_kategori } = await params 
    const kategori = await prisma.kategori.findUnique({
      where: { id_kategori },
      include: { buku_kategori: { include: { buku: true } } }
    })
    if (!kategori) return NextResponse.json({ error: 'Kategori tidak ditemukan' }, { status: 404 })
    return NextResponse.json(kategori)
  } catch (_) {
    return NextResponse.json({ error: 'Gagal mengambil data' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const { id : id_kategori } = await params 
    const { nama_kategori } = await req.json()
    const kategori = await prisma.kategori.update({
      where: { id_kategori },
      data: { nama_kategori }
    })
    return NextResponse.json(kategori)
  } catch (error: unknown) {
    if (error instanceof Error && 'code' in error && error.code === 'P2025') {
      return NextResponse.json({ error: 'Kategori tidak ditemukan' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Gagal mengupdate kategori' }, { status: 500 })
  }
}

export async function DELETE(_: NextRequest, { params }: Params) {
  try {
    const { id : id_kategori } = await params
    await prisma.$transaction([
      prisma.buku_kategori.deleteMany({ where: { id_kategori } }),
      prisma.kategori.delete({ where: { id_kategori } })
    ])
    return NextResponse.json({ message: 'Kategori berhasil dihapus' })
  } catch (error: unknown) {
    if (error instanceof Error && 'code' in error && error.code === 'P2025') {
      return NextResponse.json({ error: 'Kategori tidak ditemukan' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Gagal menghapus kategori' }, { status: 500 })
  }
}