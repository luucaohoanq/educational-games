package com.example.be.dto;

import com.example.be.entity.Game;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;


public class GameCategoryResponse {

    @Data
    @AllArgsConstructor
    public static class CategorySimple {
        private Long id;
        private String name;
        private String icon;
        private String description;
    }

    @Data
    @AllArgsConstructor
    public static class CategoryWithGame {
        private Long id;
        private String name;
        private String icon;
        private String description;
        private List<GamePreviewResponse> games;
    }
}
