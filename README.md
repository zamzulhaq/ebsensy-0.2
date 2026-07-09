
<p align="center">
  <img src="https://img.shields.io/badge/Status-Pengembangan%20Aktif-blue" alt="Status">
  <img src="https://img.shields.io/badge/Platform-Web%20%7C%20Android-blue" alt="Platform">
  <img src="https://img.shields.io/badge/React-19.x-61DAFB" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-5.7-3178C6" alt="TypeScript">
  <img src="https://img.shields.io/badge/Supabase-2.49-3ECF8E" alt="Supabase">
  <img src="https://img.shields.io/badge/Tailwind-3.4-06B6D4" alt="Tailwind">
</p>

<h1 align="center">Ebsensy — Manajemen Sekolah IT</h1>

<p align="center">
  Sistem Manajemen Sekolah Terpadu (All-in-One) untuk Pondok Pesantren, PKBM, dan Lembaga Tahfidz.  
  Dibangun dengan arsitektur multi-role, dual-track kelas, dan sistem proteksi data ketat.
</p>

<p align="center">
  <strong>Ebsensy</strong> — sebelumnya dikenal sebagai project manajemen sekolah, dikembangkan oleh <strong>Azzam Khalifatulhaq</strong> di bawah naungan <strong>Zamify</strong>.
</p>

---

## Daftar Isi

- [Tentang Ebsensy](#tentang-ebsensy)
- [Fitur Utama](#fitur-utama)
- [Teknologi](#teknologi)
- [Role Pengguna](#role-pengguna)
- [Modul Core](#modul-core)
- [Cara Installasi](#cara-installasi)
- [Pengembangan](#pengembangan)
- [Lisensi](#lisensi)
- [Kontak](#kontak)

---

## Tentang Ebsensy

**Ebsensy** adalah platform manajemen sekolah berbasis web modern yang dirancang khusus untuk kebutuhan lembaga pendidikan Islam terpadu. Sistem ini mendukung multi-role dalam satu akun, dual-track kelas (Reguler + Halaqoh Tahfidz), engine raport kustom berbasis template Word (.docx), serta sistem proteksi nilai dengan deadline locking otomatis.

Dibangun dengan pendekatan modular dan database-first, Ebsensy siap digunakan oleh pondok pesantren, sekolah Islam, PKBM, dan lembaga tahfidz yang membutuhkan solusi all-in-one tanpa ribet.

---

## Fitur Utama

### Multi-Role & Multi-Workspace
Satu akun bisa memiliki banyak peran (Super Admin, Guru, Wali Kelas, Musyrif Tahfidz, Wali Santri) dengan sistem workspace switching tanpa perlu logout.

### Dual-Track Kelas & Absensi
Pemisahan antara Kelas Reguler (Diniyah/PKBM) dan Kelas Halaqoh (Tahfidz) dengan absensi mandiri yang terpisah namun tetap saling terintegrasi melalui smart alert system.

### Deadline Locking & Dispensasi
Sistem penguncian input nilai otomatis saat tenggat waktu habis. Hanya Super Admin yang bisa memberikan dispensasi perpanjangan waktu secara manual.

### Engine Raport Kustom (Token-Based)
Sekolah bisa menggunakan layout raport sendiri dalam format Microsoft Word (.docx) dengan menempelkan token resmi dari sistem. Sistem akan melakukan find-and-replace otomatis dan menghasilkan PDF final.

### Otomatisasi Kenaikan Kelas & Kelulusan
Sistem cron job akan memindahkan seluruh santri ke jenjang berikutnya secara massal di akhir tahun ajaran. Dilengkapi kalkulator ijazah 5 semester untuk kelas akhir.

### Sistem Proteksi Keuangan
Pemblokiran kartu ujian otomatis bagi santri yang menunggak SPP. Super Admin dapat memberikan dispensasi secara manual.

### Autentikasi WhatsApp Wali Murid
Verifikasi nomor WhatsApp dengan OTP melalui WhatsApp Gateway untuk memastikan data wali murid valid. Dashboard monitoring aktivasi tersedia untuk Super Admin.

### Notifikasi Multi-Channel
Notifikasi dikirim melalui WhatsApp Gateway dan In-App Push Notification untuk berbagai trigger seperti tagihan, deadline nilai, pengumuman, dan pengiriman raport.

### Grafik Analitik Interaktif
Dashboard visual untuk setiap role: progres hafalan, tren nilai, statistik kehadiran, efektivitas pembelajaran, dan analisis keuangan.

---

## Teknologi

### Frontend
- **React 19** — Library UI modern dengan server components
- **TypeScript 5.7** — Type safety untuk skala besar
- **Vite 6** — Build tool super cepat
- **Tailwind CSS 3.4** — Utility-first styling
- **React Router 7** — Routing SPA yang powerful

### Backend & Database
- **Supabase** — Backend-as-a-Service (PostgreSQL + Auth + Realtime)
- **PostgreSQL** — Database relasional

### Tools
- **ESLint** — Linting & code quality
- **PostCSS** — CSS processing
- **Autoprefixer** — CSS cross-browser compatibility

---

## Role Pengguna

| Role | Hak Akses Utama |
|------|----------------|
| **Super Admin** | Konfigurasi sistem, master data, target hafalan, deadline nilai, dispensasi keuangan, log global |
| **Guru Mapel** | Absen mengajar (QR), jurnal harian, input absensi & nilai santri, catatan personal |
| **Wali Kelas** | Monitor penuh (read-only) semua nilai & absensi satu kelas, generate & kirim raport |
| **Musyrif Tahfidz** | Input hafalan harian, ujian pekanan tahfidz |
| **Wali Santri** | Pantau nilai, absensi, hafalan, tagihan secara real-time via APK/Web |

---

## Modul Core

1. **Alur Pendaftaran & Validasi WhatsApp** — Anti-modal murahan dengan verifikasi OTP
2. **Struktur Kelas Ganda** — Kelas Reguler + Halaqoh dengan absensi terpisah
3. **Manajemen Nilai & Deadline Locking** — Kunci otomatis + dispensasi manual
4. **Engine Raport Token (.docx)** — Template kustom dengan find-and-replace token
5. **Siklus Hidup Santri** — Kenaikan otomatis, mutasi, kalkulator ijazah
6. **Ketat Keuangan** — Pemblokiran ujian otomatis + dispensasi
7. **Notifikasi & Distribusi Data** — WhatsApp Gateway + In-App Push
8. **Grafik Dashboard Analitik** — Visual analytics untuk setiap role

---

## Cara Installasi

### Prasyarat
- Node.js 18+
- npm 9+
- Akun Supabase

### Langkah-langkah

```bash
# Clone repository
git clone https://github.com/zamify/ebsensy.git
cd ebsensy

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
# Isi konfigurasi Supabase di file .env

# Jalankan development server
npm run dev
```

### Build Production

```bash
npm run build
npm run preview
```

---

## Pengembangan

Project ini dikembangkan secara modular berdasarkan fase:

| Fase | Fokus |
|------|-------|
| **Fase 1** | Multi-role Auth, Verifikasi WhatsApp |
| **Fase 2** | Dual-Track Absensi, Jurnal Mengajar, Smart Alert |
| **Fase 3** | Modul Tahfidz dengan Integrasi Quran API |
| **Fase 4** | Kebijakan Keuangan Ketat & Pemblokiran Ujian |
| **Fase 5** | Engine Raport Template (.docx) ke PDF |
| **Fase 6** | Kenaikan Kelas Otomatis & Kalkulator Ijazah |
| **Fase 7** | Dashboard Analitik & Grafik Efektivitas |

---

## Lisensi

**Hak Cipta © 2026 Azzam Khalifatulhaq - Pemilik Zamify**

Project ini dilindungi oleh **lisensi proprietary**. Seluruh kode sumber, desain, dan aset dalam repository ini adalah milik eksklusif pemilik hak cipta.

**Anda tidak diizinkan** untuk menggunakan, menyalin, memodifikasi, mendistribusikan, atau mengeksploitasi kode ini dalam bentuk apa pun tanpa **izin tertulis** dari pemilik hak cipta.

Lihat file [LICENSE](./LICENSE) untuk informasi lengkap.

---

## Kontak

**Azzam Khalifatulhaq** — Pemilik Zamify

- Email: [azzamkhalifatulhaq@gmail.com](mailto:azzamkhalifatulhaq@gmail.com)
- GitHub: [@zamzulhaq](https://github.com/zamzulhaq/)

---

<p align="center">
  Dibuat dengan ❤️ oleh <strong>Azzam Khalifatulhaq</strong> — Zamify
</p>
