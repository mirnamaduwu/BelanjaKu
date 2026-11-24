package com.belanjaku.model;

import jakarta.persistence.*;

@Entity
public class Category {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) public Long id;
    public String nama;
    @Column(unique = true) public String slug;
    public Category() {}
    public Category(String nama, String slug) { this.nama = nama; this.slug = slug; }
}
