import { Prisma } from "@/app/generated/prisma/client";

export type KoinModel = Prisma.koinGetPayload<object>

export type KategoriModel = Prisma.kategoriGetPayload<object>;

export type BukuModel = Prisma.bukuGetPayload<{
  include: {
    buku_kategori: {
      include: {
        kategori: {
          select: {
            id_kategori : true,
            nama_kategori : true
          }
        }; // includes id_kategori, nama_kategori
      };
    };
    detail_buku: {
      select : {
        id_detail_buku : true,
        status : true
      },
    }; // includes all detail_buku fields
  };
}>;

export type BukuDetailModel = Prisma.bukuGetPayload<{
  include: {
    buku_kategori: {
      include: {
        kategori: true // includes id_kategori, nama_kategori
      };
    };
  };
}>;

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