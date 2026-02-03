package com.example.be.dto;

import jakarta.persistence.Column;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Data;

@AllArgsConstructor
@Data
public class GameCategoryRequest {

    private String name;
    private String description;
    private String icon;

}
