package com.aura.retinal.repository;
import com.aura.retinal.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;


import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long>  {
    Optional<User> findByUsername(String username);
}
