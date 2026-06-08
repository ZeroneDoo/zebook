import { Prisma } from "@/app/generated/prisma/client";

export type DetailBukuModel = Prisma.detail_bukuGetPayload<{
  include: { buku: { select: { judul: true } } };
}>;

export type TransaksiKoinModel = Prisma.transaksi_koinGetPayload<{
  include: {
    pengguna: { 
      select: { 
        nama_pengguna: true, 
        email: true 
      } 
    };
    koin: true;
  };
}>;

export type PeminjamanBukuModel = Prisma.peminjaman_bukuGetPayload<{
  include: {
    pengguna: {
      select: { 
        nama_pengguna: true, 
        email: true 
      } 
    };
    detail_buku: { 
      include: { 
        buku: { 
          select: { 
            judul: true 
          } 
        } 
      } 
    };
  };
}>;