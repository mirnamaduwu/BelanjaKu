package com.belanjaku.model;

import jakarta.persistence.*;

@Entity
public class CartItem {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) public Long id;
    public Long userId;
    @ManyToOne(fetch = FetchType.EAGER) public Product produk;
    public int qty;
}
