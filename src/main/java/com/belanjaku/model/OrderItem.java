package com.belanjaku.model;

import jakarta.persistence.*;

@Entity
public class OrderItem {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) public Long id;
    public Long productId;
    public String namaProduk;
    public long harga;
    public long hargaAsli;
    @Column(length = 1000) public String imageUrl;
    public int qty;
}
