import { NextRequest, NextResponse } from 'next/server'
import { sp_konfirmasi_peminjaman } from '@/lib/procedures'

export async function POST(req: NextRequest) {
  try {
    const { id_peminjaman, keputusan } = await req.json()

    if (!id_peminjaman || !keputusan) {
      return NextResponse.json({ error: 'Semua field wajib diisi' }, { status: 400 })
    }

    await sp_konfirmasi_peminjaman(id_peminjaman, keputusan)

    return NextResponse.json({ message: `Peminjaman berhasil ${keputusan.toLowerCase()}` })
  } catch (error: unknown) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 })
  }
}