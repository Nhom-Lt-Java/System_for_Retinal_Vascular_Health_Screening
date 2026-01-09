package com.aura.retinal.repository;

import com.aura.retinal.entity.User;
import com.aura.retinal.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.List;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    List<User> findByRole(Role role);
}
