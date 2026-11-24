package com.belanjaku.model;

import jakarta.persistence.*;

@Entity
public class Product {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) public Long id;
    public String nama;
    @Column(length = 1000) public String deskripsi;
    public long harga;
    public long hargaAsli;
    public int stok;
    public double rating;
    public int ulasan;
    public boolean gratisOngkir;
    public String imageUrl;
    public String ikon;                     // emoji cadangan bila imageUrl kosong
    @ManyToOne(fetch = FetchType.EAGER) public Category kategori;
}
