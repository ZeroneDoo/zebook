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

interface BukuSpInput {
  judul: string;
  deskripsi: string | null;
  stok: number;
  koin: number;
  stamp: number;
  penerbit: string;
  penulis: string;
  thn_terbit: number;
  kategori_ids: string; // ID kategori dipisah koma, misal: 'KAT0001,KAT0002'
  img_url: string | null;
}

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
    { id_kategori: 'KAT0001', nama_kategori: 'Novel & Fiksi' },
    { id_kategori: 'KAT0002', nama_kategori: 'Fiksi Sejarah' },
    { id_kategori: 'KAT0003', nama_kategori: 'Romantis' },
    { id_kategori: 'KAT0004', nama_kategori: 'Religi & Spiritual' },
    { id_kategori: 'KAT0005', nama_kategori: 'Pengembangan Diri' },
    { id_kategori: 'KAT0006', nama_kategori: 'Non-Fiksi & Sejarah' },
    { id_kategori: 'KAT0007', nama_kategori: 'Filsafat' },
    { id_kategori: 'KAT0008', nama_kategori: 'Sains Fiksi & Fantasi' },
    { id_kategori: 'KAT0009', nama_kategori: 'Sastra Klasik' },
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
  console.log('📚 Seeding buku & Detail Buku...')
  const hopesAndBooks: BukuSpInput[] = [
    { 
      judul: 'Laskar Pelangi Edisi ke-50', 
      deskripsi: 'Novel tentang persahabatan anak Belitung.', 
      stok: 3, koin: 30, stamp: 1, penerbit: 'Bentang Pustaka', penulis: 'Andrea Hirata', thn_terbit: 2020, 
      kategori_ids: 'KAT0001', 
      img_url: 'https://image.gramedia.net/rs:fit:0:0/plain/https://cdn.gramedia.com/uploads/items/img212.jpg' 
    },
    { 
      judul: 'Bumi Manusia', 
      deskripsi: 'Kisah perjuangan Minke di masa kolonial.', 
      stok: 3, koin: 50, stamp: 2, penerbit: 'Lentera Dipantara', penulis: 'Pramoedya A. Toer', thn_terbit: 1980, 
      kategori_ids: 'KAT0001,KAT0002', 
      img_url: 'https://covers.openlibrary.org/b/id/15122195-L.jpg' 
    },
    { 
      judul: 'Negeri 5 Menara', 
      deskripsi: 'Kisah santri mengejar mimpi di pondok.', 
      stok: 3, koin: 25, stamp: 1, penerbit: 'Gramedia', penulis: 'A. Fuadi', thn_terbit: 2017, 
      kategori_ids: 'KAT0001,KAT0004', 
      img_url: 'https://image.gramedia.net/rs:fit:0:0/plain/https://cdn.gramedia.com/uploads/items/9789792248616_negeri-5-menara-_cu-cover-baru_.jpg' 
    },
    { 
      judul: 'Perahu Kertas', 
      deskripsi: 'Kisah cinta antara Kugy dan Keenan.', 
      stok: 3, koin: 35, stamp: 1, penerbit: 'Bentang Pustaka', penulis: 'Dee Lestari', thn_terbit: 2024, 
      kategori_ids: 'KAT0001,KAT0003', 
      img_url: 'https://image.gramedia.net/rs:fit:0:0/plain/https://cdn.gramedia.com/uploads/products/hzc2r732ce.png' 
    },
    { 
      judul: 'Cantik itu Luka', 
      deskripsi: 'Novel realisme magis sejarah Indonesia.', 
      stok: 3, koin: 45, stamp: 2, penerbit: 'Gramedia Pustaka Utama', penulis: 'Eka Kurniawan', thn_terbit: 2018, 
      kategori_ids: 'KAT0001,KAT0002', 
      img_url: 'https://image.gramedia.net/rs:fit:0:0/plain/https://cdn.gramedia.com/uploads/items/9786020366517_Cantik-Itu-Luka-Hard-Cover---Limited-Edition.jpg' 
    },
    { 
      judul: 'Laut Bercerita', 
      deskripsi: 'Kisah aktivis yang hilang di masa Orba.', 
      stok: 3, koin: 40, stamp: 2, penerbit: 'Gramedia', penulis: 'Leila S. Chudori', thn_terbit: 2017, 
      kategori_ids: 'KAT0001,KAT0002', 
      img_url: 'https://image.gramedia.net/rs:fit:0:0/plain/https://cdn.gramedia.com/uploads/items/9786024246945_Laut-Bercerita.png' 
    },
    { 
      judul: 'Ronggeng Dukuh Paruk', 
      deskripsi: 'Tragedi kemanusiaan di sebuah desa.', 
      stok: 3, koin: 30, stamp: 1, penerbit: 'Gramedia Pustaka Utama', penulis: 'Ahmad Tohari', thn_terbit: 2025, 
      kategori_ids: 'KAT0001,KAT0002', 
      img_url: 'https://image.gramedia.net/rs:fit:0:0/plain/https://cdn.gramedia.com/uploads/product-metas/uh0d0g8ukg.jpg' 
    },
    { 
      judul: 'Tenggelamnya Kapal Van Der Wijck', 
      deskripsi: 'Kisah cinta Zainuddin dan Hayati.', 
      stok: 3, koin: 20, stamp: 1, penerbit: 'Gema Insani', penulis: 'Abdul Malik Karim Amrullah', thn_terbit: 2017, 
      kategori_ids: 'KAT0009,KAT0003', 
      img_url: 'https://image.gramedia.net/rs:fit:0:0/plain/https://cdn.gramedia.com/uploads/items/img067.jpg' 
    },
    { 
      judul: 'Ayat-Ayat Cinta 2 Edisi Film', 
      deskripsi: 'Novel religi populer berlatar Mesir.', 
      stok: 3, koin: 25, stamp: 1, penerbit: 'Republika', penulis: 'Habiburrahman El Shirazy', thn_terbit: 2015, 
      kategori_ids: 'KAT0004,KAT0003', 
      img_url: 'https://image.gramedia.net/rs:fit:0:0/plain/https://cdn.gramedia.com/uploads/items/ayat-ayat-cinta-2-edit.jpg' 
    },
    { 
      judul: 'Sang Pemimpi', 
      deskripsi: 'Sekuel dari Laskar Pelangi.', 
      stok: 3, koin: 30, stamp: 1, penerbit: 'Bentang Pustaka', penulis: 'Andrea Hirata', thn_terbit: 2020, 
      kategori_ids: 'KAT0001', 
      img_url: 'https://image.gramedia.net/rs:fit:0:0/plain/https://cdn.gramedia.com/uploads/items/Sang_Pemimpi.jpg' 
    },
    { 
      judul: 'Atomic Habits: Perubahan Kecil yang Memberikan Hasil Luar Biasa', 
      deskripsi: 'Cara mudah membangun kebiasaan baik.', 
      stok: 3, koin: 60, stamp: 3, penerbit: 'Gramedia Pustaka Utama', penulis: 'James Clear', thn_terbit: 2019, 
      kategori_ids: 'KAT0005', 
      img_url: 'https://image.gramedia.net/rs:fit:0:0/plain/https://cdn.gramedia.com/uploads/items/9786020633176_.Atomic_Habit.jpg' 
    },
    { 
      judul: 'The Alchemist', 
      deskripsi: 'Perjalanan mengejar legenda pribadi.', 
      stok: 3, koin: 35, stamp: 1, penerbit: 'Waterlily', penulis: 'Paulo Coelho', thn_terbit: 2025, 
      kategori_ids: 'KAT0001,KAT0007', 
      img_url: 'https://image.gramedia.net/rs:fit:0:0/plain/https://cdn.gramedia.com/uploads/products/smm437-64c.jpg' 
    },
    { 
      judul: 'SAPIENS GRAFIS: Kelahiran Umat Manusia', 
      deskripsi: 'Sejarah singkat umat manusia.', 
      stok: 3, koin: 70, stamp: 3, penerbit: 'Kepustakaan Populer Gramedia', penulis: 'Yuval Noah Harari', thn_terbit: 2021, 
      kategori_ids: 'KAT0006', 
      img_url: 'https://image.gramedia.net/rs:fit:0:0/plain/https://cdn.gramedia.com/uploads/items/9786024815653_Sapiens_Grafis_Spread_1_Au4pg9r.jpeg' 
    },
    { 
      judul: '1984 - Republish', 
      deskripsi: 'Novel distopia legendaris tentang kontrol totalitarian negara.', 
      stok: 3, koin: 40, stamp: 2, penerbit: 'Bentang Pustaka', penulis: 'George Orwell', thn_terbit: 2021, 
      kategori_ids: 'KAT0009,KAT0008', 
      img_url: 'https://covers.openlibrary.org/b/isbn/9780451524935-L.jpg' 
    },
    { 
      judul: 'The Great Gatsby', 
      deskripsi: 'Kritik tajam atas kemewahan dan kejayaan semu American Dream di era jazz.', 
      stok: 3, koin: 35, stamp: 1, penerbit: 'Norris Book', penulis: 'F. Scott Fitzgerald', thn_terbit: 2024, 
      kategori_ids: 'KAT0009', 
      img_url: 'https://image.gramedia.net/rs:fit:0:0/plain/https://cdn.gramedia.com/uploads/products/512t1zz2t2.jpeg' 
    },
    { 
      judul: 'To Kill a Mockingbird', 
      deskripsi: 'Kisah klasik tentang keadilan hukum dan isu rasial di Amerika Serikat.', 
      stok: 3, koin: 40, stamp: 2, penerbit: 'Waterlily', penulis: 'Harper Lee', thn_terbit: 2026, 
      kategori_ids: 'KAT0009', 
      img_url: 'https://image.gramedia.net/rs:fit:0:0/plain/https://cdn.gramedia.com/uploads/product-metas/oxo0r3gtli.jpg' 
    },
    { 
      judul: 'The Hobbit', 
      deskripsi: 'Petualangan Bilbo Baggins dalam merebut kembali kerajaan gunung yang hilang.', 
      stok: 3, koin: 30, stamp: 1, penerbit: 'Houghton Mifflin Company', penulis: 'J.R.R. Tolkien', thn_terbit: 1984, 
      kategori_ids: 'KAT0001,KAT0008', 
      img_url: 'https://covers.openlibrary.org/b/id/15223072-L.jpg' 
    },
    { 
      judul: 'Harry Potter and the Sorcerer\'s Stone', 
      deskripsi: 'Awal kisah petualangan anak yatim piatu di sekolah sihir Hogwarts.', 
      stok: 3, koin: 30, stamp: 1, penerbit: 'Arthur A. Levine Books', penulis: 'J.K. Rowling', thn_terbit: 1998, 
      kategori_ids: 'KAT0001,KAT0008', 
      img_url: 'https://covers.openlibrary.org/b/id/15154728-L.jpg' 
    },
    { 
      judul: 'The Catcher in the Rye', 
      deskripsi: 'Kisah ikonik Holden Caulfield menghadapi kejenuhan dan kepalsuan dunia dewasa.', 
      stok: 3, koin: 30, stamp: 1, penerbit: 'Yi lin chu ban she', penulis: 'J.D. Salinger dan Shao jia yun', thn_terbit: 2010, 
      kategori_ids: 'KAT0009', 
      img_url: 'https://covers.openlibrary.org/b/id/12902994-L.jpg' 
    },
    { 
      judul: 'Pride and Prejudice', 
      deskripsi: 'Kisah romansa klasik penuh gengsi dan prasangka antara Elizabeth Bennet dan Mr. Darcy.', 
      stok: 3, koin: 25, stamp: 1, penerbit: 'Mizan', penulis: 'Jane Austen', thn_terbit: 2022, 
      kategori_ids: 'KAT0001,KAT0003', 
      img_url: 'https://image.gramedia.net/rs:fit:0:0/plain/https://cdn.gramedia.com/uploads/items/_4121.jpg' 
    },
    { 
      judul: 'Animal Farm', 
      deskripsi: 'Satir politik berbentuk fabel tentang korupsi kekuasaan dan revolusi yang dikhianati.', 
      stok: 3, koin: 35, stamp: 1, penerbit: 'Norris Book', penulis: 'George Orwell', thn_terbit: 2024, 
      kategori_ids: 'KAT0009', 
      img_url: 'https://image.gramedia.net/rs:fit:0:0/plain/https://cdn.gramedia.com/uploads/products/n-a-a9nv8-.jpg' 
    },
    { 
      judul: 'Lord of the Flies', 
      deskripsi: 'Sekelompok anak sekolah yang terdampar di pulau terpencil dan perlahan menjadi liar.', 
      stok: 3, koin: 40, stamp: 2, penerbit: 'Bentang Pustaka', penulis: 'William Golding', thn_terbit: 2022, 
      kategori_ids: 'KAT0001,KAT0002', 
      img_url: 'https://image.gramedia.net/rs:fit:0:0/plain/https://cdn.gramedia.com/uploads/items/img20220219_11402068.jpg' 
    },
    { 
      judul: 'The Little Prince', 
      deskripsi: 'Kisah filosofis tentang seorang pilot terdampar dan pangeran kecil dari asteroid.', 
      stok: 3, koin: 45, stamp: 2, penerbit: 'Norris Book', penulis: 'Antoine de Saint-Exupéry', thn_terbit: 2024, 
      kategori_ids: 'KAT0005,KAT0007', 
      img_url: 'https://image.gramedia.net/rs:fit:0:0/plain/https://cdn.gramedia.com/uploads/products/-p6tch4ie-.jpg' 
    },
    { 
      judul: 'Frankenstein', 
      deskripsi: 'Kisah tragis tentang ilmuwan Victor Frankenstein yang menciptakan monster hidup.', 
      stok: 3, koin: 50, stamp: 2, penerbit: 'Anak Hebat Indonesia', penulis: 'Mary Shelley', thn_terbit: 2024, 
      kategori_ids: 'KAT0007', 
      img_url: 'https://image.gramedia.net/rs:fit:0:0/plain/https://cdn.gramedia.com/uploads/picture_meta/2024/2/19/57jgmeb2nfbopzuagetb2z.jpg' 
    },
    { 
      judul: 'Brave New World', 
      deskripsi: 'Gambaran dunia masa depan distopia yang dikontrol oleh teknologi dan rekayasa genetika.', 
      stok: 3, koin: 45, stamp: 2, penerbit: 'Vintage', penulis: 'Aldous Huxley', thn_terbit: 2025, 
      kategori_ids: 'KAT0001,KAT0008', 
      img_url: 'https://image.gramedia.net/rs:fit:0:0/plain/https://cdn.gramedia.com/uploads/product-metas/bvw1-4n3o0.jpg' 
    }
  ];

  console.log('Memulai eksekusi 25 data buku via Stored Procedure...');

  // 3. Iterasi dan panggil sp_tambah_buku untuk setiap data
  for (const book of hopesAndBooks) {
    await prisma.$executeRaw`
      CALL sp_tambah_buku(
        ${book.judul}, 
        ${book.deskripsi}, 
        ${book.stok}, 
        ${book.koin}, 
        ${book.stamp}, 
        ${book.penerbit}, 
        ${book.penulis}, 
        ${book.thn_terbit}, 
        ${book.kategori_ids}, 
        ${book.img_url}
      )
    `;
  }

  console.log('✅ Seeding 25 buku sukses! Data buku, kategori_buku, dan detail_buku berhasil digenerate.');

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
  // console.log('📖 Seeding detail buku...')
  // const detailBukuData: Prisma.detail_bukuCreateInput[] = [
  //   // BK0001 Laskar Pelangi (5 eksemplar)
  //   { id_detail_buku: 'DB01', buku: { connect: { id_buku: 'BK0001' } }, status: 'TERSEDIA' },
  //   { id_detail_buku: 'DB02', buku: { connect: { id_buku: 'BK0001' } }, status: 'TERSEDIA' },
  //   { id_detail_buku: 'DB03', buku: { connect: { id_buku: 'BK0001' } }, status: 'TERSEDIA' },
  //   { id_detail_buku: 'DB04', buku: { connect: { id_buku: 'BK0001' } }, status: 'TERSEDIA' },
  //   { id_detail_buku: 'DB05', buku: { connect: { id_buku: 'BK0001' } }, status: 'TERSEDIA' },
  //   // BK0002 Bumi Manusia (3 eksemplar)
  //   { id_detail_buku: 'DB06', buku: { connect: { id_buku: 'BK0002' } }, status: 'TERSEDIA' },
  //   { id_detail_buku: 'DB07', buku: { connect: { id_buku: 'BK0002' } }, status: 'TERSEDIA' },
  //   { id_detail_buku: 'DB08', buku: { connect: { id_buku: 'BK0002' } }, status: 'TERSEDIA' },
  //   // BK0003 Clean Code (4 eksemplar)
  //   { id_detail_buku: 'DB09', buku: { connect: { id_buku: 'BK0003' } }, status: 'TERSEDIA' },
  //   { id_detail_buku: 'DB10', buku: { connect: { id_buku: 'BK0003' } }, status: 'TERSEDIA' },
  //   { id_detail_buku: 'DB11', buku: { connect: { id_buku: 'BK0003' } }, status: 'TERSEDIA' },
  //   { id_detail_buku: 'DB12', buku: { connect: { id_buku: 'BK0003' } }, status: 'TERSEDIA' },
  //   // BK0004 Sapiens (2 eksemplar)
  //   { id_detail_buku: 'DB13', buku: { connect: { id_buku: 'BK0004' } }, status: 'TERSEDIA' },
  //   { id_detail_buku: 'DB14', buku: { connect: { id_buku: 'BK0004' } }, status: 'TERSEDIA' },
  //   // BK0005 Atomic Habits (6 eksemplar)
  //   { id_detail_buku: 'DB15', buku: { connect: { id_buku: 'BK0005' } }, status: 'TERSEDIA' },
  //   { id_detail_buku: 'DB16', buku: { connect: { id_buku: 'BK0005' } }, status: 'TERSEDIA' },
  //   { id_detail_buku: 'DB17', buku: { connect: { id_buku: 'BK0005' } }, status: 'TERSEDIA' },
  //   { id_detail_buku: 'DB18', buku: { connect: { id_buku: 'BK0005' } }, status: 'TERSEDIA' },
  //   { id_detail_buku: 'DB19', buku: { connect: { id_buku: 'BK0005' } }, status: 'TERSEDIA' },
  //   { id_detail_buku: 'DB20', buku: { connect: { id_buku: 'BK0005' } }, status: 'TERSEDIA' },
  // ]

  // for (const data of detailBukuData) {
  //   await prisma.detail_buku.upsert({
  //     where: { id_detail_buku: data.id_detail_buku },
  //     update: {},
  //     create: data,
  //   })
  // }

  // ===========================
  // BUKU KATEGORI
  // ===========================
  // console.log('🔗 Seeding buku_kategori...')
//   const bukuKategoriData = [
//   // Laskar Pelangi
//   { id_buku: 'BK0001', id_kategori: 'KAT0001' }, 

//   // Bumi Manusia
//   { id_buku: 'BK0002', id_kategori: 'KAT0001' }, 
//   { id_buku: 'BK0002', id_kategori: 'KAT0002' },

//   // Negeri 5 Menara
//   { id_buku: 'BK0003', id_kategori: 'KAT0001' }, 
//   { id_buku: 'BK0003', id_kategori: 'KAT0004' },

//   // Perahu Kertas
//   { id_buku: 'BK0004', id_kategori: 'KAT0001' }, 
//   { id_buku: 'BK0004', id_kategori: 'KAT0003' },

//   // Cantik itu Luka
//   { id_buku: 'BK0005', id_kategori: 'KAT0001' }, 
//   { id_buku: 'BK0005', id_kategori: 'KAT0002' },

//   // Laut Bercerita
//   { id_buku: 'BK0006', id_kategori: 'KAT0001' }, 
//   { id_buku: 'BK0006', id_kategori: 'KAT0002' },

//   // Ronggeng Dukuh Paruk
//   { id_buku: 'BK0007', id_kategori: 'KAT0001' }, 
//   { id_buku: 'BK0007', id_kategori: 'KAT0002' },

//   // Tenggelamnya K.V.W
//   { id_buku: 'BK0008', id_kategori: 'KAT0009' }, 
//   { id_buku: 'BK0008', id_kategori: 'KAT0003' },

//   // Ayat-Ayat Cinta
//   { id_buku: 'BK0009', id_kategori: 'KAT0004' }, 
//   { id_buku: 'BK0009', id_kategori: 'KAT0003' },

//   // Sang Pemimpi
//   { id_buku: 'BK0010', id_kategori: 'KAT0001' },

//   // Atomic Habits
//   { id_buku: 'BK0011', id_kategori: 'KAT0005' },

//   // The Alchemist
//   { id_buku: 'BK0012', id_kategori: 'KAT0001' }, 
//   { id_buku: 'BK0012', id_kategori: 'KAT0007' },

//   // Sapiens
//   { id_buku: 'BK0013', id_kategori: 'KAT0006' },

//   // 1984
//   { id_buku: 'BK0014', id_kategori: 'KAT0009' }, 
//   { id_buku: 'BK0014', id_kategori: 'KAT0008' },

//   // Filosofi Teras
//   { id_buku: 'BK0015', id_kategori: 'KAT0005' }, 
//   { id_buku: 'BK0015', id_kategori: 'KAT0007' },

//   // Hujan
//   { id_buku: 'BK0016', id_kategori: 'KAT0001' }, 
//   { id_buku: 'BK0016', id_kategori: 'KAT0008' },

//   // Bumi
//   { id_buku: 'BK0017', id_kategori: 'KAT0001' }, 
//   { id_buku: 'BK0017', id_kategori: 'KAT0008' },

//   // Bulan
//   { id_buku: 'BK0018', id_kategori: 'KAT0001' }, 
//   { id_buku: 'BK0018', id_kategori: 'KAT0008' },

//   // Matahari
//   { id_buku: 'BK0019', id_kategori: 'KAT0001' }, 
//   { id_buku: 'BK0019', id_kategori: 'KAT0008' },

//   // Dilan 1990
//   { id_buku: 'BK0020', id_kategori: 'KAT0001' }, 
//   { id_buku: 'BK0020', id_kategori: 'KAT0003' },

//   // Pulang
//   { id_buku: 'BK0021', id_kategori: 'KAT0001' }, 
//   { id_buku: 'BK0021', id_kategori: 'KAT0002' },

//   // The Great Gatsby
//   { id_buku: 'BK0022', id_kategori: 'KAT0009' },

//   // To Kill a Mockingbird
//   { id_buku: 'BK0023', id_kategori: 'KAT0009' },

//   // Madilog
//   { id_buku: 'BK0024', id_kategori: 'KAT0007' },

//   // Supernova
//   { id_buku: 'BK0025', id_kategori: 'KAT0001' }, 
//   { id_buku: 'BK0025', id_kategori: 'KAT0008' }
// ];

//   await prisma.buku_kategori.createMany({
//     data: bukuKategoriData,
//     skipDuplicates: true, // Opsional: Menghindari error jika data sudah ada
//   });

  // console.log('✅ Seeding selesai!')
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