import React, { useState } from 'react';
import styled from 'styled-components';
import { FiX, FiLock, FiUser } from 'react-icons/fi';
import { FaDiscord } from 'react-icons/fa';
import { SiAnilist } from 'react-icons/si';
import axios from 'axios';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.7);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  width: 90%;
  max-width: 400px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0,0,0,0.5);
  animation: slideUp 0.3s ease-out;

  @keyframes slideUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid var(--border-color);
  
  h2 { margin: 0; font-size: 18px; color: #fff; }
`;

const CloseBtn = styled.button`
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  
  &:hover { color: #fff; }
`;

const ModalBody = styled.div`
  padding: 24px;
`;

const Tabs = styled.div`
  display: flex;
  position: relative;
  border-bottom: 1px solid var(--border-color);
  margin-bottom: 24px;
`;

const Tab = styled.button`
  flex: 1;
  background: none;
  border: none;
  padding: 12px;
  color: ${p => p.active ? 'var(--text-primary)' : 'var(--text-secondary)'};
  font-weight: 600;
  cursor: pointer;
  transition: color 0.3s ease;
  position: relative;
  z-index: 1;
  
  &:hover {
    color: var(--text-primary);
  }
`;

const TabIndicator = styled.div`
  position: absolute;
  bottom: -1px;
  left: ${p => p.activeTab === 'login' ? '0' : '50%'};
  width: 50%;
  height: 2px;
  background: var(--accent-color);
  transition: left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
`;

const FormWrapper = styled.div`
  animation: fadeSlide 0.3s ease forwards;
  
  @keyframes fadeSlide {
    0% { opacity: 0; transform: translateX(10px); }
    100% { opacity: 1; transform: translateX(0); }
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const InputGroup = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  
  svg {
    position: absolute;
    left: 14px;
    color: var(--text-secondary);
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 12px 12px 40px;
  background: rgba(0,0,0,0.2);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: #fff;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: var(--accent-color);
  }
`;

const SubmitBtn = styled.button`
  background: var(--accent-color);
  color: #fff;
  border: none;
  padding: 14px;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
  margin-top: 8px;
  
  &:hover {
    filter: brightness(1.1);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ErrorMsg = styled.div`
  color: #ff4757;
  font-size: 13px;
  text-align: center;
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  margin: 24px 0;
  color: var(--text-secondary);
  font-size: 12px;
  text-transform: uppercase;
  
  &::before, &::after {
    content: '';
    flex: 1;
    border-bottom: 1px solid var(--border-color);
  }
  
  span {
    padding: 0 12px;
  }
`;

const SocialBtn = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 12px;
  border-radius: 8px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  margin-bottom: 12px;
  transition: 0.2s;
  
  &:hover {
    background: var(--btn-hover);
    color: var(--text-primary);
  }
  
  &.discord svg {
    color: #5865F2;
  }
  
  &.anilist svg {
    color: #02A9FF;
  }
`;

const AuthModal = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const endpoint = activeTab === 'login' ? '/login' : '/register';
      const res = await axios.post(`http://${window.location.hostname}:4001${endpoint}`, { username, password });
      
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('user', JSON.stringify(res.data.user));
      
      window.location.reload();
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred. Please try again.');
    }
    setLoading(false);
  };

  const handleOAuth = (provider) => {
    window.location.href = `http://${window.location.hostname}:4001/auth/${provider}`;
  };

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={e => e.stopPropagation()}>
        <ModalHeader>
          <h2>{activeTab === 'login' ? 'Welcome Back' : 'Create Account'}</h2>
          <CloseBtn onClick={onClose}><FiX size={20} /></CloseBtn>
        </ModalHeader>
        
        <ModalBody>
          <Tabs>
            <Tab active={activeTab === 'login'} onClick={() => setActiveTab('login')}>Login</Tab>
            <Tab active={activeTab === 'register'} onClick={() => setActiveTab('register')}>Register</Tab>
            <TabIndicator activeTab={activeTab} />
          </Tabs>
          
          <FormWrapper key={activeTab}>
            <Form onSubmit={handleSubmit}>
            <InputGroup>
              <FiUser size={16} />
              <Input 
                type="text" 
                placeholder="Username" 
                value={username} 
                onChange={e => setUsername(e.target.value)} 
                required 
              />
            </InputGroup>
            
            <InputGroup>
              <FiLock size={16} />
              <Input 
                type="password" 
                placeholder="Password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                required 
              />
            </InputGroup>
            
            {error && <ErrorMsg>{error}</ErrorMsg>}
            
            <SubmitBtn type="submit" disabled={loading}>
              {loading ? 'Processing...' : (activeTab === 'login' ? 'Sign In' : 'Sign Up')}
            </SubmitBtn>
          </Form>
          </FormWrapper>
          
          <Divider><span>Or continue with</span></Divider>
          
          <SocialBtn type="button" className="discord" onClick={() => handleOAuth('discord')}>
            <FaDiscord size={18} /> Discord
          </SocialBtn>
          <SocialBtn type="button" className="anilist" onClick={() => handleOAuth('anilist')}>
            <SiAnilist size={18} /> AniList
          </SocialBtn>
          
        </ModalBody>
      </ModalContent>
    </ModalOverlay>
  );
};

export default AuthModal;
