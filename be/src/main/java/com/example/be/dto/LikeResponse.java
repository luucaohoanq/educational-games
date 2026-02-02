package com.example.be.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LikeResponse {
    private boolean success;
    private String message;
    private int totalLikes;
    private boolean isLiked;
}
