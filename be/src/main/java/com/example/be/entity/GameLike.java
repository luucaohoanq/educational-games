package com.example.be.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
@Table(uniqueConstraints = @UniqueConstraint(columnNames = {"game_id", "user_id"}))
public class GameLike {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "game_id", nullable = false)
    @JsonIgnore
    private Game game;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;
    
    private LocalDateTime likedAt;
    
    @PrePersist
    protected void onCreate() {
        likedAt = LocalDateTime.now();
    }
}
