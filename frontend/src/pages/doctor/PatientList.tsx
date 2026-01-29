import { useEffect, useMemo, useState } from "react";
import {
  Container,
  Typography,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Alert,
  Chip,
  Stack,
  CircularProgress
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useNavigate } from "react-router-dom";
import { getAssignedAnalyses } from "../../api/analysisApi"; // Sử dụng API mới

// Định nghĩa kiểu dữ liệu trả về từ API getAssignedAnalyses
type AnalysisItem = {
  id: string;
  originalUrl?: string;
  predLabel?: string;
  riskLevel?: string;
  status: string; // QUEUED, COMPLETED, REVIEWED
  createdAt: string;
  doctorConclusion?: string;
};

// Hàm tiện ích để hiển thị màu sắc mức độ nguy cơ
function getRiskConfig(riskLevel?: string) {
  const rl = (riskLevel || "").toUpperCase();
  if (rl === "HIGH") return { label: "Nguy cơ cao", color: "error" as const };
  if (rl === "MED") return { label: "Nguy cơ trung bình", color: "warning" as const };
  if (rl === "LOW") return { label: "Bình thường", color: "success" as const };
  return { label: "Chưa xác định", color: "default" as const };
}

export default function PatientList() {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [analyses, setAnalyses] = useState<AnalysisItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Gọi API lấy danh sách khi component được tải
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await getAssignedAnalyses();
        // Kiểm tra dữ liệu trả về có phải mảng không
        const items = Array.isArray(data) ? data : [];
        setAnalyses(items);
        setLoading(false);
      } catch (e: any) {
        console.error(e);
        setError("Không thể tải danh sách hồ sơ bệnh nhân.");
        setLoading(false);
      }
    })();
  }, []);

  // Xử lý lọc và tìm kiếm trên Client
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return analyses.filter((item) => {
      // Tìm kiếm theo ID hồ sơ hoặc Kết luận (nếu có)
      const hay = `${item.id} ${item.doctorConclusion || ""} ${item.predLabel || ""}`.toLowerCase();
      const matchSearch = !q || hay.includes(q);

      // Lọc theo trạng thái (Đã duyệt / Chờ duyệt)
      let matchStatus = true;
      if (filterStatus === "PENDING") matchStatus = item.status !== "REVIEWED";
      if (filterStatus === "REVIEWED") matchStatus = item.status === "REVIEWED";

      return matchSearch && matchStatus;
    });
  }, [analyses, search, filterStatus]);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight="bold" color="primary">
          Danh sách hồ sơ cần duyệt
        </Typography>
        <Button variant="outlined" onClick={() => navigate("/doctor/dashboard")}>
          Quay lại Dashboard
        </Button>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
        <TextField
          placeholder="Tìm theo Mã hồ sơ, Kết quả AI..."
          variant="outlined"
          size="small"
          fullWidth
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ bgcolor: "white" }}
        />

        <FormControl size="small" sx={{ minWidth: 200, bgcolor: "white" }}>
          <InputLabel id="status-filter">Trạng thái duyệt</InputLabel>
          <Select
            labelId="status-filter"
            label="Trạng thái duyệt"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <MenuItem value="ALL">Tất cả</MenuItem>
            <MenuItem value="PENDING">Chờ duyệt (Mới)</MenuItem>
            <MenuItem value="REVIEWED">Đã duyệt</MenuItem>
          </Select>
        </FormControl>
      </Stack>

      <TableContainer component={Paper} elevation={2} sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead sx={{ bgcolor: "#f5f5f5" }}>
            <TableRow>
              <TableCell width="10%">Ảnh</TableCell>
              <TableCell width="20%">Mã Hồ Sơ / Ngày gửi</TableCell>
              <TableCell width="25%">Dự đoán AI</TableCell>
              <TableCell width="20%">Trạng thái</TableCell>
              <TableCell align="right">Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                  <CircularProgress size={24} /> <span style={{marginLeft: 10}}>Đang tải...</span>
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                  Không tìm thấy hồ sơ nào.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((item) => {
                const risk = getRiskConfig(item.riskLevel);
                const isReviewed = item.status === "REVIEWED";

                return (
                  <TableRow key={item.id} hover>
                    <TableCell>
                      <img 
                        src={item.originalUrl || "https://via.placeholder.com/80?text=No+Img"} 
                        alt="Eye" 
                        style={{ width: 60, height: 60, objectFit: "cover", borderRadius: 4, border: "1px solid #ddd" }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold" title={item.id}>
                        {item.id.substring(0, 8)}...
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(item.createdAt).toLocaleString('vi-VN')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{item.predLabel || "Chưa có kết quả"}</Typography>
                      {item.riskLevel && (
                        <Chip 
                          label={risk.label} 
                          color={risk.color} 
                          size="small" 
                          variant="outlined" 
                          sx={{ mt: 0.5 }}
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={isReviewed ? "Đã duyệt" : "Chờ xử lý"} 
                        color={isReviewed ? "success" : "warning"}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        variant="contained"
                        size="small"
                        color={isReviewed ? "info" : "primary"}
                        onClick={() => navigate(`/doctor/review/${item.id}`)}
                      >
                        {isReviewed ? "Xem lại" : "Đánh giá"}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}