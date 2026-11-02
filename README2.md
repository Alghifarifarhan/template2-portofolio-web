# 📖 Panduan Penggunaan Halaman Admin & Batasan Website Portofolio

Selamat! Website portofolio Anda telah berhasil di-online-kan (hosting) di Firebase. File panduan ini dibuat khusus dengan bahasa yang sederhana agar mudah dipahami bagi siapa saja yang ingin mengelola konten website ini.

---

## 🔑 1. Cara Masuk ke Halaman Admin

1. Buka halaman utama website Anda, lalu tambahkan `/admin` di belakang alamat URL website:
   - **URL Publik**: `https://template2-portofolio.web.app/admin`
   - **URL Lokal**: `http://localhost:3000/admin`
2. Masukkan **Email** dan **Password** Admin Anda, lalu klik **Sign In to Dashboard**.

---

## 📝 2. Cara Mengubah & Menambahkan Isi Website

Halaman Admin dibagi menjadi beberapa menu tab sederhana di sebelah kiri:

### 🎨 Tab 1: Theme & Colors (Warna Website)

- Anda dapat mengubah warna latar belakang website (**Background Color**), warna teks utama (**Main Text Color**), dan warna aksen tombol (**Primary Accent Color**).
- Anda juga dapat mengatur warna kotak kartu pengalaman kerja (**Work Experience Card Box Colors**).

### 📌 Tab 2: Header & Navigation (Navigasi Atas)

- **Logo Header**: Tempelkan link gambar logo dari Google Drive.
- **Menu Navigasi**: Anda bisa menambah, mengubah label (seperti _Home_, _About_, _Experience_), atau menghapus link menu navigasi.

### 🚀 Tab 3: Hero & Action Buttons (Bagian Paling Atas / Banner)

- Ubah ucapan salam, nama Anda, teks berjalan (_typing text_), baris judul, dan paragraf biodata singkat.
- **Tombol Resume & Sertifikat (Opsional)**:
  - Anda bisa centang **Show on Banner** untuk menampilkan tombol, atau hapus centang untuk menyembunyikannya.
  - Isi judul tombol dan link tujuan (misal link PDF Google Drive atau link sertifikat).

### 💡 Tab 4: About Section (Bagian Keahlian & Ilustrasi)

- Ubah teks penjelas keahlian dan tempelkan link foto/ilustrasi keahlian dari Google Drive.

### 💼 Tab 5: Work Experience (Pengalaman Kerja)

- **Tambah Kartu Pengalaman**: Klik tombol **`+ Add Experience Card`**.
- **Edit Kartu**: Isi judul pekerjaan, icon foto, dan deskripsi lengkap.
- **Hapus Kartu**: Klik tombol **`Delete Card`**.
- _Catatan_: Ketika pengunjung mengeklik kartu ini di website utama, akan muncul jendela **Pop-up Modal** yang menampilkan detail lengkap pekerjaan Anda.

### 🎨 Tab 6: Featured Projects (Hasil Karya / Portofolio)

- **Tambah Proyek Baru**: Klik tombol **`+ Add New Project`**.
- **Edit Proyek**: Isi judul proyek, deskripsi, link foto sampel dari Google Drive, dan link proyek asli (misal link Figma/website).

### 🔗 Tab 7: Footer & Widgets (Bagian Bawah Website)

- Ubah judul kontak, deskripsi singkat, alamat email Anda, serta link media sosial (Instagram, GitHub, LinkedIn).
- **Widget Kalender Booking**: Centang **Show Widget on Page** untuk menampilkan kalender booking BookClipy, atau hilangkan centang jika tidak ingin digunakan. (Panduan lengkap pembuatan akun & link ada di **Bagian 4**).

---

## 🗑️ 2.1 Fitur: Bersihkan Semua Data Contoh (Initial Sample Data)

Website ini dilengkapi tombol khusus **`🗑️ Bersihkan Data Contoh`** pada bilah atas (_top bar_) Dashboard Admin.

### ✨ Apa yang dilakukan fitur ini?

- **Mengosongkan seluruh data demo bawaan hosting**: Seluruh teks greeting, nama, baris judul hero, teks biodata, menu navigasi navbar bawaan, kartu pengalaman kerja contoh, portofolio contoh, dan link gambar aset bawaan akan dibersihkan secara instan.
- **Kanvas Bersih**: Website akan menjadi bersih total dan **hanya menampilkan konten yang Anda inputkan**.
- **Pembersihan Otomatis saat Simpan**: Setiap kali Anda menyimpan data baru melalui tombol _Save All Changes_, sistem otomatis memastikan seluruh data contoh lama telah terhapus.
- **Perlindungan Copyright**: Teks hak cipta (_Copyright_) dengan hyperlink resmi ke profil Figma di bagian paling bawah website tetap terjaga dan dipertahankan.

### 🚀 Cara Menggunakan:

1. Masuk ke Halaman Admin (`/admin`).
2. Klik tombol **`🗑️ Bersihkan Data Contoh`** di kanan atas bilah navigasi admin.
3. Pada jendela konfirmasi yang muncul, klik **`Ya, Bersihkan Semua Data`**.
4. Data demo akan langsung terhapus bersih dan Anda dapat mulai mengisi data profil Anda sendiri!

---

## 🖼️ 3. Panduan Mengisi Foto dari Google Drive

Agar foto yang Anda masukkan dari Google Drive bisa tampil dengan lancar di website:

1. Buka foto di **Google Drive**.
2. Klik kanan pada foto → pilih **Bagikan (Share)**.
3. Pada opsi **Akses umum (General Access)**, ubah dari _Dibatasi (Restricted)_ menjadi **Siapa saja yang memiliki link (Anyone with the link)**.
4. Klik **Salin link (Copy link)**.
5. Tempelkan (_paste_) link tersebut ke dalam kolom input foto di Halaman Admin.

> 💡 **Fitur Live Preview**: Setiap kali Anda menempelkan link foto di Admin, akan muncul **kotak pratinjau foto langsung** sehingga Anda bisa memastikan foto berhasil muncul sebelum menekan tombol simpan.

---

## 📅 4. Panduan Membuat & Memasang Widget Kalender Booking (BookClipy)

Website ini memiliki fitur integrasi **Kalender Booking Interaktif (iFrame Widget)** yang memungkinkan calon klien, perekrut, atau pengunjung memesan jadwal konsultasi / meeting langsung di dalam website portofolio Anda.

### 🌟 Langkah 1: Membuat Kalender di BookClipy

1. Buka website resmi **[BookClipy](https://www.bookclipy.com)** (atau daftar akun di platform kalender pilihan Anda).
2. Buat akun (**Sign Up**) atau masuk (**Log In**) menggunakan akun Google/Email.
3. Buat jenis jadwal pertemuan baru (contoh: _15-Min Discovery Call_ atau _Project Consultation_).
4. Tentukan durasi meeting, hari & jam ketersediaan Anda (_Availability Schedule_), serta sambungkan ke Google Calendar agar jadwal otomatis tersinkronisasi.
5. Setelah kalender siap, **salin link publik booking Anda** (contoh format: `https://www.bookclipy.com/book/nama-anda`).

> 💡 **Bisa Menggunakan Kalender Lain?**
> Tentu saja! Selain BookClipy, Anda juga bisa memasukkan URL publik dari platform kalender booking lain seperti:
>
> - **Calendly**: `https://calendly.com/nama-anda`
> - **Cal.com**: `https://cal.com/nama-anda`
> - **Google Calendar Appointment Schedule**: Link jadwal janji temu publik dari Google Calendar.

---

### 📥 Langkah 2: Menginput Link Widget di Halaman Admin

1. Buka Halaman Admin website Anda (`/admin`) dan lakukan login.
2. Klik menu **🔗 Tab 7: Footer & Widgets** pada bilah navigasi admin di sebelah kiri.
3. Gulir ke bawah hingga menemukan bagian **BookClipy / Calendar Widget**.
4. **Centang opsi**: `[✓] Show Widget on Page` untuk mengaktifkan tampilan kalender.
5. Pada kolom **Widget iFrame URL**, tempelkan (_paste_) link kalender Anda (misal: `https://www.bookclipy.com/book/nama-anda`).
6. Klik tombol **Save All Changes** di pojok kanan atas atau bagian bawah halaman Admin.

---

### 👁️ Langkah 3: Meninjau Tampilan di Website

- Buka halaman utama website portofolio Anda (`/`).
- Gulir ke bagian bawah (tepat di atas bagian Footer), widget kalender booking interaktif Anda akan langsung muncul dan siap digunakan pengunjung untuk memesan jadwal meeting!

> 💡 **Tips Menyalakan / Mematikan Kalender**:
> Jika Anda sedang sibuk dan sementara tidak menerima booking meeting, Anda tidak perlu menghapus link kalendernya. Cukup buka **Tab 7**, **hilangkan centang pada `Show Widget on Page`**, lalu klik **Save All Changes**. Kalender akan otomatis tersembunyi dari website.

---

## 🔑 5. Cara Mengubah Password Admin

1. Masuk ke Halaman Admin (`/admin`).
2. Pilih tab menu **"🔑 Account & Security"**.
3. Masukkan **Password Baru** (minimal 6 karakter) pada kolom yang disediakan.
4. Ulangi password baru pada kolom konfirmasi.
5. Klik **Update Admin Password**.

---

## 📊 6. Batasan Kunjungan & Kuota Firebase

Website ini di-hosting menggunakan layanan \*\*Firebase Plan (Spark Tier).

### 📈 Batasan Kapasitas Harian:

- **Pengunjung Website**: Sanggup melayani hingga **~1.000 sampai 1.200 pengunjung per hari** (~30.000 pengunjung per bulan).
- **Membaca Data Website**: Sanggup melayani hingga **50.000 kali halaman dibuka per hari**.
- **Menyimpan Data Admin**: Anda dapat menekan tombol simpan perubahan di Admin hingga **20.000 kali per hari**.

### ❓ Apa yang terjadi jika pengunjung melebihi batas harian?

- Jika dalam 1 hari pengunjung sangat melonjak melebihi 1.200 pengunjung, website akan "beristirahat" sementara dan menampilkan pesan kuota penuh.
- **Buka Kembali Otomatis**: Kuota akan **diisi ulang (di-reset) secara otomatis setiap jam 14:00 WIB** setiap harinya.

---
