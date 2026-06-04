-- This is an empty migration.

-- 1. Drop all foreign keys
ALTER TABLE `buku_kategori`  DROP FOREIGN KEY `buku_kategori_id_buku_fkey`;
ALTER TABLE `buku_kategori`  DROP FOREIGN KEY `buku_kategori_id_kategori_fkey`;
ALTER TABLE `detail_buku`  DROP FOREIGN KEY `detail_buku_id_buku_fkey`;
ALTER TABLE `peminjaman_buku`  DROP FOREIGN KEY `peminjaman_buku_id_detail_buku_fkey`;
ALTER TABLE `peminjaman_buku`  DROP FOREIGN KEY `peminjaman_buku_id_pengguna_fkey`;
ALTER TABLE `transaksi_koin`  DROP FOREIGN KEY `transaksi_koin_id_koin_fkey`;
ALTER TABLE `transaksi_koin`  DROP FOREIGN KEY `transaksi_koin_id_pengguna_fkey`;

-- 2. Convert all tables
ALTER TABLE `_prisma_migrations` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
ALTER TABLE `pengguna`       CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
ALTER TABLE `staff`          CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
ALTER TABLE `buku`           CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
ALTER TABLE `kategori`       CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
ALTER TABLE `buku_kategori`  CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
ALTER TABLE `detail_buku`    CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
ALTER TABLE `koin`           CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
ALTER TABLE `peminjaman_buku` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
ALTER TABLE `transaksi_koin` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

-- 3. Re-add all foreign keys
ALTER TABLE `buku_kategori`  ADD CONSTRAINT `buku_kategori_id_buku_fkey`
  FOREIGN KEY (`id_buku`) REFERENCES `buku`(`id_buku`);
ALTER TABLE `buku_kategori`  ADD CONSTRAINT `buku_kategori_id_kategori_fkey`
  FOREIGN KEY (`id_kategori`) REFERENCES `kategori`(`id_kategori`);
ALTER TABLE `detail_buku`    ADD CONSTRAINT `detail_buku_id_buku_fkey`
  FOREIGN KEY (`id_buku`) REFERENCES `buku`(`id_buku`);
ALTER TABLE `peminjaman_buku` ADD CONSTRAINT `peminjaman_buku_id_detail_buku_fkey`
  FOREIGN KEY (`id_detail_buku`) REFERENCES `detail_buku`(`id_detail_buku`);
ALTER TABLE `peminjaman_buku` ADD CONSTRAINT `peminjaman_buku_id_pengguna_fkey`
  FOREIGN KEY (`id_pengguna`) REFERENCES `pengguna`(`id_pengguna`);
ALTER TABLE `transaksi_koin` ADD CONSTRAINT `transaksi_koin_id_koin_fkey`
  FOREIGN KEY (`id_koin`) REFERENCES `koin`(`id_koin`);
ALTER TABLE `transaksi_koin` ADD CONSTRAINT `transaksi_koin_id_pengguna_fkey`
  FOREIGN KEY (`id_pengguna`) REFERENCES `pengguna`(`id_pengguna`);
-- ALTER TABLE `staff`          ADD CONSTRAINT `staff_id_pengguna_fkey`
--   FOREIGN KEY (`id_pengguna`) REFERENCES `pengguna`(`id_pengguna`);