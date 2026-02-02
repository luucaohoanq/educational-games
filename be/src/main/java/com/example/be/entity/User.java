package com.example.be.entity;

import com.example.be.enums.Role;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Data
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String username;
    
    @Column(nullable = false)
    @JsonIgnore
    private String password; // In production, use BCrypt hashing
    
    private String email;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role = Role.STUDENT; // Default role is STUDENT
    
    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
    
    private Integer totalScore = 0;
    private Integer gamesPlayed = 0;
    
    // Relationships
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<PlayHistory> playHistories;
    
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Comment> comments;
    
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<GameLike> gameLikes;
}
