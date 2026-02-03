package com.example.be.service;

import com.example.be.dto.GameCategoryRequest;
import com.example.be.entity.GameCategory;
import java.util.List;

public interface GameCategoryService {

    List<GameCategory> findAll();

    GameCategory findById(Long id);

    void create(GameCategoryRequest gameCategory);

    void update(Long id, GameCategoryRequest gameCategory);

    void delete(Long id);

}
