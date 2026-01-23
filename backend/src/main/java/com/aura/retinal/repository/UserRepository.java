package com.aura.retinal.repository;

import com.aura.retinal.entity.Role;
import com.aura.retinal.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Optional<User> findByUsernameOrEmail(String username, String email);

    List<User> findByRole(Role role);
    long countByRole(Role role);

    List<User> findByClinic_IdAndRole(Long clinicId, Role role);
    List<User> findByClinic_Id(Long clinicId);
    List<User> findByAssignedDoctor_Id(Long doctorId);

}
