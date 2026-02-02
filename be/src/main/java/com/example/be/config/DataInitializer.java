package com.example.be.config;

import com.example.be.entity.GameCategory;
import com.example.be.entity.User;
import com.example.be.enums.Role;
import com.example.be.repository.GameCategoryRepository;
import com.example.be.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {
    
    private final GameCategoryRepository gameCategoryRepository;
    private final UserRepository userRepository;
    
    @Override
    public void run(String... args) {
        initializeGameCategories();
        initializeDefaultUsers();
    }
    
    private void initializeGameCategories() {
        if (gameCategoryRepository.count() == 0) {
            GameCategory quiz = new GameCategory();
            quiz.setName("QUIZ");
            quiz.setDescription("Quiz and trivia games to test your knowledge");
            quiz.setIcon("🧩");
            gameCategoryRepository.save(quiz);
            
            GameCategory typing = new GameCategory();
            typing.setName("TYPING");
            typing.setDescription("Typing speed and accuracy games");
            typing.setIcon("⌨️");
            gameCategoryRepository.save(typing);
            
            System.out.println("✓ Initialized game categories: QUIZ, TYPING");
        }
    }
    
    private void initializeDefaultUsers() {
        // Create admin user if not exists
        if (userRepository.findByUsername("admin").isEmpty()) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setPassword("admin123"); // In production, use password encoder
            admin.setEmail("admin@example.com");
            admin.setRole(Role.ADMIN);
            userRepository.save(admin);
            System.out.println("✓ Created default admin account (username: admin, password: admin123)");
        }
        
        // Create student user if not exists
        if (userRepository.findByUsername("student").isEmpty()) {
            User student = new User();
            student.setUsername("student");
            student.setPassword("student123"); // In production, use password encoderS
            student.setEmail("student@example.com");
            student.setRole(Role.STUDENT);
            userRepository.save(student);
            System.out.println("✓ Created default student account (username: student, password: student123)");
        }
    }
}
