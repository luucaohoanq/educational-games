package com.example.be.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Data
public class Game {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String title;
    private String description;
    private String minioObjectName; // Tên file trên MinIO
    
    @Column(columnDefinition = "TEXT")
    private String instructions; // How to play instructions
    
    private String thumbnailUrl; // Thumbnail image URL or MinIO path

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "category_id")
    @JsonIgnore
    private GameCategory category;
    
    private String createdBy; // Username of creator
    
    private LocalDateTime dateAdded;
    
    @Column(columnDefinition = "INTEGER DEFAULT 0")
    private Integer likes = 0;
    
    @Column(columnDefinition = "INTEGER DEFAULT 0")
    private Integer views = 0;
    
    // Relationships
    @OneToMany(mappedBy = "game", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<PlayHistory> playHistories;
    
    @OneToMany(mappedBy = "game", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Comment> comments;
    
    @OneToMany(mappedBy = "game", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<GameLike> gameLikes;
    
    @PrePersist
    protected void onCreate() {
        dateAdded = LocalDateTime.now();
    }
    
    // Helper để trả về URL full cho Frontend
    @Transient
    public String getPlayUrl() {
        return "http://localhost:9000/scratch-games/" + this.minioObjectName;
    }
    
    // Helper to get thumbnail URL
    @Transient
    public String getThumbnailFullUrl() {
        if (thumbnailUrl == null) return null;
        // If it's already a full URL, return as is
        if (thumbnailUrl.startsWith("http")) return thumbnailUrl;
        // If it's a MinIO path, construct full URL
        return "http://localhost:9000/scratch-games/" + thumbnailUrl;
    }
    
    // Helper to get categoryId from relationship
    @Transient
    public Long getCategoryId() {
        return category != null ? category.getId() : null;
    }
}
