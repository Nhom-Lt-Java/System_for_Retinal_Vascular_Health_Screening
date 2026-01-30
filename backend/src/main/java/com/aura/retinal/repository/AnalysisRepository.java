package com.aura.retinal.repository;

import com.aura.retinal.entity.Analysis;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query; // Nhớ Import dòng này
import org.springframework.data.repository.query.Param; // Nhớ Import dòng này
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AnalysisRepository extends JpaRepository<Analysis, UUID> {

    List<Analysis> findByUser_IdOrderByCreatedAtDesc(Long userId);

    Optional<Analysis> findTop1ByUser_IdOrderByCreatedAtDesc(Long userId);

    List<Analysis> findTop20ByOrderByCreatedAtDesc();

    List<Analysis> findAllByOrderByCreatedAtDesc();

    // --- SỬA LẠI ĐOẠN NÀY ---
    // Dùng @Query để fix lỗi "No property assignedDoctorId found"
    // Hàm này tìm các Analysis mà User sở hữu có bác sĩ phụ trách là :doctorId
    @Query("SELECT a FROM Analysis a WHERE a.user.assignedDoctor.id = :doctorId ORDER BY a.createdAt DESC")
    List<Analysis> findByUser_AssignedDoctorIdOrderByCreatedAtDesc(@Param("doctorId") Long doctorId);

    List<Analysis> findByUser_Clinic_IdOrderByCreatedAtDesc(Long clinicId);

    List<Analysis> findByUser_IdInOrderByCreatedAtDesc(List<Long> userIds);
}