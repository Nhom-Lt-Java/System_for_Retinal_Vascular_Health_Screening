import React, { useEffect, useMemo, useState } from "react";
import {
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
  Alert,
  CircularProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import analysisApi, { type AnalysisResponse } from "../../api/analysisApi";
type LocalHistoryItem = {
  id: string;
  createdAt: string;
  predLabel: string | null;
  predConf: number | null;
};

function getLocalHistory(): LocalHistoryItem[] {
  const key = "aura_analysis_history";
  const raw = localStorage.getItem(key);
  return raw ? JSON.parse(raw) : [];
}

const History: React.FC = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<AnalysisResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [warn, setWarn] = useState<string>("");

  const localFallback = useMemo(() => getLocalHistory(), []);

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        const res = await analysisApi.listMy();
        setItems(res);
        setWarn("");
      } catch (e: any) {
        // fallback local (để không mất UX)
        setWarn("Không tải được lịch sử từ backend. Đang hiển thị lịch sử cục bộ (localStorage).");
        setItems(
          localFallback.map((x) => ({
            id: x.id,
            status: "DONE",
            predLabel: x.predLabel,
            predConf: x.predConf,
            probsJson: null,
            originalUrl: null,
            overlayUrl: null,
            maskUrl: null,
            heatmapUrl: null,
            heatmapOverlayUrl: null,
            createdAt: x.createdAt,
          }))
        );
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [localFallback]);

  return (
    <Container maxWidth="md" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
        <Typography variant="h4" gutterBottom fontWeight="bold" color="primary">
          Lịch sử phân tích
        </Typography>

        {warn && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            {warn}
          </Alert>
        )}

        {loading ? (
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <CircularProgress size={20} /> <span>Đang tải...</span>
          </div>
        ) : items.length === 0 ? (
          <Typography>Chưa có lịch sử phân tích.</Typography>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Thời gian</TableCell>
                <TableCell>Kết quả</TableCell>
                <TableCell>Độ tin cậy</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((it) => (
                <TableRow key={it.id}>
                  <TableCell>{it.createdAt ? new Date(it.createdAt).toLocaleString() : "-"}</TableCell>
                  <TableCell>{it.predLabel ?? "-"}</TableCell>
                  <TableCell>{it.predConf != null ? (it.predConf * 100).toFixed(1) + "%" : "-"}</TableCell>
                  <TableCell align="right">
                    <Button variant="outlined" onClick={() => navigate(`/result?id=${it.id}`)}>
                      Xem
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>
    </Container>
  );
};

export default History;
