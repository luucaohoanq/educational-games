package com.example.be.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class Game {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String title;
    private String description;
    private String minioObjectName; // Tên file trên MinIO
    
    // Helper để trả về URL full cho Frontend
    @Transient
    public String getPlayUrl() {
        return "http://localhost:9000/scratch-games/" + this.minioObjectName;
    }
}
