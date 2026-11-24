# ReQueue — Panggilan Ulang Pelanggan yang Tertunda (Tema #40)

Prototipe aplikasi bisnis dan fondasi proyek UAS mata kuliah **AI for Entrepreneurs (MJNB1W27)** — Program Studi S1 Manajemen – Bisnis, Universitas Prasetiya Mulya.

- **Nama:** Teuku Albirza Youza
- **NIM:** 13112510708
- **Nomor Ide / Tema:** 40 — *Panggilan Ulang Pelanggan yang Tertunda*
- **Konteks Usaha:** PrimaCare Service Center (UMKM Layanan & Servis Cepat)

---

## Masalah & Alur Kerja (Tema 40)

- **Problem Statement:** Permintaan layanan tertunda hilang ketika petugas beralih ke pelanggan lain.
- **Alur Kerja Utama:**
  `Catat penundaan` → `Pilih alasan` → `Tentukan prasyarat` → `Tandai siap` → `Masukkan kembali antrean`
- **Aturan Bisnis Wajib:** Pelanggan hanya dapat kembali ke antrean **setelah seluruh prasyarat terpenuhi** dan ditandai **Siap** oleh petugas.

---

## Fitur Inti (MVP)

1. **Manajemen Loket Aktif & Pencatatan Penundaan** — Melayani pelanggan di loket, menambah pelanggan baru, menyelesaikan layanan, atau menunda pelanggan lengkap dengan alasan penundaan dan minimal 1 prasyarat wajib.
2. **Papan Pelanggan Tertunda & Verifikasi Prasyarat** — Melacak seluruh permintaan tertunda dengan filter status (*Semua*, *Menunggu Prasyarat*, *Siap Masuk Antrean*), pencarian cepat, progress bar checklist, dan penguncian otomatis hingga 100% prasyarat terpenuhi.
3. **Panggilan Ulang (*Re-Queue*) & Riwayat Log** — Memasukkan kembali pelanggan berstatus "Siap" ke Antrean Aktif (*Prioritas Panggilan Ulang* atau *Reguler*) sambil mempertahankan konteks alasan penundaan sebelumnya dan mencatat setiap aktivitas di Riwayat Log.

---

## Struktur Proyek

```text
.
├── index.html                                    # Aplikasi web ReQueue (siap buka di browser / GitHub Pages)
├── styles.css                                    # Desain modern & responsif
├── app.js                                        # Logika workflow Tema 40, data contoh sintetis, & aturan keputusan
├── KELAS#_13112510708_Teuku-Albirza-Youza.docx   # Lembar Jawaban resmi sesuai template Lampiran 1 (ganti KELAS#)
└── docs/
    ├── LEMBAR_JAWABAN_LAMPIRAN_1.md              # Versi Markdown Lembar Jawaban Lampiran 1
    ├── BUKTI_PROSES_PROMPT.md                    # Dokumentasi Prompt Bertahap (P1, P2, P3) & iterasi
    ├── BUKTI_PENGUJIAN.md                        # Laporan 3 Skenario Uji (Normal, Input Tidak Valid, Aturan Bisnis)
    └── screenshots/
        └── hasil_uji_requeue.png                 # Bukti tangkapan layar hasil pengujian aplikasi
```

---

## Cara Menjalankan Aplikasi

1. Buka file `index.html` langsung di browser modern (Chrome, Edge, Firefox), **atau**
2. Aktifkan **GitHub Pages** pada pengaturan repositori (`Settings → Pages → Branch: main / root`) untuk mengakses pratinjau langsung secara online.
3. Gunakan tombol **Reset Data Contoh** di pojok kanan atas kapan saja untuk mengembalikan data simulasi awal.
