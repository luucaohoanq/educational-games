package com.example.be.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.util.List;
import lombok.Data;

@Entity
@Data
public class GameCategory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String name;
    
    private String description;
    
    private String icon; // Emoji or icon class

    @Column(nullable = false)
    @JsonIgnore
    private Boolean isActive = true;

    @OneToMany(mappedBy = "category", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Game> games;
}
