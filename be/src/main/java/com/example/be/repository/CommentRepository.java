package com.example.be.repository;

import com.example.be.entity.Comment;
import com.example.be.entity.Game;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByGameOrderByDatePostedDesc(Game game);
    List<Comment> findByGameIdOrderByDatePostedDesc(Long gameId);
}
