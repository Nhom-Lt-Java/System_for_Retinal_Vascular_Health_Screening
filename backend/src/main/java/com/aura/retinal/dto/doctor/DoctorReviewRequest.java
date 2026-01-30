package com.aura.retinal.dto.doctor;

import jakarta.validation.constraints.NotBlank;

public record DoctorReviewRequest(
        // Kết quả đánh giá: "APPROVED" (Đồng ý AI) hoặc "CORRECTED" (Chỉnh sửa)
        String reviewResult, 
        
        // Nhãn bệnh sửa lại (nếu AI sai)
        String correctedLabel, 
        
        // Kết luận chuyên môn
        @NotBlank String conclusion, 
        
        // Lời khuyên/Chỉ định cho bệnh nhân
        String advice, 
        
        // Ghi chú nội bộ
        String note
) {}