export const detailBukuStatus = {
  TERSEDIA: 'TERSEDIA',
  DIPESAN: 'DIPESAN',
  DIPINJAM: 'DIPINJAM',
  HILANG: 'HILANG',
  RUSAK: 'RUSAK'
} as const;

export type detail_buku_status = keyof typeof detailBukuStatus;