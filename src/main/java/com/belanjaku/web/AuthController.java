package com.belanjaku.web;

import com.belanjaku.model.User;
import com.belanjaku.repo.UserRepo;
import java.util.Map;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController @RequestMapping("/api/auth")
public class AuthController {
    private final UserRepo users; private final Auth auth;
    private final BCryptPasswordEncoder enc = new BCryptPasswordEncoder();
    public AuthController(UserRepo users, Auth auth) { this.users = users; this.auth = auth; }

    @PostMapping("/register")
    public Map<String, Object> register(@RequestBody Map<String, String> b) {
        String email = b.getOrDefault("email", "").trim().toLowerCase();
        String pass = b.getOrDefault("password", "");
        if (email.isEmpty() || pass.length() < 6)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email wajib diisi & password minimal 6 karakter");
        if (users.findByEmail(email).isPresent())
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email sudah terdaftar");
        User u = new User();
        u.nama = b.getOrDefault("nama", email); u.email = email; u.password = enc.encode(pass);
        u.token = UUID.randomUUID().toString();
        users.save(u);
        return Map.of("token", u.token, "user", u);
    }

    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody Map<String, String> b) {
        User u = users.findByEmail(b.getOrDefault("email", "").trim().toLowerCase())
                .filter(x -> enc.matches(b.getOrDefault("password", ""), x.password))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Email atau password salah"));
        u.token = UUID.randomUUID().toString();
        users.save(u);
        return Map.of("token", u.token, "user", u);
    }

    @GetMapping("/me")
    public User me(@RequestHeader(value = "Authorization", required = false) String h) { return auth.user(h); }
}
