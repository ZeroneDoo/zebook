-- CreateTable
CREATE TABLE `pengguna` (
    `id_pengguna` CHAR(7) NOT NULL,
    `nama_pengguna` VARCHAR(32) NULL,
    `email` VARCHAR(32) NOT NULL,
    `koin` INTEGER NOT NULL DEFAULT 0,
    `stamp` INTEGER NOT NULL DEFAULT 0,
    `password` VARCHAR(255) NOT NULL,

    UNIQUE INDEX `pengguna_email_key`(`email`),
    PRIMARY KEY (`id_pengguna`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `staff` (
    `id_staff` CHAR(7) NOT NULL,
    `username` VARCHAR(32) NOT NULL,
    `nama_staff` VARCHAR(32) NULL,
    `password` VARCHAR(255) NOT NULL,

    UNIQUE INDEX `staff_username_key`(`username`),
    PRIMARY KEY (`id_staff`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `kategori` (
    `id_kategori` CHAR(7) NOT NULL,
    `nama_kategori` VARCHAR(50) NULL,

    PRIMARY KEY (`id_kategori`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `buku` (
    `id_buku` CHAR(6) NOT NULL,
    `judul` VARCHAR(255) NOT NULL,
    `deskripsi` TEXT NULL,
    `stok` INTEGER NOT NULL DEFAULT 0,
    `koin` INTEGER NOT NULL DEFAULT 0,
    `stamp` INTEGER NOT NULL DEFAULT 0,
    `penerbit` VARCHAR(32) NOT NULL,
    `penulis` VARCHAR(32) NOT NULL,
    `thn_terbit` YEAR NOT NULL,
    `img_url` TEXT NOT NULL,

    PRIMARY KEY (`id_buku`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `koin` (
    `id_koin` CHAR(4) NOT NULL,
    `jum_koin` INTEGER NOT NULL DEFAULT 0,
    `harga` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,

    PRIMARY KEY (`id_koin`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `detail_buku` (
    `id_detail_buku` CHAR(4) NOT NULL,
    `id_buku` CHAR(6) NOT NULL,
    `status` ENUM('TERSEDIA', 'DIPESAN', 'DIPINJAM', 'HILANG', 'RUSAK') NOT NULL DEFAULT 'TERSEDIA',

    PRIMARY KEY (`id_detail_buku`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `buku_kategori` (
    `id_buku` CHAR(6) NOT NULL,
    `id_kategori` CHAR(7) NOT NULL,

    PRIMARY KEY (`id_buku`, `id_kategori`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `transaksi_koin` (
    `id_transaksi_koin` CHAR(4) NOT NULL,
    `id_pengguna` CHAR(7) NOT NULL,
    `id_koin` CHAR(4) NOT NULL,
    `jum_koin` INTEGER NOT NULL DEFAULT 0,
    `harga` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `metode_pembayaran` ENUM('E-MONEY', 'VA', 'OUTLET', 'QRIS') NOT NULL,

    PRIMARY KEY (`id_transaksi_koin`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `peminjaman_buku` (
    `id_peminjaman` CHAR(7) NOT NULL,
    `id_pengguna` CHAR(7) NOT NULL,
    `id_detail_buku` CHAR(7) NOT NULL,
    `tgl_pinjam` DATE NOT NULL,
    `tgl_kembali` DATE NOT NULL,
    `koin_reward` INTEGER NOT NULL DEFAULT 0,
    `denda_koin` INTEGER NOT NULL DEFAULT 0,
    `stamp_reward` INTEGER NOT NULL DEFAULT 0,
    `status` ENUM('DIPROSES', 'DITOLAK', 'DIPINJAM', 'DIKEMBALIKAN') NOT NULL DEFAULT 'DIPROSES',
    `metode` ENUM('KOIN', 'STAMP') NOT NULL DEFAULT 'KOIN',

    PRIMARY KEY (`id_peminjaman`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `detail_buku` ADD CONSTRAINT `detail_buku_id_buku_fkey` FOREIGN KEY (`id_buku`) REFERENCES `buku`(`id_buku`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `buku_kategori` ADD CONSTRAINT `buku_kategori_id_buku_fkey` FOREIGN KEY (`id_buku`) REFERENCES `buku`(`id_buku`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `buku_kategori` ADD CONSTRAINT `buku_kategori_id_kategori_fkey` FOREIGN KEY (`id_kategori`) REFERENCES `kategori`(`id_kategori`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transaksi_koin` ADD CONSTRAINT `transaksi_koin_id_pengguna_fkey` FOREIGN KEY (`id_pengguna`) REFERENCES `pengguna`(`id_pengguna`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transaksi_koin` ADD CONSTRAINT `transaksi_koin_id_koin_fkey` FOREIGN KEY (`id_koin`) REFERENCES `koin`(`id_koin`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `peminjaman_buku` ADD CONSTRAINT `peminjaman_buku_id_pengguna_fkey` FOREIGN KEY (`id_pengguna`) REFERENCES `pengguna`(`id_pengguna`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `peminjaman_buku` ADD CONSTRAINT `peminjaman_buku_id_detail_buku_fkey` FOREIGN KEY (`id_detail_buku`) REFERENCES `detail_buku`(`id_detail_buku`) ON DELETE RESTRICT ON UPDATE CASCADE;
