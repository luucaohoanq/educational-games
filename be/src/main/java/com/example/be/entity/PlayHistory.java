package com.example.be.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
public class PlayHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private Long gameId;
    private String userId;
    private LocalDateTime playedAt;
    private Integer score = 0; // Score for leaderboard
    private Integer duration = 0; // Play duration in seconds
}
