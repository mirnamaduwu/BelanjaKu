package com.belanjaku.web;

import com.belanjaku.model.*;
import com.belanjaku.repo.*;
import java.util.*;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController @RequestMapping("/api/orders")
public class OrderController {
    private final OrderRepo orders; private final CartRepo cart; private final ProductRepo products; private final Auth auth;
    public OrderController(OrderRepo o, CartRepo c, ProductRepo p, Auth a) { orders = o; cart = c; products = p; auth = a; }

    @GetMapping
    public List<Order> mine(@RequestHeader(value = "Authorization", required = false) String h) {
        return orders.findByUserIdOrderByIdDesc(auth.user(h).id);
    }

    @GetMapping("/{id}")
    public Order one(@RequestHeader(value = "Authorization", required = false) String h, @PathVariable Long id) {
        User u = auth.user(h);
        return orders.findById(id).filter(o -> o.userId.equals(u.id) || "ADMIN".equals(u.role))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Pesanan tidak ditemukan"));
    }

    /** Checkout: ubah isi keranjang menjadi pesanan, kurangi stok, kosongkan keranjang. */
    @PostMapping @Transactional
    public Order checkout(@RequestHeader(value = "Authorization", required = false) String h, @RequestBody Map<String, String> b) {
        User u = auth.user(h);
        if (b == null) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Data checkout wajib diisi");

        String namaPenerima = required(b, "namaPenerima", "Nama penerima wajib diisi");
        String nomorHp = required(b, "nomorHp", "Nomor HP/WhatsApp wajib diisi");
        if (!nomorHp.matches("(?=.*\\d)[0-9+()\\s-]{8,24}"))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Nomor HP/WhatsApp tidak valid");
        String kotaTujuan = required(b, "kotaTujuan", "Kota tujuan wajib diisi");
        String alamatLengkap = required(b, "alamatLengkap", "Alamat lengkap wajib diisi");
        if (namaPenerima.length() > 120 || kotaTujuan.length() > 120 || alamatLengkap.length() > 1000)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Data alamat melebihi batas panjang");
        ShippingChoice pengiriman = shippingChoice(required(b, "jasaPengiriman", "Jasa pengiriman wajib dipilih"));
        String metodeBayar = paymentMethod(required(b, "metodeBayar", "Metode pembayaran wajib dipilih"));

        List<CartItem> items = cart.findByUserIdForUpdate(u.id);
        if (items.isEmpty()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Keranjang masih kosong");

        Order o = new Order();
        o.userId = u.id;
        o.namaPenerima = namaPenerima;
        o.nomorHp = nomorHp;
        o.kotaTujuan = kotaTujuan;
        o.alamatLengkap = alamatLengkap;
        o.alamat = alamatLengkap;
        o.jasaPengiriman = pengiriman.nama();
        o.estimasiPengiriman = pengiriman.estimasi();
        o.metodeBayar = metodeBayar;
        o.statusPembayaran = "COD".equals(metodeBayar) ? "BELUM_DIBAYAR" : "MENUNGGU_PEMBAYARAN";
        boolean semuaGratis = true;
        items.sort(Comparator.comparing(ci -> ci.produk.id));
        for (CartItem ci : items) {
            Product p = products.findByIdForUpdate(ci.produk.id)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Produk di keranjang tidak ditemukan"));
            if (ci.qty <= 0) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Jumlah produk di keranjang tidak valid");
            if (ci.qty > p.stok) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Stok '" + p.nama + "' tidak cukup");
            p.stok -= ci.qty; products.save(p);
            OrderItem oi = new OrderItem();
            oi.productId = p.id;
            oi.namaProduk = p.nama;
            oi.harga = p.harga;
            oi.hargaAsli = Math.max(p.harga, p.hargaAsli);
            oi.imageUrl = p.imageUrl;
            oi.qty = ci.qty;
            o.items.add(oi);
            o.subtotal += p.harga * ci.qty;
            o.diskon += Math.max(0, oi.hargaAsli - p.harga) * ci.qty;
            if (!p.gratisOngkir) semuaGratis = false;
        }
        o.ongkir = semuaGratis ? 0 : 15000;
        o.total = o.subtotal + o.ongkir;
        orders.save(o);
        cart.deleteAll(items);
        return o;
    }

    private String required(Map<String, String> body, String field, String message) {
        String value = body.get(field);
        value = value == null ? "" : value.trim();
        if (value.isEmpty()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
        return value;
    }

    private ShippingChoice shippingChoice(String value) {
        return switch (value) {
            case "JNE_REGULER" -> new ShippingChoice("JNE Reguler", "2-3 hari");
            case "JNT_EXPRESS" -> new ShippingChoice("J&T Express", "1-2 hari");
            case "SICEPAT_BEST" -> new ShippingChoice("SiCepat BEST", "1-2 hari");
            default -> throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Jasa pengiriman tidak tersedia");
        };
    }

    private String paymentMethod(String value) {
        return switch (value) {
            case "VA_BCA" -> "Virtual Account BCA";
            case "VA_MANDIRI" -> "Virtual Account Mandiri";
            case "VA_BNI" -> "Virtual Account BNI";
            case "VA_BRI" -> "Virtual Account BRI";
            case "QRIS" -> "QRIS";
            case "GOPAY" -> "GoPay";
            case "OVO" -> "OVO";
            case "DANA" -> "DANA";
            case "SHOPEEPAY" -> "ShopeePay";
            case "COD" -> "COD";
            default -> throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Metode pembayaran tidak tersedia");
        };
    }

    private record ShippingChoice(String nama, String estimasi) {}

    /** Pembeli boleh membatalkan saat DIKEMAS, atau mengajukan pengembalian saat SELESAI. */
    @PutMapping("/{id}/batal")
    @Transactional
    public Order batal(@RequestHeader(value = "Authorization", required = false) String h, @PathVariable Long id) {
        Order o = one(h, id);
        if (!"DIKEMAS".equals(o.status)) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Pesanan tidak bisa dibatalkan");
        for (OrderItem oi : o.items) products.findById(oi.productId).ifPresent(p -> { p.stok += oi.qty; products.save(p); });
        o.status = "DIBATALKAN";
        return orders.save(o);
    }

    @PutMapping("/{id}/kembalikan")
    public Order kembalikan(@RequestHeader(value = "Authorization", required = false) String h, @PathVariable Long id) {
        Order o = one(h, id);
        if (!"SELESAI".equals(o.status)) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Hanya pesanan selesai yang bisa dikembalikan");
        o.status = "DIKEMBALIKAN";
        return orders.save(o);
    }

    /** Admin: ubah status (DIKEMAS, DIKIRIM, SELESAI, ...). */
    @PutMapping("/{id}/status")
    public Order status(@RequestHeader(value = "Authorization", required = false) String h, @PathVariable Long id, @RequestParam String status) {
        auth.admin(h);
        Order o = orders.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Pesanan tidak ditemukan"));
        o.status = status.toUpperCase();
        return orders.save(o);
    }
}
