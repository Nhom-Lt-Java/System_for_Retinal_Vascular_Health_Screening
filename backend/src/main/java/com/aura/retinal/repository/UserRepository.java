package com.aura.retinal.repository;

import com.aura.retinal.entity.Role;
import com.aura.retinal.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    Optional<User> findByUsername(String username);

    // Sử dụng Query rõ ràng để tránh nhầm lẫn giữa AND/OR trong Spring Data
    @Query("SELECT u FROM User u WHERE u.username = :username OR u.email = :email")
    Optional<User> findByUsernameOrEmail(@Param("username") String username, @Param("email") String email);

    List<User> findByRole(Role role);
    long countByRole(Role role);

    List<User> findByClinic_IdAndRole(Long clinicId, Role role);
    List<User> findByClinic_Id(Long clinicId);
    List<User> findByAssignedDoctor_Id(Long doctorId);
}