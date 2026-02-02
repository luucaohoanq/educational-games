package com.example.be.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class StudentProfileResponse {
    private Long userId;
    private String username;
    private String email;
    private LocalDateTime createdAt;
    private Integer totalScore;
    private Integer gamesPlayed;
}
