import React, { useState } from 'react';
import { Layout, Menu, Card, Input, Button, List, Spin, message, Typography } from 'antd';
import { FileTextOutlined, SendOutlined, LogoutOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { webhookService } from '../services/webhookService';
import DocumentUpload from '../components/DocumentUpload';
import { WEBHOOK_URLS } from '../config/webhooks';

const { Header, Content, Sider } = Layout;
const { TextArea } = Input;
const { Title } = Typography;

export const Dashboard: React.FC = () => {
  const { user, token, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('upload');
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [queryResults, setQueryResults] = useState<any[]>([]);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login', { replace: true });
    } catch (error) {
      message.error('Failed to sign out');
    }
  };

  const handleQuery = async () => {
    if (!user?.id || !query.trim() || !token) {
      message.error('Please enter a query and ensure you are logged in');
      return;
    }

    try {
      setLoading(true);
      const response = await webhookService.submitQuery(
        WEBHOOK_URLS.QUERY1_REQUEST,
        user.id,
        query,
        token
      );
      
      setQueryResults(response.results || []);
      message.success('Query processed successfully');
    } catch (error) {
      message.error('Failed to process query');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSuccess = (response: any) => {
    message.success('Document uploaded successfully');
    // Additional handling of the response if needed
    console.log('Upload response:', response);
  };

  const handleUploadError = (error: Error) => {
    message.error('Failed to upload document: ' + error.message);
  };

  const menuItems = [
    {
      key: 'upload',
      icon: <FileTextOutlined />,
      label: 'Upload Document',
    },
    {
      key: 'query1',
      icon: <FileTextOutlined />,
      label: 'Business Profile Query',
    },
  ];

  if (!user || !token) {
    return (
      <Layout style={{ minHeight: '100vh' }}>
        <Content style={{ padding: '24px' }}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <Spin />
              <p>Please log in to access the dashboard</p>
            </div>
          </Card>
        </Content>
      </Layout>
    );
  }

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
                <DocumentUpload
                  webhookUrl={WEBHOOK_URLS.DOCUMENT_UPLOAD}
                  onUploadSuccess={handleUploadSuccess}
                  onUploadError={handleUploadError}
                />
              </Card>
            ) : (
              <Card title="Business Profile Query">
                <div style={{ marginBottom: 16 }}>
                  <TextArea
                    rows={4}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Enter your business profile query here..."
                    style={{ marginBottom: 16 }}
                  />
                  <Button
                    type="primary"
                    icon={<SendOutlined />}
                    onClick={handleQuery}
                    disabled={!query.trim() || loading}
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