package com.example.be.controller;

import com.example.be.entity.Game;
import com.example.be.entity.PlayHistory;
import com.example.be.entity.User;
import com.example.be.repository.GameRepository;
import com.example.be.repository.PlayHistoryRepository;
import com.example.be.repository.UserRepository;
import io.minio.*;
import jakarta.annotation.PostConstruct;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/games")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // Allow CORS for frontend
public class GameController {

    private final MinioClient minioClient;
    private final GameRepository gameRepository;
    private final PlayHistoryRepository playHistoryRepository;
    private final UserRepository userRepository;

    @Value("${minio.bucket-name}")
    private String bucketName;

    // Tự động tạo bucket nếu chưa có
    @PostConstruct
    public void init() {
        try {
            boolean found = minioClient.bucketExists(BucketExistsArgs.builder().bucket(bucketName).build());
            if (!found) {
                minioClient.makeBucket(MakeBucketArgs.builder().bucket(bucketName).build());
                // Set Policy public để browser đọc được file html
                String policy = "{\"Version\":\"2012-10-17\",\"Statement\":[{\"Effect\":\"Allow\",\"Principal\":{\"AWS\":[\"*\"]},\"Action\":[\"s3:GetObject\"],\"Resource\":[\"arn:aws:s3:::" + bucketName + "/*\"]}]}";
                minioClient.setBucketPolicy(SetBucketPolicyArgs.builder().bucket(bucketName).config(policy).build());
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    // 1. Upload Game
    @PostMapping("/upload")
    public Game uploadGame(@RequestParam("file") MultipartFile file,
                           @RequestParam("title") String title,
                           @RequestParam("desc") String desc) throws Exception {

        // 1. Lấy đuôi file gốc (thường là .html)
        String originalFilename = file.getOriginalFilename();
        String extension = StringUtils.getFilenameExtension(originalFilename);
        if (extension == null || extension.isEmpty()) {
            extension = "html";
        }

        // 2. Tạo tên file mới an toàn: UUID + đuôi file
        // Ví dụ: 550e8400-e29b-41d4-a716-446655440000.html
        String safeFileName = UUID.randomUUID().toString() + "." + extension;

        // 3. Upload lên Minio với tên mới
        minioClient.putObject(PutObjectArgs.builder()
                                  .bucket(bucketName)
                                  .object(safeFileName) // Dùng tên file an toàn
                                  .stream(file.getInputStream(), file.getSize(), -1)
                                  .contentType("text/html")
                                  .build());

        // 4. Lưu DB
        Game game = new Game();
        game.setTitle(title);
        game.setDescription(desc);
        game.setMinioObjectName(safeFileName); // Lưu tên file UUID vào DB
        return gameRepository.save(game);
    }

    // 2. Get List
    @GetMapping
    public List<Game> listGames() {
        return gameRepository.findAll();
    }

    // 3. Get Detail
    @GetMapping("/{id}")
    public Game getGame(@PathVariable Long id) {
        return gameRepository.findById(id).orElseThrow();
    }

    // 4. Tracking Play
    @PostMapping("/{id}/play")
    public void trackPlay(
        @PathVariable Long id, 
        @RequestParam String userId,
        @RequestParam(defaultValue = "0") Integer score,
        @RequestParam(defaultValue = "0") Integer duration
    ) {
        PlayHistory history = new PlayHistory();
        history.setGameId(id);
        history.setUserId(userId);
        history.setPlayedAt(LocalDateTime.now());
        history.setScore(score);
        history.setDuration(duration);
        playHistoryRepository.save(history);
        
        // Update user stats if user exists
        userRepository.findByUsername(userId).ifPresent(user -> {
            user.setTotalScore(user.getTotalScore() + score);
            user.setGamesPlayed(user.getGamesPlayed() + 1);
            userRepository.save(user);
        });
        
        System.out.println("User " + userId + " played game " + id + " with score: " + score);
    }
}
