package com.example.be.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
public class Comment {
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
    
    @Column(columnDefinition = "TEXT")
    private String content;
    
    private LocalDateTime datePosted;
    
    // For reply functionality
    private Long parentCommentId; // null if it's a top-level comment
    
    @PrePersist
    protected void onCreate() {
        datePosted = LocalDateTime.now();
    }
}
