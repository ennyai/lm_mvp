import React, { useState } from 'react';
import { Layout, Menu, Card, Upload, Input, Button, List, Spin, message, Typography } from 'antd';
import { UploadOutlined, FileTextOutlined, SendOutlined, LogoutOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { webhookService } from '../services/webhookService';
import { ExtendedUser } from '../types/auth';

const { Header, Content, Sider } = Layout;
const { TextArea } = Input;
const { Title } = Typography;

export const Dashboard: React.FC = () => {
  const { user, profile, signOut } = useAuth();
  const extendedUser = user as ExtendedUser;
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('upload');
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [queryResults, setQueryResults] = useState<any[]>([]);

  const handleSignOut = async () => {
    try {
      setLoading(true);
      await signOut();
      // Force navigation to login page
      navigate('/login', { replace: true });
    } catch (error) {
      message.error('Failed to sign out');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (file: File) => {
    if (!profile?.client_id) {
      message.error('Client ID not found');
      return false;
    }

    try {
      setLoading(true);
      // TODO: Implement actual file upload to storage
      const documentUrl = `https://example.com/documents/${file.name}`;
      
      await webhookService.uploadDocument(
        'YOUR_WEBHOOK_ENDPOINT',
        profile.client_id,
        documentUrl,
        extendedUser?.access_token || ''
      );

      message.success('Document uploaded successfully');
      return false; // Prevent default upload behavior
    } catch (error) {
      message.error('Failed to upload document');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleQuery = async () => {
    if (!profile?.client_id || !query.trim()) {
      message.error('Please enter a query');
      return;
    }

    try {
      setLoading(true);
      const response = await webhookService.submitQuery(
        'YOUR_WEBHOOK_ENDPOINT',
        profile.client_id,
        query,
        extendedUser?.access_token || ''
      );
      
      setQueryResults(response.results || []);
      message.success('Query processed successfully');
    } catch (error) {
      message.error('Failed to process query');
    } finally {
      setLoading(false);
    }
  };

  const menuItems = [
    {
      key: 'upload',
      icon: <UploadOutlined />,
      label: 'Upload Document',
    },
    {
      key: 'query1',
      icon: <FileTextOutlined />,
      label: 'Business Profile',
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Title level={4} style={{ color: 'white', margin: 0 }}>
          Lean Marketing | Business Intelligence
        </Title>
        <Button 
          type="text" 
          icon={<LogoutOutlined />} 
          onClick={handleSignOut}
          style={{ color: 'white' }}
        >
          Sign Out
        </Button>
      </Header>
      <Layout>
        <Sider width={200} theme="light">
          <Menu
            mode="inline"
            selectedKeys={[activeTab]}
            style={{ height: '100%', borderRight: 0 }}
            items={menuItems}
            onClick={({ key }) => setActiveTab(key)}
          />
        </Sider>
        <Layout style={{ padding: '24px' }}>
          <Content style={{ background: '#fff', padding: 24, margin: 0, borderRadius: 8 }}>
            {loading && (
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                <Spin size="large" />
              </div>
            )}
            
            {activeTab === 'upload' ? (
              <Card title="Upload Document">
                <Upload.Dragger
                  name="file"
                  multiple={false}
                  beforeUpload={handleUpload}
                  showUploadList={true}
                >
                  <p className="ant-upload-drag-icon">
                    <UploadOutlined />
                  </p>
                  <p className="ant-upload-text">Click or drag file to this area to upload</p>
                  <p className="ant-upload-hint">
                    Support for single file upload. Strictly prohibited from uploading company data or other
                    banned files.
                  </p>
                </Upload.Dragger>
              </Card>
            ) : (
              <Card title="Business Profile">
                <div style={{ marginBottom: 16 }}>
                  <TextArea
                    rows={4}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Enter your query here..."
                    style={{ marginBottom: 16 }}
                  />
                  <Button
                    type="primary"
                    icon={<SendOutlined />}
                    onClick={handleQuery}
                    disabled={!query.trim()}
                  >
                    Submit Query
                  </Button>
                </div>
                {queryResults.length > 0 && (
                  <List
                    itemLayout="vertical"
                    dataSource={queryResults}
                    renderItem={(item) => (
                      <List.Item>
                        <Card>{JSON.stringify(item)}</Card>
                      </List.Item>
                    )}
                  />
                )}
              </Card>
            )}
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
}; 