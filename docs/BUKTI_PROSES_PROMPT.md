# Bukti Proses — Prompt Bertahap (Modular Prompting)

- **Nama:** Teuku Albirza Youza
- **NIM:** 13112510708
- **Nomor Ide / Tema:** 40 — Panggilan Ulang Pelanggan yang Tertunda
- **Nama Aplikasi:** ReQueue (Konteks Usaha: *PrimaCare Service Center*)
- **Platform:** Google Gemini Canvas (HTML5 / CSS3 / Vanilla JavaScript)

---

## Prompt 1 — Membuat Kerangka Tampilan & Komponen Input–Output

**Prompt yang digunakan:**
> Buat aplikasi web yang dapat dijalankan langsung pada pratinjau platform (HTML, CSS, dan JavaScript murni) bernama **ReQueue** untuk tema *Panggilan Ulang Pelanggan yang Tertunda* dengan konteks usaha *PrimaCare Service Center*. Gunakan data contoh sintetis, tiga fitur inti, dan tampilan dashboard yang bersih serta modern. Hindari layanan eksternal berbayar, pembayaran nyata, atau autentikasi berlapis.
> Susun tata letak berikut:
> 1. Bagian atas: Header dengan tombol Riwayat Log, Reset Data Contoh, dan Tambah Pelanggan; pita visualisasi alur kerja 5 langkah (`Catat Penundaan → Pilih Alasan → Tentukan Prasyarat → Tandai Siap → Masuk Antrean`); dan 4 kartu KPI (*Sedang Dilayani*, *Antrean Aktif*, *Pelanggan Tertunda*, *Siap Masuk Antrean*).
> 2. Kolom kiri: Panel *Loket Layanan Aktif* (dengan tombol *Tunda Layanan* dan *Selesai Layani*) dan panel *Antrean Aktif*.
> 3. Kolom kanan: Panel *Papan Pelanggan Tertunda* dengan tab filter (*Semua*, *Menunggu Prasyarat*, *Siap Masuk Antrean*), kotak pencarian, dan tombol *Catat Penundaan Baru*.
> 4. Modal *Catat Penundaan*, modal *Tambah Pelanggan*, modal *Konfirmasi Masuk Antrean*, dan drawer *Riwayat Log*.

**Hasil Penting:**
- Kerangka antarmuka terbentuk lengkap, responsif, dan seluruh komponen input–output tersusun sesuai alur kerja 5 tahap Tema 40.

---

## Prompt 2 — Menghubungkan Alur Utama, Data Contoh, dan Aturan Keputusan

**Prompt yang digunakan:**
> Hubungkan seluruh interaksi pada aplikasi **ReQueue** dengan data contoh realistis (1 pelanggan di loket aktif `A-101`, 2 di antrean aktif `A-102` dan `A-103`, serta 3 di papan tertunda `A-104` dengan 1/2 prasyarat, `A-105` siap masuk antrean 2/2, dan `A-106` dengan 0/2 prasyarat) yang tersimpan di `localStorage` dan dapat direset lewat tombol *Reset Data Contoh*.
> Terapkan aturan keputusan berikut secara ketat:
> 1. Saat mencatat penundaan, tampilkan saran prasyarat otomatis sesuai alasan yang dipilih serta opsi tambah prasyarat manual. Tolak penyimpanan jika nomor antrean, nama, jenis layanan, alasan, atau prasyarat (minimal 1) kosong atau jika nomor antrean duplikat.
> 2. Di Papan Pelanggan Tertunda, pelanggan **tidak boleh** ditandai "Siap" ataupun dimasukkan kembali ke Antrean Aktif selama masih ada prasyarat yang belum dicentang. Jika tombol terkunci diklik, tampilkan notifikasi penolakan yang menyebutkan prasyarat yang belum terpenuhi dan catat ke Riwayat Log.
> 3. Hanya pelanggan yang semua prasyaratnya terpenuhi dan sudah diklik "Tandai Siap" yang dapat dimasukkan kembali ke Antrean Aktif (dengan pilihan posisi Prioritas Panggilan Ulang atau Reguler) sambil mempertahankan badge `Panggilan Ulang` dan catatan alasan penundaan sebelumnya.

**Hasil Penting:**
- Alur end-to-end berjalan utuh, gerbang prasyarat aktif memblokir pemindahan pelanggan yang belum memenuhi syarat, dan konteks layanan tidak hilang ketika pelanggan masuk kembali ke antrean.

---

## Prompt 3 — Pengujian, Perbaikan, dan Penyempurnaan Berdasarkan Temuan

**Temuan Pengujian & Alasan Perubahan:**
- **Temuan:** Saat dilakukan variasi pengujian kondisi batas (petugas sudah menekan "Tandai Siap" pada kartu yang prasyaratnya lengkap, lalu salah satu checkbox prasyarat dibatalkan/dicabut kembali), status `markedReady` perlu dipastikan otomatis kembali tidak siap agar tidak menimbulkan celah aturan bisnis.
- **Prompt Perbaikan:**
  > Tambahkan pengaman otomatis pada fungsi centang prasyarat: jika petugas membatalkan centang salah satu prasyarat pada pelanggan yang sebelumnya sudah ditandai "Siap", ubah status `markedReady` kembali menjadi `false` secara otomatis, tampilkan toast peringatan, dan catat perubahannya di Riwayat Log. Pastikan juga pita langkah workflow (1 sampai 5) otomatis menyorot tahap yang sedang dijalankan petugas.

**Hasil Setelah Perbaikan:**
- Status "Siap" selalu konsisten dengan pemenuhan 100% prasyarat dalam segala kondisi.
- Pengujian ulang pada 3 skenario wajib (Alur Normal, Input Tidak Valid, dan Kondisi Batas/Aturan Bisnis) lulus 100% tanpa console error.

---

## Pembelajaran & Prioritas Pengembangan Berikutnya

1. **Pembelajaran Penting:** Memecah prompt secara bertahap (UI → logika & aturan bisnis → pengujian & pengaman kasus tepi) membuat setiap aturan bisnis lebih mudah diverifikasi dan mencegah logika yang saling bertabrakan.
2. **Prioritas Pengembangan Berikutnya:** Menambahkan fitur ringkasan analitik alasan penundaan terbanyak (untuk perbaikan SOP operasional *Business Creation*) serta notifikasi panggilan ulang ke pelanggan ketika giliran tiba.
