package com.example.be.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LeaderboardEntry {
    private Long userId;
    private String username;
    private Integer totalScore;
    private Integer gamesPlayed;
}
