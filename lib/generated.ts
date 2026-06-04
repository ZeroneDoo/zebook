import prisma from './prisma'
const ID_CONFIG = {
  pengguna: {
    table: "pengguna",
    column: "id_pengguna",
    prefix: "PGG",
    pad: 4, // 3 (PGG) + 4 = CHAR(7)
  },
  staff: {
    table: "staff",
    column: "id_staff",
    prefix: "STF",
    pad: 4, // 3 (STF) + 4 = CHAR(7)
  },
  kategori: {
    table: "kategori",
    column: "id_kategori",
    prefix: "KAT",
    pad: 4, // 3 (KAT) + 4 = CHAR(7)
  },
  buku: {
    table: "buku",
    column: "id_buku",
    prefix: "BK",
    pad: 4, // 2 (BK) + 4 = CHAR(6)
  },
  koin: {
    table: "koin",
    column: "id_koin",
    prefix: "KN",
    pad: 2, // 2 (KN) + 2 = CHAR(4)
  },
  detail_buku: {
    table: "detail_buku",
    column: "id_detail_buku",
    prefix: "DB",
    pad: 2, // 2 (DB) + 2 = CHAR(4)
  },
  transaksi_koin: {
    table: "transaksi_koin",
    column: "id_transaksi_koin",
    prefix: "TK",
    pad: 2, // 2 (TK) + 2 = CHAR(4)
  },
  peminjaman_buku: {
    table: "peminjaman_buku",
    column: "id_peminjaman",
    prefix: "PJM",
    pad: 4, // 3 (PJM) + 4 = CHAR(7)
  },
} as const;

type ModelWithId = keyof typeof ID_CONFIG;

export async function generateId(model: ModelWithId): Promise<string> {
  const config = ID_CONFIG[model];
  const startPos = config.prefix.length + 1; // 👈 Dynamically calculates where numbers start

  return await prisma.$transaction(async (tx) => {
    const result = await tx.$queryRawUnsafe<{ maxNumber: number }[]>(`
      SELECT IFNULL(MAX(CAST(SUBSTRING(${config.column}, ${startPos}) AS UNSIGNED)), 0) AS maxNumber
      FROM ${config.table}
      FOR UPDATE
    `);

    console.log(`generateId for ${model}:`, result);

    const nextNumber = Number(result[0].maxNumber) + 1;
    return `${config.prefix}${String(nextNumber).padStart(config.pad, "0")}`;
  });
}