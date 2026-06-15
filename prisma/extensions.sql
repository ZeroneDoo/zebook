DELIMITER $$

CREATE PROCEDURE sp_beli_koin(
   IN p_id_pengguna CHAR(7),
   IN p_metode_bayar ENUM("E-MONEY", "VA", "OUTLET", "QRIS"),
   IN p_id_koin CHAR(4)
)
BEGIN
   DECLARE v_id_transaksi CHAR(4);
   DECLARE v_last_num INT;
   DECLARE v_jumlah_koin INT;
   DECLARE v_harga_koin INT;

   -- Ambil jumlah koin dari paket menggunakan function
   SELECT jum_koin, harga
   INTO v_jumlah_koin, v_harga_koin
   FROM koin
   WHERE id_koin = p_id_koin;

   -- Generate id transaksi otomatis
   SELECT IFNULL(MAX(CAST(SUBSTRING(id_transaksi_koin, 3) AS UNSIGNED)), 0)
	INTO v_last_num
	FROM transaksi_koin;

	SET v_id_transaksi = CONCAT('TK', LPAD(v_last_num + 1, 2, '0'));

   -- Insert transaksi, trigger otomatis update saldo
   INSERT INTO transaksi_koin (id_transaksi_koin, id_pengguna, id_koin, jum_koin, harga, metode_pembayaran)
   VALUES (v_id_transaksi, p_id_pengguna, p_id_koin, v_jumlah_koin, v_harga_koin, p_metode_bayar);

END$$
 
CREATE TRIGGER trg_after_beli_koin
AFTER INSERT ON transaksi_koin
FOR EACH ROW
BEGIN
   UPDATE pengguna
   SET koin = koin + NEW.jum_koin
   WHERE id_pengguna = NEW.id_pengguna;
END$$
 
CREATE TRIGGER trg_after_insert_detail_buku
AFTER INSERT ON detail_buku
FOR EACH ROW
BEGIN
    UPDATE buku
    SET stok = stok + 1
    WHERE id_buku = NEW.id_buku;
END$$

CREATE TRIGGER trg_after_delete_detail_buku
AFTER DELETE ON detail_buku
FOR EACH ROW
BEGIN
    UPDATE buku
    SET stok = stok - 1
    WHERE id_buku = OLD.id_buku;
END$$

CREATE TRIGGER trg_after_update_detail_buku
AFTER UPDATE ON detail_buku
FOR EACH ROW
BEGIN
    -- If book becomes HILANG or RUSAK then decrease stok
    IF NEW.status IN ('HILANG', 'RUSAK') AND OLD.status NOT IN ('HILANG', 'RUSAK') THEN
        UPDATE buku SET stok = stok - 1 WHERE id_buku = NEW.id_buku;
    END IF;

    -- If book recovered back to TERSEDIA from HILANG or RUSAK then increase stok
    IF OLD.status IN ('HILANG', 'RUSAK') AND NEW.status NOT IN ('HILANG', 'RUSAK') THEN
        UPDATE buku SET stok = stok + 1 WHERE id_buku = NEW.id_buku;
    END IF;
END$$

CREATE PROCEDURE sp_tambah_buku(
   IN p_judul          VARCHAR(255),
   IN p_deskripsi      TEXT,
   IN p_stok           INT,
   IN p_koin           INT,
   IN p_stamp          INT,
   IN p_penerbit       VARCHAR(32),
   IN p_penulis        VARCHAR(32),
   IN p_thn_terbit     YEAR,
   IN p_kategori_ids   TEXT,
   IN p_img_url        TEXT
)
BEGIN
   DECLARE v_id_buku       CHAR(6);
   DECLARE v_id_detail     CHAR(4);
   DECLARE v_max_buku      INT;
   DECLARE v_max_detail    INT;
   DECLARE v_counter       INT DEFAULT 1;
   DECLARE v_kat           CHAR(7);
   DECLARE v_pos           INT;
   DECLARE v_remaining     TEXT;

   -- Generate id_buku
   SELECT IFNULL(MAX(CAST(SUBSTRING(id_buku, 3) AS UNSIGNED)), 0)
   INTO v_max_buku FROM buku;
   SET v_id_buku = CONCAT('BK', LPAD(v_max_buku + 1, 4, '0'));

   -- Insert buku
   INSERT INTO buku (id_buku, judul, deskripsi, stok, koin, stamp, penerbit, penulis, thn_terbit, img_url)
   VALUES (v_id_buku, p_judul, p_deskripsi, 0, p_koin, p_stamp, p_penerbit, p_penulis, p_thn_terbit, p_img_url);

   -- Insert Kategori Buku
   SET v_remaining = p_kategori_ids;

   WHILE LENGTH(v_remaining) > 0 DO
      SET v_pos = LOCATE(',', v_remaining);

      IF v_pos = 0 THEN
         -- Last or only item
         SET v_kat = TRIM(v_remaining);
         SET v_remaining = '';
      ELSE
         SET v_kat = TRIM(SUBSTRING(v_remaining, 1, v_pos - 1));
         SET v_remaining = TRIM(SUBSTRING(v_remaining, v_pos + 1));
      END IF;

      -- Only insert if kategori exists
      IF EXISTS (SELECT 1 FROM kategori WHERE id_kategori = v_kat) THEN
         INSERT INTO buku_kategori (id_buku, id_kategori)
         VALUES (v_id_buku, v_kat);
      END IF;
   END WHILE;

   -- Insert Detail Buku
   SELECT IFNULL(MAX(CAST(SUBSTRING(id_detail_buku, 3) AS UNSIGNED)), 0)
   INTO v_max_detail FROM detail_buku;

   WHILE v_counter <= p_stok DO
      SET v_id_detail = CONCAT('DB', LPAD(v_max_detail + v_counter, 2, '0'));

      INSERT INTO detail_buku (id_detail_buku, id_buku, status)
      VALUES (v_id_detail, v_id_buku, 'TERSEDIA');

      SET v_counter = v_counter + 1;
   END WHILE;

END$$

CREATE PROCEDURE sp_edit_buku(
   IN p_id_buku        CHAR(6),
   IN p_judul          VARCHAR(255),
   IN p_deskripsi      TEXT,
   IN p_koin           INT,
   IN p_stamp          INT,
   IN p_penerbit       VARCHAR(32),
   IN p_penulis        VARCHAR(32),
   IN p_thn_terbit     YEAR,
   IN p_kategori_ids   TEXT,
   IN p_img_url        TEXT
)
BEGIN
   -- Update buku
   UPDATE buku SET
      judul       = p_judul,
      deskripsi   = p_deskripsi,
      koin        = p_koin,
      stamp       = p_stamp,
      penerbit    = p_penerbit,
      penulis     = p_penulis,
      thn_terbit  = p_thn_terbit,
      img_url     = p_img_url
   WHERE id_buku = p_id_buku;

   -- Hapus kategori lama yang ga ada di kategori baru
   DELETE FROM buku_kategori
   WHERE id_buku = p_id_buku
   AND id_kategori NOT IN (
      SELECT id_kategori FROM kategori
      WHERE FIND_IN_SET(id_kategori, REPLACE(p_kategori_ids, ' ', ''))
   );

   -- Menambah data kategori baru 
   INSERT INTO buku_kategori (id_buku, id_kategori)
   SELECT p_id_buku, id_kategori
   FROM kategori
   WHERE FIND_IN_SET(id_kategori, REPLACE(p_kategori_ids, ' ', '')) > 0
   AND id_kategori NOT IN (
      SELECT id_kategori FROM buku_kategori WHERE id_buku = p_id_buku
   );

END$$

CREATE PROCEDURE sp_tambah_detail_buku(
   IN p_id_buku    CHAR(6),
   IN p_jumlah     INT
)
BEGIN
   DECLARE v_max_detail    INT;
   DECLARE v_id_detail     CHAR(4);
   DECLARE v_counter       INT DEFAULT 1;

   SELECT IFNULL(MAX(CAST(SUBSTRING(id_detail_buku, 3) AS UNSIGNED)), 0)
   INTO v_max_detail FROM detail_buku;

   WHILE v_counter <= p_jumlah DO
      SET v_id_detail = CONCAT('DB', LPAD(v_max_detail + v_counter, 2, '0'));

      INSERT INTO detail_buku (id_detail_buku, id_buku, status)
      VALUES (v_id_detail, p_id_buku, 'TERSEDIA');

      SET v_counter = v_counter + 1;
    END WHILE;
END$$

-- Set status manually (HILANG, RUSAK, etc)
CREATE PROCEDURE sp_update_status_detail(
   IN p_id_detail  CHAR(4),
   IN p_status     ENUM('TERSEDIA', 'DIPESAN', 'DIPINJAM', 'HILANG', 'RUSAK')
)
BEGIN
   DECLARE v_exists INT;

   SELECT COUNT(*) INTO v_exists
   FROM detail_buku WHERE id_detail_buku = p_id_detail;

   IF v_exists = 0 THEN
      SIGNAL SQLSTATE '45000'
       SET MESSAGE_TEXT = 'ID detail buku tidak ditemukan!';
   END IF;
    
   UPDATE detail_buku
   SET status = p_status
   WHERE id_detail_buku = p_id_detail;
END$$

CREATE PROCEDURE sp_buat_peminjaman(
   IN p_id_pengguna CHAR(7),
   IN p_id_buku CHAR(6),
   IN p_tgl_pinjam DATE,
   IN p_tgl_kembali DATE,
   IN p_metode ENUM('KOIN', 'STAMP')
)
BEGIN
   DECLARE v_koin_pengguna INT;
   DECLARE v_stamp_pengguna INT;
   DECLARE v_koin_buku INT;
   DECLARE v_stamp_buku INT;
   DECLARE v_stamp_reward INT DEFAULT 1;
   DECLARE v_id_detail_buku CHAR(4);
   DECLARE v_id_peminjaman CHAR(7);
   DECLARE v_last_num INT;

   -- Generate id_peminjaman otomatis (format: PJM0001, PJM0002, dst)
	SELECT IFNULL(MAX(CAST(SUBSTRING(id_peminjaman, 4) AS UNSIGNED)), 0)
	INTO v_last_num
	FROM peminjaman_buku;

	SET v_id_peminjaman = CONCAT('PJM', LPAD(v_last_num + 1, 4, '0'));

   -- Ambil detail_buku yang TERSEDIA paling atas untuk buku ini
   SELECT id_detail_buku 
	INTO v_id_detail_buku
   FROM detail_buku 
   WHERE id_buku = p_id_buku AND status = 'TERSEDIA'
   ORDER BY id_detail_buku ASC
   LIMIT 1;
   
	-- Jika tidak ada stok tersedia
   IF v_id_detail_buku IS NULL THEN
   	SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Tidak ada stok buku yang tersedia.';
   END IF;
   
   -- Ambil harga koin dan stamp buku
   SELECT koin, stamp
   INTO v_koin_buku, v_stamp_buku
   FROM buku
   WHERE id_buku = p_id_buku;

   -- Ambil saldo koin pengguna
   SELECT koin, stamp 
	INTO v_koin_pengguna, v_stamp_pengguna
   FROM pengguna
   WHERE id_pengguna = p_id_pengguna;
   
   IF p_metode = 'KOIN' THEN
   	-- Validasi koin mencukupi
   	IF v_koin_pengguna < v_koin_buku THEN
      	SIGNAL SQLSTATE '45000'
      	SET MESSAGE_TEXT = 'Koin pengguna tidak cukup untuk meminjam buku ini.';
   	END IF;

   	INSERT INTO peminjaman_buku (id_peminjaman,id_pengguna,id_detail_buku,tgl_pinjam,tgl_kembali,metode,koin_reward,denda_koin,stamp_reward, status) VALUES 
		(v_id_peminjaman,p_id_pengguna,v_id_detail_buku,p_tgl_pinjam,p_tgl_kembali,'KOIN',v_koin_buku,0,v_stamp_reward,'DIPROSES');
	ELSEIF p_metode = 'STAMP' THEN
		-- Validasi stamp mencukupi
      IF v_stamp_pengguna < v_stamp_buku THEN
         SIGNAL SQLSTATE '45000'
         SET MESSAGE_TEXT = 'Stamp pengguna tidak cukup untuk meminjam buku ini.';
      END IF;
      
      INSERT INTO peminjaman_buku (id_peminjaman,id_pengguna,id_detail_buku,tgl_pinjam,tgl_kembali,metode,koin_reward,denda_koin,stamp_reward,status) VALUES 
		(v_id_peminjaman, p_id_pengguna,v_id_detail_buku,p_tgl_pinjam,p_tgl_kembali,'STAMP',0,0,v_stamp_reward,'DIPROSES');
	END IF;
	
	-- Kunci detail buku yang sedang di proses
	UPDATE detail_buku
	SET status = 'DIPESAN'
	WHERE id_detail_buku = v_id_detail_buku;
	
   SELECT * FROM peminjaman_buku WHERE id_peminjaman = v_id_peminjaman;
END$$

CREATE PROCEDURE sp_konfirmasi_peminjaman(
   IN p_id_peminjaman CHAR(7),
   IN p_keputusan ENUM('DITERIMA','DITOLAK')
)
BEGIN
   DECLARE v_id_pengguna CHAR(7);
   DECLARE v_id_detail_buku CHAR(4);
   DECLARE v_koin_buku INT;
   DECLARE v_stamp_buku INT;
   DECLARE v_status_sekarang ENUM('DIPROSES','DITOLAK','DIPINJAM','DIKEMBALIKAN');
   DECLARE v_status_buku ENUM('TERSEDIA', 'DIPESAN', 'DIPINJAM');
   DECLARE v_metode ENUM('KOIN','STAMP');

   -- Mulai transaksi
   START TRANSACTION;

   -- Ambil data peminjaman + kunci barisnya
   SELECT id_pengguna, id_detail_buku, status, koin_reward, metode
   INTO v_id_pengguna, v_id_detail_buku, v_status_sekarang, v_koin_buku, v_metode
   FROM peminjaman_buku
   WHERE id_peminjaman = p_id_peminjaman
   FOR UPDATE;

   -- Hanya bisa dikonfirmasi jika masih DIPROSES
   IF v_status_sekarang != 'DIPROSES' THEN
   	ROLLBACK;
      SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Peminjaman ini sudah tidak dalam status DIPROSES.';
   END IF;

   IF p_keputusan = 'DITERIMA' THEN
      -- Cek status buku saat ini + kunci barisnya
      SELECT status INTO v_status_buku
      FROM detail_buku
      WHERE id_detail_buku = v_id_detail_buku
      FOR UPDATE;

      -- Jika buku sudah dipinjam orang lain yang lebih dulu dikonfirmasi
      IF v_status_buku = 'DIPINJAM' THEN
         ROLLBACK;
      	SIGNAL SQLSTATE '45000'
         SET MESSAGE_TEXT = 'Buku sudah dipinjam';
      END IF;

		IF v_metode = 'KOIN' THEN
			-- Kurangi koin pengguna
		   UPDATE pengguna
		   SET koin = koin - v_koin_buku
		   WHERE id_pengguna = v_id_pengguna;
		ELSEIF v_metode = 'STAMP' THEN
		   -- Ambil harga stamp buku
		   SELECT b.stamp INTO v_stamp_buku
		   FROM detail_buku db JOIN buku b ON db.id_buku = b.id_buku
		   WHERE db.id_detail_buku = v_id_detail_buku;
		
		   UPDATE pengguna
		   SET stamp = stamp - v_stamp_buku
		   WHERE id_pengguna = v_id_pengguna;
		END IF;
   
      -- Ubah status buku jadi DIPINJAM
      UPDATE detail_buku
      SET status = 'DIPINJAM'
      WHERE id_detail_buku = v_id_detail_buku;

      -- Update status peminjaman ke DIPINJAM
      UPDATE peminjaman_buku
      SET status = 'DIPINJAM'
      WHERE id_peminjaman = p_id_peminjaman;
      
      -- Tolak otomatis semua permintaan lain yang masih DIPROSES
      -- untuk detail buku yang sama, kecuali peminjaman ini
      UPDATE peminjaman_buku
      SET status = 'DITOLAK'
      WHERE id_detail_buku = v_id_detail_buku
      AND status = 'DIPROSES'
      AND id_peminjaman != p_id_peminjaman;

   ELSEIF p_keputusan = 'DITOLAK' THEN
      UPDATE peminjaman_buku
      SET status = 'DITOLAK'
      WHERE id_peminjaman = p_id_peminjaman;


      UPDATE detail_buku
      SET status = 'TERSEDIA'
      WHERE id_detail_buku = v_id_detail_buku;
   END IF;

   COMMIT;

END$$

CREATE PROCEDURE sp_proses_pengembalian(
   IN p_id_peminjaman CHAR(7),
   IN p_denda_koin INT
)
BEGIN
   DECLARE v_id_pengguna CHAR(7);
   DECLARE v_id_detail_buku CHAR(4);
   DECLARE v_koin_reward INT;
   DECLARE v_stamp_reward INT DEFAULT 1;
   DECLARE v_tgl_kembali DATE;
   DECLARE v_status ENUM('DIPROSES','DITOLAK','DIPINJAM','DIKEMBALIKAN');
   DECLARE v_koin_kembali INT;
   DECLARE v_tepat_waktu TINYINT DEFAULT 1;
 
   -- Ambil data peminjaman
   SELECT id_pengguna, id_detail_buku, tgl_kembali, koin_reward, stamp_reward, status
   INTO v_id_pengguna, v_id_detail_buku, v_tgl_kembali, v_koin_reward, v_stamp_reward, v_status
   FROM peminjaman_buku
   WHERE id_peminjaman = p_id_peminjaman;
 
   -- Hanya bisa diproses jika status DIPINJAM
   IF v_status != 'DIPINJAM' THEN
      SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Peminjaman ini tidak dalam status DIPINJAM.';
   END IF;
 
   -- Denda tidak boleh negatif
   IF p_denda_koin < 0 THEN
      SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Denda koin tidak boleh bernilai negatif.';
   END IF;
 
   -- Tentukan tepat waktu atau tidak
   IF CURDATE() > v_tgl_kembali THEN
      SET v_tepat_waktu = 0;
   END IF;
   
   IF v_tepat_waktu = 1 AND p_denda_koin > 0 THEN
      SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Tidak bisa memberikan denda, pengembalian tepat waktu!';
   END IF;
 
   -- Hitung koin yang dikembalikan (tidak boleh negatif)
   SET v_koin_kembali = v_koin_reward - p_denda_koin;
   IF v_koin_kembali < 0 THEN
      SET v_koin_kembali = 0;
   END IF;
 
   -- Kembalikan koin ke pengguna
   UPDATE pengguna
   SET koin = koin + v_koin_kembali
   WHERE id_pengguna = v_id_pengguna;
 
   -- Berikan stamp reward jika tepat waktu
   IF v_tepat_waktu = 1 THEN
      UPDATE pengguna
      SET stamp = stamp + v_stamp_reward
      WHERE id_pengguna = v_id_pengguna;
   END IF;
 
   -- Update status dan denda pada tabel peminjaman
   UPDATE peminjaman_buku
   SET status = 'DIKEMBALIKAN', denda_koin = p_denda_koin
   WHERE id_peminjaman = p_id_peminjaman;
 
   -- Kembalikan status buku ke TERSEDIA
   UPDATE detail_buku
   SET status = 'TERSEDIA'
   WHERE id_detail_buku = v_id_detail_buku;
 
END$$
 
DELIMITER ;