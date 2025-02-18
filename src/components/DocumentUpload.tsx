import React, { useState, useEffect } from 'react';
import { Upload, Button, message, Card, Progress, Alert } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import type { UploadFile, RcFile, UploadFileStatus } from 'antd/es/upload/interface';
import { webhookService } from '../services/webhookService';
import { useAuth } from '../contexts/AuthContext';

interface DocumentUploadProps {
  webhookUrl: string;
  onUploadSuccess?: (response: any) => void;
  onUploadError?: (error: Error) => void;
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({
  webhookUrl,
  onUploadSuccess,
  onUploadError,
}) => {
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const { user, token } = useAuth();

  useEffect(() => {
    if (!webhookUrl) {
      setError('Webhook URL is not configured. Please check your environment variables.');
    } else {
      setError(null);
    }
  }, [webhookUrl]);

  const handleUpload = async () => {
    if (!webhookUrl) {
      message.error('Webhook URL is not configured');
      return;
    }

    const file = fileList[0];
    if (!file) {
      message.error('Please select a file first!');
      return;
    }

    // Get the actual File object
    const fileToUpload = file.originFileObj as File;
    if (!fileToUpload) {
      message.error('Invalid file object');
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      const response = await webhookService.uploadDocument(
        webhookUrl,
        user?.id || '',
        fileToUpload,
        (progress) => {
          setUploadProgress(progress);
        }
      );
      
      message.success('Document uploaded successfully');
      setFileList([]);
      setUploadProgress(0);
      onUploadSuccess?.(response);
    } catch (error) {
      const err = error as Error;
      const errorMessage = err.message || 'Upload failed';
      setError(errorMessage);
      message.error(errorMessage);
      onUploadError?.(err);
    } finally {
      setUploading(false);
    }
  };

  const uploadProps = {
    onRemove: () => {
      setFileList([]);
      setUploadProgress(0);
    },
    beforeUpload: (file: RcFile) => {
      const uploadFile: UploadFile = {
        uid: file.uid || '-1',
        name: file.name,
        status: 'done' as UploadFileStatus,
        size: file.size,
        type: file.type,
        originFileObj: file,
      };
      setFileList([uploadFile]);
      return false; // Prevent automatic upload
    },
    fileList,
    maxCount: 1,
    showUploadList: {
      showPreviewIcon: false,
      showDownloadIcon: false,
      showRemoveIcon: true,
    },
  };

  return (
    <Card title="Upload Document" style={{ marginBottom: 16 }}>
      {error && (
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}
      <Upload {...uploadProps}>
        <Button 
          icon={<UploadOutlined />} 
          disabled={fileList.length > 0 || !webhookUrl}
        >
          Select Document
        </Button>
      </Upload>
      {uploadProgress > 0 && (
        <div style={{ marginTop: 16 }}>
          <Progress
            percent={uploadProgress}
            status={uploadProgress === 100 ? 'success' : 'active'}
            strokeColor={{
              '0%': '#108ee9',
              '100%': '#87d068',
            }}
          />
        </div>
      )}
      <Button
        type="primary"
        onClick={handleUpload}
        disabled={fileList.length === 0 || uploading || !webhookUrl}
        loading={uploading}
        style={{ marginTop: 16 }}
      >
        {uploading ? `Uploading ${uploadProgress}%` : 'Start Upload'}
      </Button>
    </Card>
  );
};

export default DocumentUpload; 