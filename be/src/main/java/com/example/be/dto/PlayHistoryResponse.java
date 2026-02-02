package com.example.be.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PlayHistoryResponse {
    private Long id;
    private Long gameId;
    private String gameTitle;
    private String gameThumbnail;
    private LocalDateTime playedAt;
    private Integer score;
    private Integer duration;
}
