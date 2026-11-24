package com.belanjaku.web;

import com.belanjaku.model.User;
import com.belanjaku.repo.UserRepo;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

/** Membaca header "Authorization: Bearer <token>" dan mencari pengguna. */
@Component
public class Auth {
    private final UserRepo users;
    public Auth(UserRepo users) { this.users = users; }

    public User user(String header) {
        if (header == null || !header.startsWith("Bearer "))
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Silakan login terlebih dahulu");
        return users.findByToken(header.substring(7))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Token tidak valid"));
    }

    public User admin(String header) {
        User u = user(header);
        if (!"ADMIN".equals(u.role)) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Khusus admin");
        return u;
    }
}
