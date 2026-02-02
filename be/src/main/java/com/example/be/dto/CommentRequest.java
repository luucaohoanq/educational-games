package com.example.be.dto;

import lombok.Data;

@Data
public class CommentRequest {
    private Long gameId;
    private String username;
    private String content;
    private Long parentCommentId; // null for top-level comments
}
