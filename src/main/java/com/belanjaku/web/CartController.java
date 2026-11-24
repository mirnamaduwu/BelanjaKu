package com.belanjaku.web;

import com.belanjaku.model.*;
import com.belanjaku.repo.*;
import java.util.*;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController @RequestMapping("/api")
public class CartController {
    private final CartRepo cart; private final WishlistRepo wish; private final ProductRepo products; private final Auth auth;
    public CartController(CartRepo c, WishlistRepo w, ProductRepo p, Auth a) { cart = c; wish = w; products = p; auth = a; }

    // ---------- KERANJANG ----------
    @GetMapping("/cart")
    public List<CartItem> cart(@RequestHeader(value = "Authorization", required = false) String h) {
        return cart.findByUserId(auth.user(h).id);
    }

    @PostMapping("/cart")
    public List<CartItem> add(@RequestHeader(value = "Authorization", required = false) String h, @RequestBody Map<String, Integer> b) {
        User u = auth.user(h);
        Product p = products.findById(b.get("productId").longValue())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Produk tidak ditemukan"));
        int qty = Math.max(1, b.getOrDefault("qty", 1));
        CartItem ci = cart.findByUserIdAndProdukId(u.id, p.id).orElseGet(() -> {
            CartItem n = new CartItem(); n.userId = u.id; n.produk = p; n.qty = 0; return n; });
        ci.qty += qty;
        if (ci.qty > p.stok) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Stok tidak mencukupi (sisa " + p.stok + ")");
        cart.save(ci);
        return cart.findByUserId(u.id);
    }

    @PutMapping("/cart/{id}")
    public List<CartItem> setQty(@RequestHeader(value = "Authorization", required = false) String h, @PathVariable Long id, @RequestParam int qty) {
        User u = auth.user(h);
        CartItem ci = cart.findById(id).filter(x -> x.userId.equals(u.id))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Item tidak ada"));
        if (qty <= 0) cart.delete(ci);
        else if (qty > ci.produk.stok) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Stok tidak mencukupi");
        else { ci.qty = qty; cart.save(ci); }
        return cart.findByUserId(u.id);
    }

    @DeleteMapping("/cart/{id}")
    public List<CartItem> remove(@RequestHeader(value = "Authorization", required = false) String h, @PathVariable Long id) {
        return setQty(h, id, 0);
    }

    // ---------- DAFTAR KEINGINAN ----------
    @GetMapping("/wishlist")
    public List<WishlistItem> wishlist(@RequestHeader(value = "Authorization", required = false) String h) {
        return wish.findByUserId(auth.user(h).id);
    }

    /** Toggle: jika sudah ada dihapus, jika belum ditambahkan. */
    @PostMapping("/wishlist/{productId}")
    public List<WishlistItem> toggle(@RequestHeader(value = "Authorization", required = false) String h, @PathVariable Long productId) {
        User u = auth.user(h);
        var ex = wish.findByUserIdAndProdukId(u.id, productId);
        if (ex.isPresent()) wish.delete(ex.get());
        else {
            WishlistItem w = new WishlistItem(); w.userId = u.id;
            w.produk = products.findById(productId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Produk tidak ditemukan"));
            wish.save(w);
        }
        return wish.findByUserId(u.id);
    }
}
