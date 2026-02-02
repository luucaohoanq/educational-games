package com.example.be.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnore;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CommentResponse {
    private Long id;
    @JsonIgnore
    private Long gameId;
    private String username;
    private String content;
    private LocalDateTime datePosted;
    private Long parentCommentId;
}
