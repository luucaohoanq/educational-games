package com.example.be.controller;

import com.example.be.dto.CommentRequest;
import com.example.be.dto.CommentResponse;
import com.example.be.dto.GameCategoryResponse;
import com.example.be.dto.LikeResponse;
import com.example.be.entity.*;
import com.example.be.enums.Role;
import com.example.be.repository.*;
import io.minio.*;
import jakarta.annotation.PostConstruct;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/games")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // Allow CORS for frontend
public class GameController {

    private final MinioClient minioClient;
    private final GameRepository gameRepository;
    private final PlayHistoryRepository playHistoryRepository;
    private final UserRepository userRepository;
    private final CommentRepository commentRepository;
    private final GameLikeRepository gameLikeRepository;
    private final GameCategoryRepository gameCategoryRepository;

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

    // 1. Upload Game (with category and thumbnail)
    @PostMapping("/upload")
    public Game uploadGame(@RequestParam("file") MultipartFile file,
                           @RequestParam("title") String title,
                           @RequestParam("desc") String desc,
                           @RequestParam(value = "categoryId", required = false) Long categoryId,
                           @RequestParam(value = "thumbnailUrl", required = false) String thumbnailUrl,
                           @RequestParam(value = "thumbnail", required = false) MultipartFile thumbnailFile,
                           @RequestParam(value = "username", required = false) String username) throws Exception {

        String originalFilename = file.getOriginalFilename();
        String extension = StringUtils.getFilenameExtension(originalFilename);

        // Tạo một Folder ID duy nhất cho game này trên MinIO
        // Ví dụ: games/550e8400-e29b.../
        String gameFolderId = UUID.randomUUID().toString();
        String entryPointFile = ""; // File html chính để chạy game
        String thumbnailPath = null;
        
        // Handle thumbnail upload if provided as file
        if (thumbnailFile != null && !thumbnailFile.isEmpty()) {
            String thumbExt = StringUtils.getFilenameExtension(thumbnailFile.getOriginalFilename());
            String thumbFileName = gameFolderId + "/thumbnail." + thumbExt;
            
            String thumbContentType = determineContentType(thumbnailFile.getOriginalFilename());
            minioClient.putObject(PutObjectArgs.builder()
                .bucket(bucketName)
                .object(thumbFileName)
                .stream(thumbnailFile.getInputStream(), thumbnailFile.getSize(), -1)
                .contentType(thumbContentType)
                .build());
            
            thumbnailPath = thumbFileName;
        } else if (thumbnailUrl != null && !thumbnailUrl.isEmpty()) {
            // Use provided URL
            thumbnailPath = thumbnailUrl;
        }

        // CASE 1: Nếu upload file .zip
        if ("zip".equalsIgnoreCase(extension)) {
            try (ZipInputStream zis = new ZipInputStream(file.getInputStream())) {
                ZipEntry entry;
                while ((entry = zis.getNextEntry()) != null) {
                    // Bỏ qua nếu là thư mục hoặc file rác của MacOS
                    if (entry.isDirectory() || entry.getName().contains("__MACOSX")) {
                        continue;
                    }

                    // Đọc nội dung file trong zip ra byte array
                    // Lưu ý: Với game quá nặng (>100MB), nên dùng temp file thay vì RAM
                    ByteArrayOutputStream baos = new ByteArrayOutputStream();
                    byte[] buffer = new byte[1024];
                    int len;
                    while ((len = zis.read(buffer)) > 0) {
                        baos.write(buffer, 0, len);
                    }
                    byte[] fileContent = baos.toByteArray();

                    // Xác định Content-Type (Quan trọng để browser load được ảnh/css/js)
                    String contentType = determineContentType(entry.getName());

                    // Đường dẫn trên MinIO: game-id/path-trong-zip
                    // Ví dụ: 550e.../assets/image.png
                    String objectName = gameFolderId + "/" + entry.getName();

                    // Upload lên MinIO
                    minioClient.putObject(PutObjectArgs.builder()
                                              .bucket(bucketName)
                                              .object(objectName)
                                              .stream(new ByteArrayInputStream(fileContent), fileContent.length, -1)
                                              .contentType(contentType)
                                              .build());

                    // Tìm file chạy chính (thường là index.html)
                    if (entry.getName().endsWith("index.html") || entryPointFile.isEmpty()) {
                        // Ưu tiên index.html, nếu không có thì lấy file đầu tiên tìm được
                        if (entry.getName().endsWith(".html")) {
                            entryPointFile = objectName;
                        }
                    }
                }
            }

            if (entryPointFile.isEmpty()) {
                throw new RuntimeException("Trong file zip không tìm thấy file .html nào!");
            }

        }
        // CASE 2: Nếu upload file .html lẻ (như logic cũ)
        else {
            String safeFileName = gameFolderId + "/" + "index.html"; // Gom vào folder cho chuẩn
            minioClient.putObject(PutObjectArgs.builder()
                                      .bucket(bucketName)
                                      .object(safeFileName)
                                      .stream(file.getInputStream(), file.getSize(), -1)
                                      .contentType("text/html")
                                      .build());
            entryPointFile = safeFileName;
        }

        // 4. Lưu DB
        Game game = new Game();
        game.setTitle(title);
        game.setDescription(desc);
        game.setMinioObjectName(entryPointFile);
        game.setThumbnailUrl(thumbnailPath);
        game.setCreatedBy(username);
        
        // Set category if provided
        if (categoryId != null) {
            gameCategoryRepository.findById(categoryId).ifPresent(game::setCategory);
        }

        return gameRepository.save(game);
    }
    
    // 1.1 Update Game (Admin only)
    @PutMapping("/{id}")
    public ResponseEntity<?> updateGame(@PathVariable Long id,
                                       @RequestParam("title") String title,
                                       @RequestParam("desc") String desc,
                                       @RequestParam(value = "categoryId", required = false) Long categoryId,
                                       @RequestParam(value = "thumbnailUrl", required = false) String thumbnailUrl,
                                       @RequestParam(value = "thumbnail", required = false) MultipartFile thumbnailFile,
                                       @RequestParam("username") String username) throws Exception {
        
        // Check if user is admin
        User user = userRepository.findByUsername(username).orElse(null);
        if (user == null || user.getRole() != Role.ADMIN) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only admins can update games");
        }
        
        Game game = gameRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Game not found"));
        
        game.setTitle(title);
        game.setDescription(desc);
        
        // Handle thumbnail update
        if (thumbnailFile != null && !thumbnailFile.isEmpty()) {
            String gameFolderId = game.getMinioObjectName().split("/")[0];
            String thumbExt = StringUtils.getFilenameExtension(thumbnailFile.getOriginalFilename());
            String thumbFileName = gameFolderId + "/thumbnail." + thumbExt;
            
            String thumbContentType = determineContentType(thumbnailFile.getOriginalFilename());
            minioClient.putObject(PutObjectArgs.builder()
                .bucket(bucketName)
                .object(thumbFileName)
                .stream(thumbnailFile.getInputStream(), thumbnailFile.getSize(), -1)
                .contentType(thumbContentType)
                .build());
            
            game.setThumbnailUrl(thumbFileName);
        } else if (thumbnailUrl != null && !thumbnailUrl.isEmpty()) {
            game.setThumbnailUrl(thumbnailUrl);
        }
        
        // Update category
        if (categoryId != null) {
            gameCategoryRepository.findById(categoryId).ifPresent(game::setCategory);
        }
        
        return ResponseEntity.ok(gameRepository.save(game));
    }
    
    // 1.2 Delete Game (Admin only)
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteGame(@PathVariable Long id, @RequestParam("username") String username) {
        // Check if user is admin
        User user = userRepository.findByUsername(username).orElse(null);
        if (user == null || user.getRole() != Role.ADMIN) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only admins can delete games");
        }
        
        gameRepository.deleteById(id);
        return ResponseEntity.ok("Game deleted successfully");
    }

    // Hàm phụ trợ để xác định Content-Type thủ công (tránh lỗi file js/css không chạy)
    private String determineContentType(String fileName) {
        String ext = StringUtils.getFilenameExtension(fileName);
        if (ext == null) return "application/octet-stream";
        switch (ext.toLowerCase()) {
            case "html": return "text/html";
            case "css": return "text/css";
            case "js": return "application/javascript";
            case "png": return "image/png";
            case "jpg": case "jpeg": return "image/jpeg";
            case "gif": return "image/gif";
            case "svg": return "image/svg+xml";
            case "mp3": return "audio/mpeg";
            case "wav": return "audio/wav";
            case "json": return "application/json";
            default: return "application/octet-stream";
        }
    }

    // 2. Get List
    @GetMapping
    public List<Game> listGames() {
        return gameRepository.findAll();
    }
    
    // 2.1 Get Categories
    @GetMapping("/categories")
    public List<GameCategoryResponse.CategorySimple> listCategories() {
        return gameCategoryRepository.findAll()
            .stream()
            .map(cat -> new GameCategoryResponse.CategorySimple(
                cat.getId(),
                cat.getName(),
                cat.getDescription(),
                cat.getIcon()
            ))
            .toList();
    }

    // 3. Get Detail
    @GetMapping("/{id}")
    public Game getGame(@PathVariable Long id) {
        Game game = gameRepository.findById(id).orElseThrow();
        // Increment view count
        game.setViews(game.getViews() + 1);
        return gameRepository.save(game);
    }

    // 3.1 Like Game (with user tracking)
    @PostMapping("/{id}/like")
    public LikeResponse likeGame(@PathVariable Long id, @RequestParam String username) {
        Game game = gameRepository.findById(id).orElseThrow(() -> new RuntimeException("Game not found"));
        User user = userRepository.findByUsername(username).orElseThrow(() -> new RuntimeException("User not found"));
        
        // Check if user already liked this game
        Optional<GameLike> existingLike = gameLikeRepository.findByGameAndUser(game, user);
        
        if (existingLike.isPresent()) {
            // User already liked - unlike it
            gameLikeRepository.delete(existingLike.get());
            game.setLikes(game.getLikes() - 1);
            gameRepository.save(game);
            
            return new LikeResponse(
                true,
                "Game unliked successfully",
                game.getLikes(),
                false
            );
        } else {
            // New like
            GameLike gameLike = new GameLike();
            gameLike.setGame(game);
            gameLike.setUser(user);
            gameLikeRepository.save(gameLike);
            
            game.setLikes(game.getLikes() + 1);
            gameRepository.save(game);
            
            return new LikeResponse(
                true,
                "Game liked successfully",
                game.getLikes(),
                true
            );
        }
    }

    // 3.1.1 Check if user liked a game
    @GetMapping("/{id}/like/status")
    public boolean checkLikeStatus(@PathVariable Long id, @RequestParam String username) {
        Game game = gameRepository.findById(id).orElse(null);
        User user = userRepository.findByUsername(username).orElse(null);
        
        if (game != null && user != null) {
            return gameLikeRepository.existsByGameAndUser(game, user);
        }
        return false;
    }

    // 3.2 Get Comments
    @GetMapping("/{id}/comments")
    public List<CommentResponse> getComments(@PathVariable Long id) {
        return commentRepository.findByGameIdOrderByDatePostedDesc(id)
            .stream()
            .map(comment -> new CommentResponse(
                comment.getId(),
                comment.getGame().getId(),
                comment.getUser().getUsername(),
                comment.getContent(),
                comment.getDatePosted(),
                comment.getParentCommentId()
            ))
            .toList();
    }
    // 3.3 Add Comment
    @PostMapping("/{id}/comments")
    public Comment addComment(@PathVariable Long id, @RequestBody CommentRequest request) {
        Game game = gameRepository.findById(id).orElseThrow(() -> new RuntimeException("Game not found"));
        User user = userRepository.findByUsername(request.getUsername()).orElseThrow(() -> new RuntimeException("User not found"));
        
        Comment comment = new Comment();
        comment.setGame(game);
        comment.setUser(user);
        comment.setContent(request.getContent());
        comment.setParentCommentId(request.getParentCommentId());
        return commentRepository.save(comment);
    }

    // 4. Tracking Play
    @PostMapping("/{id}/play")
    public void trackPlay(
        @PathVariable Long id, 
        @RequestParam String userId,
        @RequestParam(defaultValue = "0") Integer score,
        @RequestParam(defaultValue = "0") Integer duration
    ) {
        Game game = gameRepository.findById(id).orElseThrow(() -> new RuntimeException("Game not found"));
        User user = userRepository.findByUsername(userId).orElseThrow(() -> new RuntimeException("User not found"));
        
        PlayHistory history = new PlayHistory();
        history.setGame(game);
        history.setUser(user);
        history.setScore(score);
        history.setDuration(duration);
        playHistoryRepository.save(history);
        
        // Update user stats
        user.setTotalScore(user.getTotalScore() + score);
        user.setGamesPlayed(user.getGamesPlayed() + 1);
        userRepository.save(user);
        
        System.out.println("User " + userId + " played game " + id + " with score: " + score);
    }

    // 4.1 Get Play History for a User
    @GetMapping("/history")
    public List<PlayHistory> getPlayHistory(@RequestParam Long userId) {
        return playHistoryRepository.findByUserIdOrderByPlayedAtDesc(userId);
    }
}
