package com.example.be.controller;

import com.example.be.dto.AuthResponse;
import com.example.be.dto.LeaderboardEntry;
import com.example.be.dto.LoginRequest;
import com.example.be.dto.RegisterRequest;
import com.example.be.entity.User;
import com.example.be.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AuthController {

    private final UserRepository userRepository;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        // Check if username exists
        if (userRepository.existsByUsername(request.getUsername())) {
            return ResponseEntity.badRequest().body("Username already exists");
        }

        // Create new user (in production, hash the password with BCrypt)
        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(request.getPassword()); // TODO: Hash password
        user.setEmail(request.getEmail());
        
        User saved = userRepository.save(user);
        
        return ResponseEntity.ok(new AuthResponse(
            saved.getId(),
            saved.getUsername(),
            "Registration successful",
            saved.getRole()
        ));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
            .orElse(null);
        
        if (user == null || !user.getPassword().equals(request.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body("Invalid username or password");
        }
        
        return ResponseEntity.ok(new AuthResponse(
            user.getId(),
            user.getUsername(),
            "Login successful",
            user.getRole()
        ));
    }

    @GetMapping("/leaderboard")
    public List<LeaderboardEntry> getLeaderboard() {
        return userRepository.findAll().stream()
            .sorted((a, b) -> b.getTotalScore().compareTo(a.getTotalScore()))
            .limit(10)
            .map(u -> new LeaderboardEntry(
                u.getId(),
                u.getUsername(),
                u.getTotalScore(),
                u.getGamesPlayed()
            ))
            .collect(Collectors.toList());
    }

    @GetMapping("/user/{username}")
    public ResponseEntity<User> getUserProfile(@PathVariable String username) {
        return userRepository.findByUsername(username)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
}
