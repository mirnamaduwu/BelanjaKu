package com.belanjaku.web;

import com.belanjaku.model.*;
import com.belanjaku.repo.*;
import java.util.*;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController @RequestMapping("/api")
public class ProductController {
    private final ProductRepo products; private final CategoryRepo cats; private final Auth auth;
    public ProductController(ProductRepo p, CategoryRepo c, Auth a) { products = p; cats = c; auth = a; }

    @GetMapping("/categories")
    public List<Category> categories() { return cats.findAll(); }

    /** sort: relevan | termurah | termahal | rating | diskon */
    @GetMapping("/products")
    public List<Product> list(@RequestParam(required = false) String kategori,
                              @RequestParam(required = false) String q,
                              @RequestParam(defaultValue = "relevan") String sort) {
        var s = products.findAll().stream()
            .filter(p -> kategori == null || kategori.isBlank() || kategori.equals("semua")
                         || (p.kategori != null && kategori.equals(p.kategori.slug)))
            .filter(p -> q == null || q.isBlank() || p.nama.toLowerCase().contains(q.toLowerCase()));
        Comparator<Product> c = switch (sort) {
            case "termurah" -> Comparator.comparingLong(p -> p.harga);
            case "termahal" -> Comparator.comparingLong((Product p) -> p.harga).reversed();
            case "rating"   -> Comparator.comparingDouble((Product p) -> p.rating).reversed();
            case "diskon"   -> Comparator.comparingDouble((Product p) -> p.hargaAsli == 0 ? 0 : 1 - (double) p.harga / p.hargaAsli).reversed();
            default         -> Comparator.comparingLong((Product p) -> p.id);
        };
        return s.sorted(c).toList();
    }

    @GetMapping("/products/{id}")
    public Product detail(@PathVariable Long id) {
        return products.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Produk tidak ditemukan"));
    }

    // ---- Khusus ADMIN ----
    @PostMapping("/products")
    public Product create(@RequestHeader(value = "Authorization", required = false) String h, @RequestBody Product p) {
        auth.admin(h); p.id = null; return products.save(fix(p));
    }

    @PutMapping("/products/{id}")
    public Product update(@RequestHeader(value = "Authorization", required = false) String h, @PathVariable Long id, @RequestBody Product p) {
        auth.admin(h); detail(id); p.id = id; return products.save(fix(p));
    }

    @DeleteMapping("/products/{id}")
    public Map<String, String> delete(@RequestHeader(value = "Authorization", required = false) String h, @PathVariable Long id) {
        auth.admin(h); products.deleteById(id); return Map.of("pesan", "Produk dihapus");
    }

    private Product fix(Product p) {
        if (p.kategori != null && p.kategori.id != null) p.kategori = cats.findById(p.kategori.id).orElse(null);
        if (p.hargaAsli < p.harga) p.hargaAsli = p.harga;
        return p;
    }
}
