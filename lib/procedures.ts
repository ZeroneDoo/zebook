import prisma from './prisma'

// ---------------------------
// SP BELI KOIN
// ---------------------------
export async function sp_beli_koin(
  id_pengguna: string,
  metode_bayar: 'E-MONEY' | 'VA' | 'OUTLET' | 'QRIS',
  id_koin: string
) {
  // Gunakan executeRaw karena SP ini tidak return result set
  await prisma.$executeRaw`
    CALL sp_beli_koin(${id_pengguna}, ${metode_bayar}, ${id_koin})
  `
}

// ---------------------------
// SP BUAT PEMINJAMAN
// ---------------------------
export async function sp_buat_peminjaman(
  id_pengguna: string,
  id_buku: string,
  tgl_pinjam: Date,
  tgl_kembali: Date,
  metode: 'KOIN' | 'STAMP'
) {
  // Gunakan queryRaw karena SP ini return SELECT di akhir
  const result = await prisma.$queryRaw<unknown[]>`
    CALL sp_buat_peminjaman(
      ${id_pengguna},
      ${id_buku},
      ${tgl_pinjam},
      ${tgl_kembali},
      ${metode}
    )
  `
  return result[0] // SP return row peminjaman yang baru dibuat
}

// ---------------------------
// SP KONFIRMASI PEMINJAMAN
// ---------------------------
export async function sp_konfirmasi_peminjaman(
  id_peminjaman: string,
  keputusan: 'DITERIMA' | 'DITOLAK'
) {
  await prisma.$executeRaw`
    CALL sp_konfirmasi_peminjaman(${id_peminjaman}, ${keputusan})
  `
}

// ---------------------------
// SP PROSES PENGEMBALIAN
// ---------------------------
export async function sp_proses_pengembalian(
  id_peminjaman: string,
  denda_koin: number
) {
  await prisma.$executeRaw`
    CALL sp_proses_pengembalian(${id_peminjaman}, ${denda_koin})
  `
}