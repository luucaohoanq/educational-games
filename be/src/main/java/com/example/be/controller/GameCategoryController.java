package com.example.be.controller;

import com.example.be.dto.GameCategoryRequest;
import com.example.be.entity.GameCategory;
import com.example.be.service.impls.GameCategoryServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/games-categories")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class GameCategoryController {

    private final GameCategoryServiceImpl gameCategoryServiceImpl;

    // 1. GET all categories
    @GetMapping
    public ResponseEntity<List<GameCategory>> getAllCategories() {
        List<GameCategory> categories = gameCategoryServiceImpl.findAll();
        return ResponseEntity.ok(categories);
    }

    // 2. GET category by ID
    @GetMapping("/{id}")
    public ResponseEntity<GameCategory> getCategoryById(@PathVariable Long id) {
        GameCategory category = gameCategoryServiceImpl.findById(id);
        return ResponseEntity.ok(category);
    }

    // 3. CREATE new category
    @PostMapping
    public ResponseEntity<String> createCategory(@RequestBody GameCategoryRequest gameCategory) {
        gameCategoryServiceImpl.create(gameCategory);
        return ResponseEntity.status(HttpStatus.CREATED).body("Create category successfully");
    }

    // 4. UPDATE existing category
    @PutMapping("/{id}")
    public ResponseEntity<String> updateCategory(
            @PathVariable Long id,
            @RequestBody GameCategoryRequest gameCategory) {
        gameCategoryServiceImpl.update(id, gameCategory);
        return ResponseEntity.ok().body("Update category successfully");
    }

    // 5. DELETE category
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        gameCategoryServiceImpl.delete(id);
        return ResponseEntity.noContent().build();
    }
}
