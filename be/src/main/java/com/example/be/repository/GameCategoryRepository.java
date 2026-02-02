package com.example.be.repository;

import com.example.be.entity.GameCategory;
import java.util.List;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import org.springframework.data.jpa.repository.Query;

public interface GameCategoryRepository extends JpaRepository<GameCategory, Long> {
    Optional<GameCategory> findByName(String name);

    @Query("""
        select distinct c
        from GameCategory c
        left join fetch c.games
    """)
    List<GameCategory> findAllWithGames();
}
