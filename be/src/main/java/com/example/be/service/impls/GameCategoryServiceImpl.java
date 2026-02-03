package com.example.be.service.impls;

import com.example.be.dto.GameCategoryRequest;
import com.example.be.entity.GameCategory;
import com.example.be.repository.GameCategoryRepository;
import com.example.be.service.GameCategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class GameCategoryServiceImpl implements GameCategoryService {

    private final GameCategoryRepository gameCategoryRepository;

    @Override
    public List<GameCategory> findAll() {
        return gameCategoryRepository.findByIsActiveTrue();
    }

    @Override
    public GameCategory findById(Long id) {
        return gameCategoryRepository.findByIdAndIsActiveTrue(id)
            .orElseThrow(() -> new RuntimeException("Active category not found with id: " + id));
    }

    @Override
    public void create(GameCategoryRequest gameCategory) {

        if(gameCategoryRepository.existsByName(gameCategory.getName())) {
            throw new RuntimeException("Category with name '" + gameCategory.getName() + "' already exists");
        }

        if (gameCategoryRepository.findByNameAndIsActiveTrue(gameCategory.getName()).isPresent()) {
            throw new RuntimeException("Category with name '" + gameCategory.getName() + "' already exists");
        }

        var data = new GameCategory();
        data.setName(gameCategory.getName());
        data.setDescription(gameCategory.getDescription());
        data.setIcon(gameCategory.getIcon());
        gameCategoryRepository.save(data);
    }

    @Override
    public void update(Long id, GameCategoryRequest gameCategory) {
        GameCategory existing = findById(id);

        if (!existing.getName().equals(gameCategory.getName()) &&
            gameCategoryRepository.findByNameAndIsActiveTrue(gameCategory.getName()).isPresent()) {
            throw new RuntimeException("Category with name '" + gameCategory.getName() + "' already exists");
        }

        existing.setName(gameCategory.getName());
        existing.setDescription(gameCategory.getDescription());
        existing.setIcon(gameCategory.getIcon());
        gameCategoryRepository.save(existing);
    }

    @Override
    public void delete(Long id) {
        GameCategory category = findById(id);
        category.setIsActive(false);
        gameCategoryRepository.save(category);
    }
}
