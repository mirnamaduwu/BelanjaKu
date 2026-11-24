# BelanjaKu — Website E-Commerce (Spring Boot + MySQL)

Proyek ini diadaptasi dari contoh TokoKita yang dikirim, dengan nama aplikasi, package Java, database, dan koleksi Postman diubah menjadi BelanjaKu.

## Teknologi
- JDK 21
- Java 21 dan Spring Boot 3.3.5
- Maven
- MySQL 8 atau kompatibel
- VS Code
- HTML, CSS, JavaScript
- Postman untuk pengujian REST API

## 1. Pengaturan database
Aplikasi memakai database `belanjaku`. Konfigurasi ada di `src/main/resources/application.properties`.

Nilai awal koneksi: username `root`, password kosong. Jika MySQL di komputer memiliki password, ubah `spring.datasource.password` atau atur environment variable `DB_PASSWORD`. Username juga dapat diatur melalui `DB_USERNAME`. Pastikan MySQL aktif dan berjalan pada port 3306.

Database dibuat otomatis oleh JDBC jika akun MySQL memiliki izin membuat database. Tabel dibuat/diperbarui oleh JPA (`ddl-auto=update`).

## 2. Membuka proyek di VS Code
1. Ekstrak folder proyek.
2. Buka VS Code, pilih File → Open Folder, lalu pilih folder BelanjaKu yang berisi pom.xml.
3. Pastikan JDK 21 sudah terpasang dengan menjalankan java -version di terminal.
4. Instal ekstensi Extension Pack for Java dan Spring Boot Extension Pack jika belum tersedia.
5. Buka terminal VS Code pada folder proyek.
6. Jalankan aplikasi menggunakan perintah berikut di Windows: .\mvnw.cmd spring-boot:run
7. Setelah aplikasi berhasil berjalan, buka http://localhost:8080 melalui browser. Untuk membangun file aplikasi, jalankan: .\mvnw.cmd clean package -DskipTests

> Catatan: ZIP sumber dari contoh tidak menyertakan Maven Wrapper (`mvnw.cmd`). Jika perintah `mvn` tidak dikenali, instal Maven atau pindahkan file proyek ini ke proyek Maven yang sudah memiliki Maven Wrapper.

## 3. Data kategori dan produk contoh
Saat aplikasi pertama kali dijalankan, `DataSeeder.java` otomatis membuat 4 kategori dan 12 produk contoh apabila tabel produk masih kosong. Daftar produk contoh mencakup Gaming, Fashion, Dapur & Rumah, serta PC & Laptop. Jika kategori sudah ada tetapi produk masih kosong, produk tetap akan dibuat.

## 4. Akun admin awal
- Email: admin@belanjaku.id
- Password: Diatur melalui environment variable ADMIN_INITIAL_PASSWORD.

Akun awal dibuat otomatis saat tabel pengguna masih kosong. Untuk proyek nyata, ganti password awal dan jangan gunakan kredensial contoh di server publik.

## 5. Fitur yang tersedia
### Halaman pelanggan
- Beranda dengan banner promosi
- Kategori dan katalog produk
- Pencarian dan pengurutan produk
- Detail produk
- Registrasi dan login
- Keranjang belanja
- Daftar favorit/wishlist
- Checkout dengan alamat dan pilihan metode bayar
- Riwayat pesanan
- Pembatalan dan pengajuan pengembalian sesuai status
- Mode gelap/terang

### API admin
- Tambah, ubah, dan hapus produk
- Mengubah status pesanan

**Catatan batasan versi contoh:** belum ada halaman dashboard admin grafis; fungsi admin saat ini diakses melalui REST API (misalnya Postman). Belum ada CRUD kategori melalui endpoint, dan pilihan metode pembayaran belum terhubung ke payment gateway; aplikasi hanya menyimpan pilihan metode. Gambar produk menggunakan URL `imageUrl`, atau ikon emoji sebagai cadangan.

## 6. Pengujian Postman
1. Buka Postman.
2. Pilih **Import**.
3. Masukkan file `postman/BelanjaKu.postman_collection.json`.
4. Pastikan collection variable `baseUrl` bernilai `http://localhost:8080`.
5. Jalankan request **Login ADMIN** untuk menyimpan token.
6. Jalankan request sesuai urutan: kategori/produk → keranjang & wishlist → checkout → riwayat pesanan.
7. Untuk request bertanda `[ADMIN]`, login sebagai admin terlebih dahulu.

Token dikirim melalui header `Authorization: Bearer {{token}}`.

## 7. Daftar endpoint utama
| Method | Endpoint | Fungsi |
|---|---|---|
| POST | `/api/auth/register` | Registrasi pengguna |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Profil pengguna |
| GET | `/api/categories` | Daftar kategori |
| GET | `/api/products` | Daftar, cari, filter, urut produk |
| GET | `/api/products/{id}` | Detail produk |
| POST/PUT/DELETE | `/api/products` | Kelola produk (ADMIN) |
| GET/POST | `/api/cart` | Lihat/tambah keranjang |
| PUT/DELETE | `/api/cart/{id}` | Ubah/hapus item keranjang |
| GET/POST | `/api/wishlist` | Lihat/toggle favorit |
| POST | `/api/orders` | Checkout |
| GET | `/api/orders` | Riwayat pesanan |
| GET | `/api/orders/{id}` | Detail pesanan |
| PUT | `/api/orders/{id}/batal` | Batalkan pesanan |
| PUT | `/api/orders/{id}/kembalikan` | Ajukan pengembalian |
| PUT | `/api/orders/{id}/status` | Ubah status (ADMIN) |

## 8. Struktur folder
```text
BelanjaKu/
├── pom.xml
├── README.md
├── postman/
│   └── BelanjaKu.postman_collection.json
└── src/main/
    ├── java/com/belanjaku/
    │   ├── BelanjakuApplication.java
    │   ├── model/
    │   ├── repo/
    │   └── web/
    └── resources/
        ├── application.properties
        └── static/
            ├── index.html
            ├── style.css
            └── app.js
```
