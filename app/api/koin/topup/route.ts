import { NextRequest, NextResponse } from 'next/server'
import { sp_beli_koin } from '@/lib/procedures'

export async function POST(req: NextRequest) {
  try {
    const { id_pengguna, metode_bayar, id_koin } = await req.json()

    if (!id_pengguna || !metode_bayar || !id_koin) {
      return NextResponse.json({ error: 'Semua field wajib diisi' }, { status: 400 })
    }

    await sp_beli_koin(id_pengguna, metode_bayar, id_koin)

    return NextResponse.json({ message: 'Pembelian koin berhasil' })
  } catch (error: unknown) {
    // Tangkap error dari SIGNAL SQLSTATE di SP
    return NextResponse.json({ error: (error as Error).message }, { status: 400 })
  }
}