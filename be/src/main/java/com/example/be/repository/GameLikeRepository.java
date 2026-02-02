package com.example.be.repository;

import com.example.be.entity.Game;
import com.example.be.entity.GameLike;
import com.example.be.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface GameLikeRepository extends JpaRepository<GameLike, Long> {
    boolean existsByGameAndUser(Game game, User user);
    Optional<GameLike> findByGameAndUser(Game game, User user);
}
