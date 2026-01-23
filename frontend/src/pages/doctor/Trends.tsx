import React, { useEffect, useMemo, useState } from "react";
import {
  Container,
  Typography,
  Paper,
  Box,
  Alert,
  CircularProgress,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { getTrends } from "../../api/doctorApi";

type TrendRow = {
  date: string;
  high: number;
  med: number;
  low: number;
  qualityLow: number;
  total: number;
};

export default function DoctorTrends() {
  const navigate = useNavigate();
  const [days, setDays] = useState<number>(30);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState<Record<string, any>>({});

  const load = async (d = days) => {
    try {
      setLoading(true);
      setError("");
      const res = await getTrends(d);
      setData(res || {});
    } catch (e: any) {
      setError(e?.response?.data?.message || "Không tải được trend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(days);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days]);

  const rows: TrendRow[] = useMemo(() => {
    const list: TrendRow[] = Object.entries(data || {}).map(([date, v]: any) => {
      const high = Number(v?.high ?? 0);
      const med = Number(v?.med ?? 0);
      const low = Number(v?.low ?? 0);
      const qualityLow = Number(v?.qualityLow ?? 0);
      const total = high + med + low + qualityLow;
      return { date, high, med, low, qualityLow, total };
    });
    list.sort((a, b) => (a.date < b.date ? 1 : -1));
    return list;
  }, [data]);

  const totalRow = useMemo(() => {
    return rows.reduce(
      (acc, r) => {
        acc.high += r.high;
        acc.med += r.med;
        acc.low += r.low;
        acc.qualityLow += r.qualityLow;
        acc.total += r.total;
        return acc;
      },
      { high: 0, med: 0, low: 0, qualityLow: 0, total: 0 }
    );
  }, [rows]);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4" fontWeight="bold">
          Trend nguy cơ (theo ngày)
        </Typography>
        <Box display="flex" gap={1}>
          <Button variant="outlined" onClick={() => navigate("/doctor/dashboard")}>Dashboard</Button>
          <Button variant="outlined" onClick={() => navigate("/doctor/patients")}>Bệnh nhân</Button>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

      <Paper sx={{ p: 2, borderRadius: 3, mb: 2 }}>
        <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel id="days">Khoảng thời gian</InputLabel>
            <Select
              labelId="days"
              label="Khoảng thời gian"
              value={String(days)}
              onChange={(e) => setDays(Number(e.target.value))}
            >
              <MenuItem value={7}>7 ngày</MenuItem>
              <MenuItem value={30}>30 ngày</MenuItem>
              <MenuItem value={90}>90 ngày</MenuItem>
            </Select>
          </FormControl>
          <Button variant="contained" onClick={() => load(days)} disabled={loading}>Refresh</Button>
        </Box>
      </Paper>

      <Paper sx={{ p: 2, borderRadius: 3 }}>
        {loading ? (
          <Box display="flex" justifyContent="center" py={6}><CircularProgress /></Box>
        ) : rows.length === 0 ? (
          <Typography color="textSecondary">Chưa có dữ liệu trend.</Typography>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Ngày</TableCell>
                <TableCell align="right">HIGH</TableCell>
                <TableCell align="right">MED</TableCell>
                <TableCell align="right">LOW</TableCell>
                <TableCell align="right">QUALITY_LOW</TableCell>
                <TableCell align="right">Tổng</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.date} hover>
                  <TableCell>{r.date}</TableCell>
                  <TableCell align="right">{r.high}</TableCell>
                  <TableCell align="right">{r.med}</TableCell>
                  <TableCell align="right">{r.low}</TableCell>
                  <TableCell align="right">{r.qualityLow}</TableCell>
                  <TableCell align="right"><b>{r.total}</b></TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell><b>Tổng</b></TableCell>
                <TableCell align="right"><b>{totalRow.high}</b></TableCell>
                <TableCell align="right"><b>{totalRow.med}</b></TableCell>
                <TableCell align="right"><b>{totalRow.low}</b></TableCell>
                <TableCell align="right"><b>{totalRow.qualityLow}</b></TableCell>
                <TableCell align="right"><b>{totalRow.total}</b></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        )}
      </Paper>
    </Container>
  );
}
