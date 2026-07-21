import React from 'react';
import styled from 'styled-components';

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: var(--bg-primary, #0b0b0e);
  color: var(--text-primary, #fff);
  padding: 24px;
  text-align: center;
`;

const ErrorTitle = styled.h1`
  font-size: 2rem;
  color: #ff4d4d;
  margin-bottom: 16px;
`;

const ErrorMessage = styled.p`
  font-size: 1.1rem;
  color: #aaa;
  margin-bottom: 32px;
  max-width: 600px;
  line-height: 1.6;
`;

const ReloadButton = styled.button`
  background: #a881e6;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #9b70de;
  }
`;

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorContainer>
          <ErrorTitle>Oops! Something went wrong.</ErrorTitle>
          <ErrorMessage>
            We encountered an unexpected error. Please try refreshing the page. If the problem persists, please contact support.
            <br/><br/>
            <span style={{ fontSize: '0.85rem', color: '#555' }}>{this.state.error?.toString()}</span>
          </ErrorMessage>
          <ReloadButton onClick={() => window.location.reload()}>Reload Page</ReloadButton>
        </ErrorContainer>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;
