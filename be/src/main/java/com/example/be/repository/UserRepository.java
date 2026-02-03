package com.example.be.repository;

import com.example.be.entity.User;
import com.example.be.enums.Role;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Page<User> findAllByRole(Role role, Pageable pageable);
    boolean existsByUsername(String username);
}
