package com.example.be.controller;

import com.example.be.dto.GameCategoryResponse;
import com.example.be.dto.GamePreviewResponse;
import com.example.be.repository.GameCategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/game-center")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // Allow CORS for frontend
public class GameCenterController {

    private final GameCategoryRepository gameCategoryRepository;

    @GetMapping("/game-categories")
    public ResponseEntity<?> getGameCategories() {
        var data = gameCategoryRepository.findAllWithGames().stream().map(
            c -> new GameCategoryResponse.CategoryWithGame(
                c.getId(),
                c.getName(),
                c.getIcon(),
                c.getDescription(),
                c.getGames().stream().map(
                    g -> new GamePreviewResponse(
                        g.getId(),
                        g.getTitle(),
                        g.getDescription(),
                        g.getThumbnailFullUrl()
                )).toList()
            )
        ).toList();
        return ResponseEntity.ok(data);
    }


}
