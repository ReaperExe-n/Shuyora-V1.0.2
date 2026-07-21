import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: var(--bg-color);
  color: #fff;
`;

const Spinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-left-color: var(--accent-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const OAuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const token = searchParams.get('token');
    const userStr = searchParams.get('user');

    if (token && userStr) {
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('user', userStr);
      
      // Navigate to home after a brief delay for UX
      setTimeout(() => navigate('/'), 1000);
    } else {
      navigate('/');
    }
  }, [location, navigate]);

  return (
    <Container>
      <Spinner />
      <h2>Authenticating...</h2>
      <p>Securely logging you into Shuyora</p>
    </Container>
  );
};

export default OAuthCallback;
