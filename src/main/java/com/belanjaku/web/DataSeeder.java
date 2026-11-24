
package com.belanjaku.web;

import java.util.HashMap;
import java.util.Map;

import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

import com.belanjaku.model.Category;
import com.belanjaku.model.Product;
import com.belanjaku.model.User;
import com.belanjaku.repo.CategoryRepo;
import com.belanjaku.repo.ProductRepo;
import com.belanjaku.repo.UserRepo;

@Component
public class DataSeeder implements CommandLineRunner {

    private final CategoryRepo cats;
    private final ProductRepo prods;
    private final UserRepo users;

    public DataSeeder(CategoryRepo c, ProductRepo p, UserRepo u) {
        cats = c;
        prods = p;
        users = u;
    }

    @Override
    public void run(String... args) {

        // 1. Membuat akun admin awal
        if (users.count() == 0) {
            
User admin = new User();
admin.nama = "Admin";
admin.email = "admin@belanjaku.id";

String initialPassword = System.getenv("ADMIN_INITIAL_PASSWORD");

if (initialPassword == null || initialPassword.isBlank()) {
    throw new IllegalStateException(
        "ADMIN_INITIAL_PASSWORD belum dikonfigurasi!"
    );
}

admin.password =
    new BCryptPasswordEncoder().encode(initialPassword);

admin.role = "ADMIN";

users.save(admin);

        }

        // 2. Mengambil kategori yang sudah tersedia
        Map<String, Category> kategori = new HashMap<>();

        for (Category c : cats.findAll()) {
            if (c.slug != null) {
                kategori.put(c.slug, c);
            }
        }

        // 3. Membuat kategori jika belum tersedia
        Category gaming =
            getOrCreateCategory(kategori, "Gaming", "gaming");

        Category fashion =
            getOrCreateCategory(kategori, "Fashion", "fashion");

        Category rumah =
            getOrCreateCategory(kategori, "Dapur & Rumah", "rumah");

        Category pc =
            getOrCreateCategory(kategori, "PC & Laptop", "pc");

        // 4. Memasukkan produk jika tabel produk masih kosong
        if (prods.count() == 0) {

            // KATEGORI GAMING
            add("Headset Gaming Pro Surround 7.1 RGB LED",
                gaming, 349000, 499000, 34, 4.9, 1284, false, "🎧");

            add("Keyboard Mekanikal Wireless 75% Hot-Swappable",
                gaming, 685000, 850000, 19, 4.8, 842, true, "⌨️");

            add("Mouse Gaming Ultralight Wireless 26000 DPI",
                gaming, 425000, 550000, 27, 4.9, 815, false, "🖱️");

            add("Kursi Gaming Ergonomis Kulit Sintetis Premium",
                gaming, 1890000, 2450000, 8, 4.7, 219, true, "💺");


            // KATEGORI FASHION
            add("Celana Jeans Slim Fit Premium Denim",
                fashion, 189000, 259000, 60, 4.6, 530, true, "👖");

            add("Atasan Wanita Floral Katun Lengan Pendek",
                fashion, 99000, 149000, 80, 4.5, 301, false, "👚");

            add("Sepatu Kasual Pria Kulit Sneakers",
                fashion, 275000, 399000, 25, 4.7, 412, true, "👟");

            add("Tas Selempang Wanita Merah Elegan",
                fashion, 215000, 320000, 15, 4.8, 190, false, "👜");


            // KATEGORI DAPUR DAN RUMAH
            add("Set Peralatan Makan Keramik 12 Pcs",
                rumah, 289000, 380000, 40, 4.8, 276, true, "🍽️");

            add("Lampu Meja LED Minimalis Dimmable",
                rumah, 129000, 175000, 55, 4.6, 233, false, "💡");

            add("Panci Anti Lengket Set 5 Pcs",
                rumah, 399000, 520000, 22, 4.7, 178, true, "🍳");


            // KATEGORI PC DAN LAPTOP
            add("PC Rakitan RGB & Laptop Kreator Ryzen 7",
                pc, 12900000, 15500000, 4, 4.9, 64, true, "🖥️");
        }
    }

    // Membuat kategori baru jika belum ada
    private Category getOrCreateCategory(
        Map<String, Category> kategori,
        String nama,
        String slug
    ) {
        Category existing = kategori.get(slug);

        if (existing != null) {
            return existing;
        }

        Category baru = cats.save(new Category(nama, slug));
        kategori.put(slug, baru);

        return baru;
    }

    // Menambahkan produk ke database
    private void add(
        String nama,
        Category kategori,
        long harga,
        long hargaAsli,
        int stok,
        double rating,
        int ulasan,
        boolean gratisOngkir,
        String ikon
    ) {

        Product p = new Product();

        p.nama = nama;
        p.kategori = kategori;
        p.harga = harga;
        p.hargaAsli = hargaAsli;
        p.stok = stok;
        p.rating = rating;
        p.ulasan = ulasan;
        p.gratisOngkir = gratisOngkir;
        p.ikon = ikon;

        p.deskripsi = "Produk original bergaransi resmi. "
            + nama
            + " — kualitas terbaik dengan harga hemat.";

        prods.save(p);
    }
}
