package com.example.be.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class GamePreviewResponse {

    private Long id;
    private String title;
    private String description;
    private String thumbnailUrl;

}
