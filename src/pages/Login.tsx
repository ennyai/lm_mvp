import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Typography, Layout, message, Tabs } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const { Title } = Typography;
const { Content } = Layout;

interface AuthFormData {
  email: string;
  password: string;
}

export const Login: React.FC = () => {
  const { signIn, signUp, loading, user } = useAuth();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState('login');

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const onFinish = async (values: AuthFormData) => {
    try {
      if (activeTab === 'login') {
        const user = await signIn(values.email, values.password);
        if (user) {
          message.success('Successfully logged in');
          navigate('/dashboard');
        }
      } else {
        const user = await signUp(values.email, values.password);
        if (user) {
          message.success(
            'Please check your email to confirm your account. After confirming, you can log in.',
            6
          );
          setActiveTab('login');
          form.resetFields();
        }
      }
    } catch (error) {
      // Error is already handled by AuthContext
      form.setFields([
        {
          name: 'password',
          errors: ['Please check your credentials'],
        },
      ]);
    }
  };

  const items = [
    {
      key: 'login',
      label: 'Login',
      children: (
        <Form
          form={form}
          name="login"
          onFinish={onFinish}
          layout="vertical"
          requiredMark={false}
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Please input your email!' },
              { type: 'email', message: 'Please enter a valid email!' },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Email"
              size="large"
              disabled={loading}
            />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please input your password!' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Password"
              size="large"
              disabled={loading}
            />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              block
              loading={loading}
            >
              Log in
            </Button>
          </Form.Item>
        </Form>
      ),
    },
    {
      key: 'signup',
      label: 'Sign Up',
      children: (
        <Form
          form={form}
          name="signup"
          onFinish={onFinish}
          layout="vertical"
          requiredMark={false}
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Please input your email!' },
              { type: 'email', message: 'Please enter a valid email!' },
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="Email"
              size="large"
              disabled={loading}
            />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[
              { required: true, message: 'Please input your password!' },
              { min: 6, message: 'Password must be at least 6 characters!' },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Password"
              size="large"
              disabled={loading}
            />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              block
              loading={loading}
            >
              Sign Up
            </Button>
          </Form.Item>
        </Form>
      ),
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <Content 
        style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          padding: '20px'
        }}
      >
        <Card 
          style={{ 
            width: '100%',
            maxWidth: '420px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            borderRadius: '8px'
          }}
        >
          <Title level={2} style={{ textAlign: 'center', marginBottom: '24px' }}>
            Welcome
          </Title>
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            centered
            items={items}
            style={{ marginTop: '-12px' }}
          />
        </Card>
      </Content>
    </Layout>
  );
}; 