// src/pages/clinic/BillingPage.tsx
import React from 'react';
import { Container, Typography, Paper, Grid, Button, Box, Card, CardContent, CardActions } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';

const plans = [
    { name: 'Basic', price: '500k', features: ['50 ca/tháng', 'Hỗ trợ cơ bản'] },
    { name: 'Premium', price: '2tr', features: ['300 ca/tháng', 'AI nâng cao', 'Hỗ trợ 24/7'], recommended: true },
    { name: 'Enterprise', price: 'Liên hệ', features: ['Không giới hạn', 'API riêng', 'Setup tại chỗ'] },
];

export default function BillingPage() {
    return (
        <Container maxWidth="lg" sx={{ mt: 4 }}>
            <Typography variant="h4" sx={{ mb: 4, textAlign: 'center', fontWeight: 'bold' }}>Gói Dịch Vụ Phòng Khám</Typography>
            <Grid container spacing={4} justifyContent="center">
                {plans.map((plan) => (
                    <Grid item xs={12} md={4} key={plan.name}> {/* Nếu lỗi Grid, hãy xóa 'item' */}
                        <Card sx={{ 
                            height: '100%', display: 'flex', flexDirection: 'column', 
                            border: plan.recommended ? '2px solid #1976d2' : '1px solid #ddd',
                            transform: plan.recommended ? 'scale(1.05)' : 'none'
                        }}>
                            <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                                <Typography variant="h5" component="div" gutterBottom fontWeight="bold">
                                    {plan.name}
                                </Typography>
                                <Typography variant="h4" color="primary" gutterBottom>
                                    {plan.price}
                                </Typography>
                                <Box sx={{ mt: 2, textAlign: 'left' }}>
                                    {plan.features.map((f, index) => (
                                        <Typography key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                            <CheckIcon color="success" sx={{ mr: 1, fontSize: 20 }} /> {f}
                                        </Typography>
                                    ))}
                                </Box>
                            </CardContent>
                            <CardActions sx={{ justifyContent: 'center', pb: 3 }}>
                                <Button variant={plan.recommended ? "contained" : "outlined"} size="large">
                                    {plan.price === 'Liên hệ' ? 'Liên hệ Sale' : 'Mua ngay'}
                                </Button>
                            </CardActions>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Container>
    );
}