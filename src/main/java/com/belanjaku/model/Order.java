package com.belanjaku.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity @Table(name = "orders")
public class Order {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) public Long id;
    public Long userId;
    public LocalDateTime tanggal = LocalDateTime.now();
    public String status = "DIKEMAS";       // DIKEMAS, DIKIRIM, SELESAI, DIBATALKAN, DIKEMBALIKAN
    public String alamat;
    @Column(length = 120) public String namaPenerima;
    @Column(length = 24) public String nomorHp;
    @Column(length = 120) public String kotaTujuan;
    @Column(length = 1000) public String alamatLengkap;
    @Column(length = 40) public String jasaPengiriman;
    @Column(length = 40) public String estimasiPengiriman;
    public String metodeBayar;
    @Column(length = 40) public String statusPembayaran;
    public long subtotal;
    public long diskon;
    public long ongkir;
    public long total;
    @OneToMany(cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    @JoinColumn(name = "order_id")
    public List<OrderItem> items = new ArrayList<>();
}
