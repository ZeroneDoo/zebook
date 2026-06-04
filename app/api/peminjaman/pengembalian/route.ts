import { NextRequest, NextResponse } from 'next/server'
import { sp_proses_pengembalian } from '@/lib/procedures'

export async function POST(req: NextRequest) {
  try {
    const { id_peminjaman, denda_koin } = await req.json()

    if (!id_peminjaman) {
      return NextResponse.json({ error: 'id_peminjaman wajib diisi' }, { status: 400 })
    }

    await sp_proses_pengembalian(id_peminjaman, denda_koin ?? 0)

    return NextResponse.json({ message: 'Pengembalian buku berhasil diproses' })
  } catch (error: unknown) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 })
  }
}