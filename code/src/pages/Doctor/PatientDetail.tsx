import React from 'react';
import { Card, Descriptions, Badge, Button, Input, Form, Select, Divider } from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons'; // <--- Đã xóa SaveOutlined

const { TextArea } = Input;

const PatientDetail: React.FC = () => {
  const patientData = {
    id: 'P-2024-001',
    name: 'Trần Văn C',
    age: 56,
    history: 'Tiểu đường Type 2 (5 năm)',
    lastScan: '12/12/2025',
    aiResult: 'High Risk (DR Stage 2)',
    aiConfidence: 92
  };

  const onFinish = (values: any) => {
    console.log('Bác sĩ xác nhận:', values);
  };

  return (
    <div className="max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-sky-700">Hồ sơ bệnh án điện tử</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-1">
            <Card title="Thông tin hành chính" className="shadow-sm">
                <div className="flex flex-col items-center mb-4">
                    <div className="w-20 h-20 rounded-full bg-sky-100 flex items-center justify-center text-2xl font-bold text-sky-600 mb-2">
                        {patientData.name.charAt(0)}
                    </div>
                    <h3 className="text-lg font-bold">{patientData.name}</h3>
                    <p className="text-gray-500">ID: {patientData.id}</p>
                </div>
                <Divider />
                <Descriptions column={1} size="small">
                    <Descriptions.Item label="Tuổi">{patientData.age}</Descriptions.Item>
                    <Descriptions.Item label="Tiền sử">{patientData.history}</Descriptions.Item>
                    <Descriptions.Item label="Ngày chụp">{patientData.lastScan}</Descriptions.Item>
                </Descriptions>
            </Card>
        </div>

        <div className="col-span-2">
            <Card title="Kết quả AI & Chẩn đoán Bác sĩ" className="shadow-sm">
                <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-200">
                    <div className="flex justify-between">
                        <span className="font-semibold text-gray-600">AI Suggestion:</span>
                        <Badge status="error" text={patientData.aiResult} />
                    </div>
                    <div className="flex justify-between mt-2">
                        <span className="font-semibold text-gray-600">Độ tin cậy:</span>
                        <span className="text-sky-600 font-bold">{patientData.aiConfidence}%</span>
                    </div>
                </div>

                <Form layout="vertical" onFinish={onFinish} initialValues={{ diagnosis: 'DR_STAGE_2' }}>
                    <Form.Item label="Kết luận cuối cùng (Final Diagnosis)" name="diagnosis" rules={[{ required: true }]}>
                        <Select>
                            <Select.Option value="NORMAL">Bình thường (Normal)</Select.Option>
                            <Select.Option value="DR_STAGE_1">DR Giai đoạn 1 (Nhẹ)</Select.Option>
                            <Select.Option value="DR_STAGE_2">DR Giai đoạn 2 (Trung bình)</Select.Option>
                            <Select.Option value="DR_STAGE_3">DR Giai đoạn 3 (Nặng)</Select.Option>
                        </Select>
                    </Form.Item>

                    <Form.Item label="Ghi chú y khoa / Chỉ định điều trị" name="notes">
                        <TextArea rows={4} placeholder="Ví dụ: Bệnh nhân cần kiểm soát đường huyết, tái khám sau 1 tháng..." />
                    </Form.Item>

                    <Button type="primary" htmlType="submit" icon={<CheckCircleOutlined />} size="large">
                        Xác thực & Lưu Hồ Sơ
                    </Button>
                </Form>
            </Card>
        </div>
      </div>
    </div>
  );
};

export default PatientDetail;