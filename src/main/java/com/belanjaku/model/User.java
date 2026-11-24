package com.belanjaku.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity @Table(name = "users")
public class User {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) public Long id;
    public String nama;
    @Column(unique = true) public String email;
    @JsonIgnore public String password;
    public String role = "USER";            // USER / ADMIN
    @JsonIgnore public String token;
}
