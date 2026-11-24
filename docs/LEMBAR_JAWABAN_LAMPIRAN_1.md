# Lampiran 1 — Lembar Jawaban (1 dari 2)

| Identitas | Isian |
| --- | --- |
| **NIM / Nama / Kelas** | `13112510708` / **Teuku Albirza Youza** / `[Isi Kelas Anda]` |
| **Nomor ide / Nama aplikasi** | **40** / **ReQueue — Panggilan Ulang Pelanggan yang Tertunda** |
| **Platform yang dipilih** | ☑ Google Gemini Canvas &nbsp;&nbsp;&nbsp; ☐ Google AI Studio |
| **Tautan aplikasi — wajib** | https://github.com/ezastrn/Business-Project (Pratinjau Web: `index.html` / https://ezastrn.github.io/Business-Project/) |

---

## Fase 1 — Dari Problem Statement Menuju Workflow

| Poin dan petunjuk jawaban singkat | Jawaban mahasiswa |
| --- | --- |
| **1.1. Target Pengguna dan Tujuan Utama (User Persona & Goal)** | Pengguna utama adalah petugas loket (*frontliner*) pada usaha layanan tatap muka UMKM (contoh konteks: *PrimaCare Service Center*) yang menangani pelanggan dengan kebutuhan berkas/verifikasi bertahap. Tujuan akhirnya adalah mencatat setiap permintaan layanan yang tertunda beserta alasan dan prasyaratnya agar tidak hilang saat petugas beralih ke pelanggan lain, serta memanggil ulang pelanggan secara tertib. Dalam konteks *Business Creation*, aplikasi ini meningkatkan kepuasan dan retensi pelanggan dengan indikator manfaat: menurunkan kasus permintaan tertunda yang tercecer menjadi 0% dan meningkatkan keterlacakan status layanan. |
| **1.2. Fitur Inti (MVP / Minimum Viable Product)** | 1) **Manajemen Loket Aktif & Pencatatan Penundaan**: Memungkinkan petugas menunda pelanggan dari loket atau mencatat penundaan baru dengan alasan dan prasyarat wajib. 2) **Papan Pelanggan Tertunda & Verifikasi Prasyarat**: Melacak daftar tertunda lengkap dengan filter status, progres checklist prasyarat, dan validasi status "Siap". 3) **Panggilan Ulang (*Re-Queue*) & Riwayat Log**: Memasukkan kembali pelanggan yang sudah "Siap" ke Antrean Aktif (prioritas/reguler) tanpa kehilangan konteks layanan sebelumnya. *Batas solusi*: menggunakan data contoh sintetis lokal, tanpa pembayaran nyata, tanpa autentikasi berlapis, dan tanpa integrasi notifikasi SMS/WhatsApp eksternal. |
| **1.3. Arsitektur Input dan Output (Data Flow)** | **Input**: teks (nomor antrean, nama pelanggan, prasyarat khusus, catatan), pilihan terstruktur (jenis layanan, alasan penundaan, posisi antrean ulang), dan interaksi checklist prasyarat. **Proses (berbasis aturan aplikasi, tanpa AI generatif)**: validasi kelengkapan & anti-duplikasi nomor, perhitungan progres prasyarat, serta gerbang aturan wajib sebelum masuk kembali ke antrean. **Output**: kartu Loket Aktif, Papan Pelanggan Tertunda dengan *progress bar*, Antrean Aktif berlabel `Panggilan Ulang`, 4 kartu KPI, pesan validasi/penolakan, dan Riwayat Log aktivitas. |
| **1.4. Alur Kerja (Workflow / User Journey)** | **Alur 5 Langkah**: `1. Catat penundaan (dari Loket Aktif atau form baru)` → `2. Pilih alasan penundaan` → `3. Tentukan minimal 1 prasyarat wajib` → `4. Centang prasyarat hingga 100% lalu klik "Tandai Siap"` → `5. Masukkan kembali ke Antrean Aktif (Prioritas/Reguler) dan panggil ulang`. <br>**Aturan Jika–Maka**: (1) *Jika* nomor antrean, nama, layanan, alasan, atau prasyarat (minimal 1) kosong atau nomor antrean duplikat, *maka* sistem menolak penyimpanan dan menampilkan pesan perbaikan spesifik. (2) *Jika* masih ada prasyarat belum terpenuhi atau belum ditandai "Siap", *maka* sistem memblokir pemindahan ke Antrean Aktif dan menampilkan peringatan prasyarat yang masih kurang. |

---

# Lampiran 1 — Lembar Jawaban (2 dari 2)

**NIM:** `13112510708` &nbsp;&nbsp;&nbsp;&nbsp; **Nama:** `Teuku Albirza Youza`

## Fase 2 — Dari Workflow Menuju Prompt / Vibe Coding

| Poin dan petunjuk jawaban singkat | Jawaban mahasiswa |
| --- | --- |
| **2.1. Tech Stack dan Batasan Teknis** | Platform: **Google Gemini Canvas** (serta dipublikasikan pada repositori GitHub `ezastrn/Business-Project` sebagai fondasi proyek). Teknologi: HTML5, CSS3, dan Vanilla JavaScript (*client-side* dengan penyimpanan `localStorage`). Batasan teknis: berjalan langsung di pratinjau browser tanpa instalasi server, menggunakan data contoh sintetis, dibatasi pada 3 fitur inti, tanpa layanan eksternal berbayar, tanpa pembayaran nyata, dan tanpa autentikasi berlapis. |
| **2.2. Wireframe / Tata Letak Antarmuka (UI Layout)** | Header aksi cepat, pita alur kerja 5 langkah, dan 4 kartu KPI berada di bagian atas; kolom kiri menampilkan Loket Layanan Aktif di atas dan daftar Antrean Aktif di bawah; kolom kanan menampilkan Papan Pelanggan Tertunda dengan filter/pencarian dan checklist prasyarat, dilengkapi modal input di tengah layar serta panel geser Riwayat Log di sisi kanan. |
| **2.3. System Instructions dan Format Data (Schema)** | Aplikasi ini menggunakan **aturan pemrosesan deterministik** (tanpa AI generatif saat digunakan): (a) setiap penundaan wajib memiliki minimal 1 prasyarat; (b) `markedReady` hanya dapat bernilai `true` jika seluruh item `prerequisites.done === true`; (c) pelanggan hanya dapat masuk kembali ke `activeQueue` jika seluruh prasyarat terpenuhi dan `markedReady === true`; (d) jika prasyarat dicabut kembali, `markedReady` otomatis direset ke `false`. <br>**Contoh Struktur Data**: `{ ticket: "A-104", name: "Siti Rahmawati", service: "Klaim Garansi Produk", reason: "Dokumen / Bukti Pembelian Belum Lengkap", prerequisites: [{ label: "Struk pembelian asli", done: true }, { label: "Kartu garansi resmi", done: false }], markedReady: false }`. |
| **2.4. Prompt Bertahap (Modular Prompting)** | **P1 (Kerangka UI)**: Membangun tata letak dashboard ReQueue (header, workflow bar 5 langkah, 4 kartu KPI, kolom Loket & Antrean Aktif, Papan Pelanggan Tertunda, dan modal Catat Penundaan). <br>**P2 (Fungsi & Logika)**: Menghubungkan data contoh sintetis, preset prasyarat berdasarkan alasan, checklist progres, validasi input wajib, gerbang aturan blokir sebelum prasyarat 100%, serta Riwayat Log. <br>**P3 (Perbaikan Berdasarkan Uji)**: *Temuan*: saat centang prasyarat dibatalkan setelah menekan "Tandai Siap", status berpotensi tidak sinkron → *Alasan perubahan*: menjaga integritas gerbang prasyarat → *Hasil*: ditambahkan reset otomatis status Siap saat prasyarat dicabut dan seluruh 3 skenario uji dinyatakan lulus. *Prioritas pengembangan berikutnya*: menambahkan pengingat panggilan otomatis dan analitik alasan penundaan terbanyak untuk perbaikan SOP layanan. |

**Link riwayat prompt atau nama berkas bukti proses (jika terpisah):** `docs/BUKTI_PROSES_PROMPT.md` dan `docs/BUKTI_PENGUJIAN.md` (pada https://github.com/ezastrn/Business-Project)
