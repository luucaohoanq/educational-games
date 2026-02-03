package com.example.be.controller;

import com.example.be.dto.PlayHistoryResponse;
import com.example.be.dto.StudentProfileResponse;
import com.example.be.entity.PlayHistory;
import com.example.be.entity.User;
import com.example.be.enums.Role;
import com.example.be.repository.PlayHistoryRepository;
import com.example.be.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/students")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class StudentProfileController {

    private final UserRepository userRepository;
    private final PlayHistoryRepository playHistoryRepository;

    @GetMapping("/{userId}/profile")
    public ResponseEntity<?> getStudentProfile(@PathVariable Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        StudentProfileResponse profile = new StudentProfileResponse(
            user.getId(),
            user.getUsername(),
            user.getEmail(),
            user.getCreatedAt(),
            user.getTotalScore(),
            user.getGamesPlayed()
        );

        return ResponseEntity.ok(profile);
    }

    @GetMapping("/{userId}/play-history")
    public ResponseEntity<?> getStudentPlayHistory(
        @PathVariable Long userId,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size,
        @RequestParam(defaultValue = "playedAt") String sortBy,
        @RequestParam(defaultValue = "DESC") String sortDirection
    ) {
        Sort.Direction direction = sortDirection.equalsIgnoreCase("ASC") 
            ? Sort.Direction.ASC 
            : Sort.Direction.DESC;
        
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
        Page<PlayHistory> historyPage = playHistoryRepository.findByUserId(userId, pageable);

        Page<PlayHistoryResponse> responsePage = historyPage.map(history -> 
            new PlayHistoryResponse(
                history.getId(),
                history.getGame().getId(),
                history.getGame().getTitle(),
                history.getGame().getThumbnailFullUrl(),
                history.getPlayedAt(),
                history.getScore(),
                history.getDuration()
            )
        );

        Map<String, Object> response = new HashMap<>();
        response.put("content", responsePage.getContent());
        response.put("currentPage", responsePage.getNumber());
        response.put("totalItems", responsePage.getTotalElements());
        response.put("totalPages", responsePage.getTotalPages());

        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<?> getAllStudents(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "totalScore"));
        Page<User> usersPage = userRepository.findAllByRole(Role.STUDENT ,pageable);

        Page<StudentProfileResponse> responsePage = usersPage.map(user ->
            new StudentProfileResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getCreatedAt(),
                user.getTotalScore(),
                user.getGamesPlayed()
            )
        );

        Map<String, Object> response = new HashMap<>();
        response.put("content", responsePage.getContent());
        response.put("currentPage", responsePage.getNumber());
        response.put("totalItems", responsePage.getTotalElements());
        response.put("totalPages", responsePage.getTotalPages());

        return ResponseEntity.ok(response);
    }
}
