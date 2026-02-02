package com.example.be.repository;

import com.example.be.entity.PlayHistory;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PlayHistoryRepository extends JpaRepository<PlayHistory, Long> {
    List<PlayHistory> findByUserIdOrderByPlayedAtDesc(Long userId);
    Page<PlayHistory> findByUserId(Long userId, Pageable pageable);
}
