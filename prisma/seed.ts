import { PrismaClient, Prisma } from "../app/generated/prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import bcrypt from "bcryptjs";
import "dotenv/config";

const adapter = new PrismaMariaDb({
    host: "localhost",
    port: 3306,
    user: "root",
    database: 'e_perpus',
    password: '',
    connectionLimit: 5,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  console.log('🌱 Mulai seeding...')

  // ===========================
  // PENGGUNA
  // ===========================
  console.log('👤 Seeding pengguna...')
  const penggunaData: Prisma.penggunaCreateInput[] = [
    { id_pengguna: 'PGG0001', nama_pengguna: 'Andi Pratama',  email: 'andi@email.com',  koin: 150, stamp: 3, password: await bcrypt.hash('123123', 10) },
    { id_pengguna: 'PGG0002', nama_pengguna: 'Siti Rahma',    email: 'siti@email.com',  koin: 80,  stamp: 1, password: await bcrypt.hash('123123', 10) },
    { id_pengguna: 'PGG0003', nama_pengguna: 'Budi Santoso',  email: 'budi@email.com',  koin: 200, stamp: 5, password: await bcrypt.hash('123123', 10) },
    { id_pengguna: 'PGG0004', nama_pengguna: 'Dewi Lestari',  email: 'dewi@email.com',  koin: 50,  stamp: 0, password: await bcrypt.hash('123123', 10) },
    { id_pengguna: 'PGG0005', nama_pengguna: 'Rizky Maulana', email: 'rizky@email.com', koin: 320, stamp: 7, password: await bcrypt.hash('123123', 10) },
  ]

  for (const data of penggunaData) {
    await prisma.pengguna.upsert({
      where: { id_pengguna: data.id_pengguna },
      update: {},
      create: data,
    })
  }

  // ===========================
  // STAFF (Added to match SQL)
  // ===========================
  console.log('💼 Seeding staff...')
  const staffData: Prisma.staffCreateInput[] = [
    { id_staff: 'STF0001', username: 'admin01', nama_staff: 'Budi Setiawan', password: await bcrypt.hash('admin123', 10) },
    { id_staff: 'STF0002', username: 'admin02', nama_staff: 'Sari Dewi',     password: await bcrypt.hash('admin123', 10) },
    { id_staff: 'STF0003', username: 'admin03', nama_staff: 'Reza Pratama',   password: await bcrypt.hash('admin123', 10) },
    { id_staff: 'STF0004', username: 'admin04', nama_staff: 'Lina Marlina',   password: await bcrypt.hash('admin123', 10) },
    { id_staff: 'STF0005', username: 'admin05', nama_staff: 'Fajar Nugroho',  password: await bcrypt.hash('admin123', 10) },
  ]

  for (const data of staffData) {
    await prisma.staff.upsert({
      where: { id_staff: data.id_staff },
      update: {},
      create: data,
    })
  }

  // ===========================
  // KATEGORI
  // ===========================
  console.log('🏷️  Seeding kategori...')
  const kategoriData: Prisma.kategoriCreateInput[] = [
    { id_kategori: 'KAT0001', nama_kategori: 'Fiksi' },
    { id_kategori: 'KAT0002', nama_kategori: 'Non-Fiksi' },
    { id_kategori: 'KAT0003', nama_kategori: 'Sains & Teknologi' },
    { id_kategori: 'KAT0004', nama_kategori: 'Sejarah' },
    { id_kategori: 'KAT0005', nama_kategori: 'Self-Help' },
  ]

  for (const data of kategoriData) {
    await prisma.kategori.upsert({
      where: { id_kategori: data.id_kategori },
      update: {},
      create: data,
    })
  }

  // ===========================
  // BUKU
  // ===========================
  console.log('📚 Seeding buku...')
  const bukuData: Prisma.bukuCreateInput[] = [
    { id_buku: 'BK0001', judul: 'Laskar Pelangi',  deskripsi: 'Novel tentang persahabatan anak Belitung.', stok: 5, koin: 30, stamp: 1, penerbit: 'Bentang Pustaka', penulis: 'Andrea Hirata',       thn_terbit: 2005 },
    { id_buku: 'BK0002', judul: 'Bumi Manusia',    deskripsi: 'Kisah Minke di era kolonial Belanda.',       stok: 3, koin: 60, stamp: 1, penerbit: 'Hasta Mitra',     penulis: 'Pramoedya A.T.',     thn_terbit: 1980 },
    { id_buku: 'BK0003', judul: 'Clean Code',      deskripsi: 'Panduan menulis kode yang bersih dan mudah dipelihara.', stok: 4, koin: 80, stamp: 2, penerbit: 'Prentice Hall',  penulis: 'Robert C. Martin',   thn_terbit: 2008 },
    { id_buku: 'BK0004', judul: 'Sapiens',         deskripsi: 'Sejarah singkat umat manusia.',              stok: 2, koin: 70, stamp: 2, penerbit: 'Harvill Secker',  penulis: 'Yuval Noah Harari',  thn_terbit: 2011 },
    { id_buku: 'BK0005', judul: 'Atomic Habits',   deskripsi: 'Cara membangun kebiasaan baik dan menghilangkan kebiasaan buruk.', stok: 6, koin: 55, stamp: 1, penerbit: 'Avery', penulis: 'James Clear', thn_terbit: 2018 },
  ]

  for (const data of bukuData) {
    await prisma.buku.upsert({
      where: { id_buku: data.id_buku },
      update: {},
      create: data,
    })
  }

  // ===========================
  // KOIN
  // ===========================
  console.log('🪙  Seeding koin...')
  const koinData: Prisma.koinCreateInput[] = [
    { id_koin: 'KN01', jum_koin: 20,  harga: 20000 },
    { id_koin: 'KN02', jum_koin: 30,  harga: 30000 },
    { id_koin: 'KN03', jum_koin: 50,  harga: 50000 },
    { id_koin: 'KN04', jum_koin: 80,  harga: 80000 },
    { id_koin: 'KN05', jum_koin: 100, harga: 100000 },
  ]

  for (const data of koinData) {
    await prisma.koin.upsert({
      where: { id_koin: data.id_koin },
      update: {},
      create: data,
    })
  }

  // ===========================
  // DETAIL BUKU
  // ===========================
  console.log('📖 Seeding detail buku...')
  const detailBukuData: Prisma.detail_bukuCreateInput[] = [
    // BK0001 Laskar Pelangi (5 eksemplar)
    { id_detail_buku: 'DB01', buku: { connect: { id_buku: 'BK0001' } }, status: 'TERSEDIA' },
    { id_detail_buku: 'DB02', buku: { connect: { id_buku: 'BK0001' } }, status: 'TERSEDIA' },
    { id_detail_buku: 'DB03', buku: { connect: { id_buku: 'BK0001' } }, status: 'TERSEDIA' },
    { id_detail_buku: 'DB04', buku: { connect: { id_buku: 'BK0001' } }, status: 'TERSEDIA' },
    { id_detail_buku: 'DB05', buku: { connect: { id_buku: 'BK0001' } }, status: 'TERSEDIA' },
    // BK0002 Bumi Manusia (3 eksemplar)
    { id_detail_buku: 'DB06', buku: { connect: { id_buku: 'BK0002' } }, status: 'TERSEDIA' },
    { id_detail_buku: 'DB07', buku: { connect: { id_buku: 'BK0002' } }, status: 'TERSEDIA' },
    { id_detail_buku: 'DB08', buku: { connect: { id_buku: 'BK0002' } }, status: 'TERSEDIA' },
    // BK0003 Clean Code (4 eksemplar)
    { id_detail_buku: 'DB09', buku: { connect: { id_buku: 'BK0003' } }, status: 'TERSEDIA' },
    { id_detail_buku: 'DB10', buku: { connect: { id_buku: 'BK0003' } }, status: 'TERSEDIA' },
    { id_detail_buku: 'DB11', buku: { connect: { id_buku: 'BK0003' } }, status: 'TERSEDIA' },
    { id_detail_buku: 'DB12', buku: { connect: { id_buku: 'BK0003' } }, status: 'TERSEDIA' },
    // BK0004 Sapiens (2 eksemplar)
    { id_detail_buku: 'DB13', buku: { connect: { id_buku: 'BK0004' } }, status: 'TERSEDIA' },
    { id_detail_buku: 'DB14', buku: { connect: { id_buku: 'BK0004' } }, status: 'TERSEDIA' },
    // BK0005 Atomic Habits (6 eksemplar)
    { id_detail_buku: 'DB15', buku: { connect: { id_buku: 'BK0005' } }, status: 'TERSEDIA' },
    { id_detail_buku: 'DB16', buku: { connect: { id_buku: 'BK0005' } }, status: 'TERSEDIA' },
    { id_detail_buku: 'DB17', buku: { connect: { id_buku: 'BK0005' } }, status: 'TERSEDIA' },
    { id_detail_buku: 'DB18', buku: { connect: { id_buku: 'BK0005' } }, status: 'TERSEDIA' },
    { id_detail_buku: 'DB19', buku: { connect: { id_buku: 'BK0005' } }, status: 'TERSEDIA' },
    { id_detail_buku: 'DB20', buku: { connect: { id_buku: 'BK0005' } }, status: 'TERSEDIA' },
  ]

  for (const data of detailBukuData) {
    await prisma.detail_buku.upsert({
      where: { id_detail_buku: data.id_detail_buku },
      update: {},
      create: data,
    })
  }

  // ===========================
  // BUKU KATEGORI
  // ===========================
  console.log('🔗 Seeding buku_kategori...')
  const bukuKategoriData = [
    { id_buku: 'BK0001', id_kategori: 'KAT0001' },
    { id_buku: 'BK0002', id_kategori: 'KAT0001' },
    { id_buku: 'BK0002', id_kategori: 'KAT0004' },
    { id_buku: 'BK0003', id_kategori: 'KAT0003' },
    { id_buku: 'BK0004', id_kategori: 'KAT0002' },
    { id_buku: 'BK0004', id_kategori: 'KAT0004' },
    { id_buku: 'BK0005', id_kategori: 'KAT0005' },
  ]

  for (const data of bukuKategoriData) {
    await prisma.buku_kategori.upsert({
      where: {
        id_buku_id_kategori: {   // composite key mapping from @@id([id_buku, id_kategori])
          id_buku: data.id_buku,
          id_kategori: data.id_kategori,
        }
      },
      update: {},
      create: data,
    })
  }

  console.log('✅ Seeding selesai!')
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });