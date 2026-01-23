import { PropsWithChildren } from "react";
import { Box, Container, Paper, Typography } from "@mui/material";

type Props = PropsWithChildren<{
  title: string;
  subtitle?: string;
}>;

export default function AuthLayout({ title, subtitle, children }: Props) {
  return (
    <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", py: 6, bgcolor: "#f6f8fb" }}>
      <Container maxWidth="sm">
        <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: "1px solid #e9eef5" }}>
          <Typography variant="h5" fontWeight={800} sx={{ mb: 0.5 }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography color="textSecondary" sx={{ mb: 3 }}>
              {subtitle}
            </Typography>
          )}
          <Box>{children}</Box>
        </Paper>
      </Container>
    </Box>
  );
}
