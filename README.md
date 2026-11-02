# 🚀 Personal Developer Portfolio & CMS Template 2 (Modified Version)

> Website portofolio interaktif dan modern yang dibangun dengan **Next.js 16**, **React 19**, **TypeScript**, **Tailwind CSS v4**, serta terintegrasi penuh dengan **Firebase SDK (Authentication & Cloud Firestore)** untuk manajemen konten dinamis secara real-time via Admin Dashboard (`/admin`).

---

## 📌 Keterangan Modifikasi & Atribusi (Attribution & Disclaimer)

> **⚠️ Catatan Penting Mengenai Lisensi & Hak Cipta:**  
> Proyek ini merupakan **hasil modifikasi / remix** dari desain portofolio asli karya **[Ibrahim Memon](https://www.figma.com/@ibrahimmemon)** (repositori asli: [ibrahimmemonn/Figma-Portfolio](https://github.com/ibrahimmemonn/Figma-Portfolio)).
>
> Seluruh informasi hak cipta dan lisensi asli tetap dipertahankan pada **bagian lisensi footer website (`app/components/Footer.tsx`)**, termasuk atribusi kredit icon dari kreator di [Flaticon](https://www.flaticon.com):
> - **Programming language icons** dibuat oleh *Mayor Icons - Flaticon*
> - **Graphic design icons** & **Document icons** & **User icons** dibuat oleh *Magnific - Flaticon*
> - **Search icons** dibuat oleh *Good Ware - Flaticon*
>
> **Fitur Tambahan pada Versi Modifikasi ini:**
> - Integrasi **Firebase Admin Dashboard (`/admin`)** dengan autentikasi email & password.
> - Database NoSQL **Cloud Firestore** untuk update konten portofolio secara real-time tanpa perlu redeploy kode.
> - Pengaturan tema warna dinamis (Background, Text, Accent, Card styling) melalui CSS Variables injection.
> - Integrasi widget kalender booking interaktif (BookClipy / Calendly / Cal.com).
> - Fitur *One-Click Clean Sample Data* untuk membersihkan seluruh data demo awal.
> - Dukungan gambar via Google Drive Share Link dengan *live image preview*.
> - Sinkronisasi lintas tab browser menggunakan *BroadcastChannel API* dan *localStorage cache*.

---

## 🛠️ Framework & Teknologi yang Digunakan

Website ini dibangun menggunakan stack teknologi modern dengan performa tinggi:

| Teknologi / Framework | Versi | Fungsi & Penjelasan |
| :--- | :--- | :--- |
| **[Next.js](https://nextjs.org/)** | `16.x` (App Router) | Framework React full-stack utama. Menggunakan arsitektur App Router terbaru, Server Components, Client Components, optimasi aset, SEO metadata terstruktur, dan performa tinggi. |
| **[React](https://react.dev/)** | `19.x` | Library UI inti untuk membangun antarmuka interaktif berbasis komponen modular, Hooks (`useState`, `useEffect`, `useCallback`), dan Context API. |
| **[TypeScript](https://www.typescriptlang.org/)** | `5.x` | Bahasa pemrograman utama dengan static typing ketat untuk menjamin keamanan tipe data (`types/siteData.ts`) dan meminimalisir runtime error. |
| **[Tailwind CSS](https://tailwindcss.com/)** | `v4.x` | Framework utility-first CSS generasi terbaru via `@tailwindcss/postcss`. Digunakan untuk seluruh tata letak responsif, animasi, serta sinkronisasi tema warna dinamis. |
| **[Firebase Web SDK](https://firebase.google.com/)** | `v12.x` | Backend-as-a-Service (BaaS) dari Google: <br>• **Firebase Auth**: Autentikasi aman untuk akun admin pengelola website. <br>• **Cloud Firestore**: Database dokumen NoSQL real-time (`onSnapshot`) untuk sinkronisasi data seketika. <br>• **Firebase Hosting**: Konfigurasi deployment static export via `firebase.json`. |
| **[Vercel Analytics](https://vercel.com/analytics)** | `^1.5.0` | Pemantauan analitik pengunjung web secara otomatis dan privacy-friendly. |
| **Google Fonts (Poppins)** | `next/font` | Optimasi font lokal otomatis dengan varian weight 300 hingga 900 tanpa beban request eksternal tambahan. |
| **BroadcastChannel & Storage API** | Native Web API | Sinkronisasi perubahan data real-time antar-tab browser seketika tanpa perlu me-refresh halaman. |

---

## ✨ Fitur-Fitur Utama

1. **Dashboard Admin Mandiri (`/admin`)**:
   - Login aman dengan Firebase Authentication.
   - Manajemen konten Hero Banner (Greeting, Nama, Animated Typing Text, Quotes, Bio, Tombol CV & Sertifikat).
   - Manajemen Kartu Pengalaman Kerja (*Work Experience*) lengkap dengan modal popup detail.
   - Manajemen Hasil Karya / Portofolio Proyek (*Featured Projects*).
   - Pengaturan Navigasi Header, Footer, Sosial Media (Instagram, GitHub, LinkedIn, Twitter, Pinterest).
2. **Tema Warna Dinamis (Theme Customizer)**:
   - Bebas mengubah warna latar belakang (*Background Color*), teks, warna aksen tombol (*Primary Accent*), dan warna kartu pengalaman langsung dari Admin.
3. **Widget Booking Kalender Terintegrasi**:
   - Dukungan iFrame untuk [BookClipy](https://www.bookclipy.com), [Calendly](https://calendly.com), [Cal.com](https://cal.com), atau *Google Calendar Appointment*.
4. **Alat Pembersih Data Demo**:
   - Tombol **"🗑️ Bersihkan Data Contoh"** di panel admin untuk mengosongkan seluruh template dummy awal agar siap diisi dengan portofolio pribadi Anda.
5. **Dukungan Foto Google Drive**:
   - Dapat langsung menggunakan link publik foto dari Google Drive dengan konverter otomatis dan fitur *Live Preview*.

---

## 📁 Struktur Direktori Proyek

```text
├── app/
│   ├── admin/               # Halaman Dashboard Admin CMS (/admin)
│   ├── components/          # Komponen UI (Banner, Header, Projects, Experience, Footer, dll.)
│   ├── globals.css          # Konfigurasi CSS Tailwind & Root Theme Variables
│   ├── layout.tsx           # Root Layout, Metadata SEO, & Favicon
│   └── page.tsx             # Halaman Utama Portofolio (/)
├── context/
│   └── SiteContext.tsx      # State Management global, Firestore Sync, & Offline Cache
├── lib/
│   ├── driveUtils.ts        # Helper utilitas konversi URL Google Drive
│   └── firebase.ts          # Inisialisasi Firebase SDK (Auth & Firestore)
├── public/                  # Aset gambar statis, icon, dan logo
├── types/
│   └── siteData.ts          # Definisi TypeScript Interface & Schema Konten
├── .env.example             # Contoh template Environment Variables
├── firebase.json            # Konfigurasi Firebase Hosting
├── next.config.ts           # Konfigurasi Next.js
├── package.json             # Dependensi proyek & scripts
└── tsconfig.json            # Konfigurasi TypeScript
```

---

## 💻 Prasyarat Sistem (Prerequisites)

Sebelum memulai, pastikan perangkat Anda telah terpasang:
- **Node.js**: Versi `18.18.0` atau yang lebih baru (disarankan Node.js v20 LTS).
- **npm** (bawaan Node.js), **yarn**, atau **pnpm**.
- Akun Google untuk mengakses **[Firebase Console](https://console.firebase.google.com/)**.

---

## 🚀 Panduan Kloning & Menjalankan Proyek Secara Lokal

Ikuti langkah-langkah berikut secara berurutan:

### 1. Kloning Repositori

```bash
git clone https://github.com/<USERNAME-ANDA>/<NAMA-REPOSITORI-ANDA>.git
cd <NAMA-REPOSITORI-ANDA>
```

### 2. Pasang Dependensi (Dependencies)

```bash
npm install
```

### 3. Konfigurasi Firebase SDK

Proyek ini telah disiapkan agar kredensial Firebase tidak terekspos secara publik. Anda dapat mengonfigurasinya melalui file `.env.local`:

1. Salin file template `.env.example`:
   ```bash
   cp .env.example .env.local
   ```
2. Buka `.env.local` dan isi dengan konfigurasi dari Firebase Console Anda:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=project-anda.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=project-anda
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=project-anda.firebasestorage.app
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1234567890
   NEXT_PUBLIC_FIREBASE_APP_ID=1:1234567890:web:abcdef123456
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
   ```
   *(Atau Anda juga dapat mengisi langsung variabel default di file [`lib/firebase.ts`](lib/firebase.ts)).*

### 4. Jalankan Server Development

```bash
npm run dev
```

Buka browser dan akses:
- **Website Utama**: [http://localhost:3000](http://localhost:3000)
- **Halaman Admin**: [http://localhost:3000/admin](http://localhost:3000/admin)

---

## ⚙️ Panduan Menyiapkan Firebase Project Baru

Jika Anda belum memiliki proyek Firebase:

1. Kunjungi **[Firebase Console](https://console.firebase.google.com/)** dan klik **"Add project"**.
2. Masukkan nama project Anda dan ikuti panduan hingga selesai.
3. Di dalam dashboard project:
   - **Buat Web App**: Klik icon Web (`</>`), beri nama aplikasi, lalu Anda akan mendapatkan objek konfigurasi `firebaseConfig`.
   - **Aktifkan Authentication**: Masuk ke menu **Build** > **Authentication** > **Get started** > pilih tab **Sign-in method** > aktifkan provider **Email/Password**. Kemudian masuk ke tab **Users** dan tambahkan 1 akun user untuk login admin Anda.
   - **Aktifkan Cloud Firestore**: Masuk ke menu **Build** > **Firestore Database** > **Create database** > pilih lokasi database. Pada tab **Rules**, pastikan aturan mengizinkan pembacaan publik dan penulisan hanya untuk admin yang telah login:
     ```javascript
     rules_version = '2';
     service cloud.firestore {
       match /databases/{database}/documents {
         // Siapa saja bisa membaca isi portofolio
         match /site_settings/{document=**} {
           allow read: if true;
           allow write: if request.auth != null;
         }
         // Statistik kunjungan
         match /site_stats/{document=**} {
           allow read: if true;
           allow write: if true;
         }
       }
     }
     ```

---

## 📄 Lisensi & Kredit

- **Desain & Repositori Asli**: © Copyright 2025-2026 [Ibrahim Memon](https://www.figma.com/@ibrahimmemon) ([Original Repo](https://github.com/ibrahimmemonn/Figma-Portfolio)).
- **Modifikasi & Fitur CMS**: Dikembangkan sebagai portfolio mandiri dengan integrasi Next.js, Firebase Auth, dan Cloud Firestore.
- **Atribusi Ikon**: Seluruh atribusi ikon tertera lengkap pada footer website sesuai dengan lisensi Flaticon.
