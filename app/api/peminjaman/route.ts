import { NextRequest, NextResponse } from 'next/server'
import { sp_buat_peminjaman } from '@/lib/procedures'

export async function POST(req: NextRequest) {
  try {
    const { id_pengguna, id_buku, tgl_pinjam, tgl_kembali, metode } = await req.json()

    if (!id_pengguna || !id_buku || !tgl_pinjam || !tgl_kembali || !metode) {
      return NextResponse.json({ error: 'Semua field wajib diisi' }, { status: 400 })
    }

    const peminjaman = await sp_buat_peminjaman(
      id_pengguna,
      id_buku,
      new Date(tgl_pinjam),
      new Date(tgl_kembali),
      metode
    )

    return NextResponse.json(peminjaman, { status: 201 })
  } catch (error: unknown) {
    // Error dari SIGNAL SQLSTATE (stok habis, koin kurang, dll)
    return NextResponse.json({ error: (error as Error).message }, { status: 400 })
  }
}