import React, { useEffect, useMemo, useState } from "react";
import {
  Container,
  Typography,
  Paper,
  Box,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Divider,
} from "@mui/material";
import { getAiSettings, updateAiSetting, type AiSettings } from "../../api/adminApi";

export default function AISettings() {
  const [settings, setSettings] = useState<AiSettings>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  const modelVersion = useMemo(() => String(settings?.model_version ?? "0.1.0"), [settings]);
  const thresholdsText = useMemo(() => {
    const t = settings?.thresholds ?? { disease_threshold: 0.75 };
    try {
      return JSON.stringify(t, null, 2);
    } catch {
      return "{}";
    }
  }, [settings]);

  const [mv, setMv] = useState("0.1.0");
  const [th, setTh] = useState("{}");

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      setOk("");
      const data = await getAiSettings();
      setSettings(data || {});
      setMv(String((data || {}).model_version ?? "0.1.0"));
      const t = (data || {}).thresholds ?? { disease_threshold: 0.75 };
      setTh(JSON.stringify(t, null, 2));
    } catch (e: any) {
      setError(e?.response?.data?.message || "Không tải được AI settings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const thError = useMemo(() => {
    try {
      JSON.parse(th);
      return "";
    } catch {
      return "Thresholds phải là JSON hợp lệ.";
    }
  }, [th]);

  const onSave = async () => {
    try {
      setSaving(true);
      setError("");
      setOk("");

      if (thError) {
        setError(thError);
        return;
      }

      const thresholdsObj = JSON.parse(th);
      await updateAiSetting("model_version", mv);
      await updateAiSetting("thresholds", thresholdsObj);

      setOk("Đã lưu AI settings vào DB.");
      await load();
    } catch (e: any) {
      setError(e?.response?.data?.message || "Lưu thất bại.");
    } finally {
      setSaving(false);
    }
  };

  const onReset = () => {
    setMv(modelVersion);
    setTh(thresholdsText);
    setOk("");
    setError("");
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        AI Settings (Admin)
      </Typography>
      <Typography color="textSecondary" sx={{ mb: 2 }}>
        Cấu hình model version, thresholds và tham số AI. Thay đổi sẽ được ghi DB và áp dụng cho các lần phân tích tiếp theo.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
          {error}
        </Alert>
      )}
      {ok && (
        <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>
          {ok}
        </Alert>
      )}

      <Paper sx={{ p: 3, borderRadius: 3 }}>
        {loading ? (
          <Box display="flex" justifyContent="center" py={6}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <TextField
              label="Model version"
              fullWidth
              value={mv}
              onChange={(e) => setMv(e.target.value)}
              helperText="Ví dụ: 0.1.0 (traceability trong report)"
            />

            <Divider sx={{ my: 2 }} />

            <TextField
              label="Thresholds (JSON)"
              fullWidth
              multiline
              minRows={8}
              value={th}
              onChange={(e) => setTh(e.target.value)}
              error={!!thError}
              helperText={thError || "Ví dụ: { \"disease_threshold\": 0.75, \"vessel_threshold\": 0.5 }"}
            />

            <Box display="flex" gap={2} justifyContent="flex-end" sx={{ mt: 2 }}>
              <Button variant="outlined" onClick={onReset} disabled={saving}>
                Reset
              </Button>
              <Button variant="contained" onClick={onSave} disabled={saving}>
                {saving ? "Đang lưu..." : "Lưu"}
              </Button>
            </Box>
          </>
        )}
      </Paper>
    </Container>
  );
}
