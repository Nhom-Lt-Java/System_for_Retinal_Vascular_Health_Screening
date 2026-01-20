import React, { useState, useEffect } from "react";
import { Box, Button, Typography, IconButton } from "@mui/material";
import { Cancel } from "@mui/icons-material";

type Props = {
  onSelect: (files: File[]) => void;
};

export default function UploadBox({ onSelect }: Props) {
  const [previews, setPreviews] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  // Dọn dẹp bộ nhớ: Xóa các URL blob cũ khi component unmount hoặc khi previews thay đổi
  useEffect(() => {
    return () => {
      previews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previews]);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const arr = Array.from(files);
    onSelect(arr);

    // Tạo URL mới cho ảnh preview
    const urls = arr.map((f) => URL.createObjectURL(f));
    setPreviews(urls);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragging(true);
    } else if (e.type === "dragleave") {
      setIsDragging(false);
    }
  };

  const handleDrop: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  return (
    <Box>
      <Box
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        sx={{
          border: isDragging ? "2px solid #1976d2" : "2px dashed #aaa",
          p: 4,
          textAlign: "center",
          borderRadius: 3,
          bgcolor: isDragging ? "#e3f2fd" : "#fafbfc",
          transition: "all 0.3s ease",
          cursor: "pointer"
        }}
      >
        <Typography variant="body1" color={isDragging ? "primary" : "textSecondary"}>
          {isDragging ? "Thả ảnh vào đây" : "Drag & drop ảnh hoặc chọn file"}
        </Typography>
        
        <Button variant="contained" component="label" sx={{ mt: 2, borderRadius: 2 }}>
          Chọn ảnh
          <input hidden type="file" accept="image/*" multiple onChange={handleFileInput} />
        </Button>
      </Box>

      {/* Hiển thị danh sách ảnh preview */}
      {previews.length > 0 && (
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mt: 2 }}>
          {previews.map((src, i) => (
            <Box key={i} sx={{ position: "relative", width: 100, height: 100 }}>
              <img 
                src={src} 
                alt={`preview-${i}`} 
                style={{ 
                  width: "100%", 
                  height: "100%", 
                  objectFit: "cover", 
                  borderRadius: "8px",
                  border: "1px solid #ddd"
                }} 
              />
              {/* Nút xóa nhanh có thể thêm ở đây nếu cần */}
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}