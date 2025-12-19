import React, { useState } from 'react';
import { Upload, Button, Card, Typography, message, Alert, Image, Row, Col, Steps, Spin } from 'antd';
import { CloudUploadOutlined, ExperimentOutlined, FilePdfOutlined, CheckCircleOutlined, LoadingOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';

const { Title, Text } = Typography;
const { Step } = Steps;

const UploadScan: React.FC = () => {
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [result, setResult] = useState<any>(null);

  const handleAnalyze = () => {
    if (fileList.length === 0) return message.error('Vui lòng tải ảnh lên trước!');
    
    setAnalyzing(true);
    setCurrentStep(1); // Chuyển sang bước Phân tích

    // Giả lập thời gian AI chạy (3 giây)
    setTimeout(() => {
      setAnalyzing(false);
      setCurrentStep(2); // Chuyển sang bước Kết quả
      setResult({
        riskLevel: 'HIGH_RISK',
        confidence: 94.5,
        recommendation: 'Phát hiện dấu hiệu Bệnh võng mạc đái tháo đường (DR). Cần thăm khám chuyên sâu.',
        annotatedImage: 'https://www.reviewofoptometry.com/CMSImagesContent/2019/6/059_RO201906-F2.jpg'
      });
      message.success('Phân tích hoàn tất!');
    }, 3000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* HEADER + STEPS */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="mb-6 text-center">
             <Title level={2} className="text-indigo-600 !mb-1">AI Screening Tool</Title>
             <Text type="secondary">Tải lên ảnh đáy mắt (Fundus) để AI chẩn đoán ngay lập tức</Text>
          </div>
          <Steps current={currentStep} className="max-w-3xl mx-auto">
             <Step title="Tải ảnh" icon={<CloudUploadOutlined />} />
             <Step title="AI Phân tích" icon={analyzing ? <LoadingOutlined /> : <ExperimentOutlined />} />
             <Step title="Kết quả" icon={<CheckCircleOutlined />} />
          </Steps>
      </div>

      <Row gutter={24}>
        {/* CỘT TRÁI: UPLOAD */}
        <Col span={24} lg={10}>
          <Card title="1. Upload Hình ảnh" className="shadow-md h-full rounded-xl" bordered={false}>
            <Upload.Dragger
              listType="picture-card"
              maxCount={1}
              showUploadList={{ showPreviewIcon: false }}
              beforeUpload={() => false}
              onRemove={() => { setFileList([]); setResult(null); setCurrentStep(0); }}
              onChange={({ fileList }) => setFileList(fileList)}
              className="bg-gray-50 border-indigo-200 hover:border-indigo-400"
              height={200}
            >
              <p className="ant-upload-drag-icon text-indigo-500"><CloudUploadOutlined className="text-5xl" /></p>
              <p className="ant-upload-text font-medium text-gray-600">Kéo thả ảnh vào đây</p>
              <p className="ant-upload-hint text-xs text-gray-400">Hỗ trợ: JPG, PNG, DICOM</p>
            </Upload.Dragger>

            <Button 
              type="primary" 
              size="large" 
              block 
              className="mt-6 h-12 text-lg font-bold shadow-lg shadow-indigo-200 bg-indigo-600 hover:bg-indigo-700"
              icon={<ExperimentOutlined />}
              loading={analyzing}
              onClick={handleAnalyze}
              disabled={fileList.length === 0}
            >
              {analyzing ? 'AI Đang Xử Lý...' : 'Bắt Đầu Sàng Lọc'}
            </Button>
          </Card>
        </Col>

        {/* CỘT PHẢI: KẾT QUẢ */}
        <Col span={24} lg={14}>
          <Card 
            title="2. Kết quả Chẩn đoán" 
            className={`shadow-md h-full rounded-xl transition-all duration-500 ${result ? 'opacity-100' : 'opacity-60 grayscale'}`}
            bordered={false}
            extra={result && <Button type="dashed" size="small" icon={<FilePdfOutlined />}>Xuất PDF</Button>}
          >
            {analyzing ? (
                <div className="h-64 flex flex-col items-center justify-center space-y-4">
                    <Spin size="large" tip="AI đang phân tích các tổn thương vi mạch..." />
                </div>
            ) : result ? (
              <div className="space-y-5 animate-fade-in">
                <div className="flex justify-between items-center bg-red-50 p-4 rounded-lg border border-red-100">
                  <div>
                    <Text className="text-gray-500 uppercase text-xs font-bold tracking-wider">Mức độ rủi ro</Text>
                    <Title level={3} type="danger" className="!m-0">NGUY CƠ CAO (High)</Title>
                  </div>
                  <div className="text-right">
                    <Text className="block text-gray-500 text-xs">Độ tin cậy</Text>
                    <div className="flex items-center gap-2">
                        <Title level={3} className="!m-0 text-indigo-600">{result.confidence}%</Title>
                    </div>
                  </div>
                </div>

                <div>
                   <Text strong className="mb-2 block">Ảnh đã khoanh vùng tổn thương:</Text>
                   <div className="rounded-lg overflow-hidden border-2 border-indigo-100 relative group">
                      <Image src={result.annotatedImage} width="100%" height={220} className="object-cover group-hover:scale-105 transition-transform duration-500" />
                   </div>
                </div>

                <Alert
                  message="Khuyến nghị y tế"
                  description={result.recommendation}
                  type="warning"
                  showIcon
                  className="border-orange-200 bg-orange-50"
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                <ExperimentOutlined className="text-6xl mb-4 opacity-20" />
                <p>Kết quả sẽ hiển thị tại đây sau khi phân tích</p>
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default UploadScan;