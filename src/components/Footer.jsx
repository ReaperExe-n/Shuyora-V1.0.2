import React from 'react';
import styled from 'styled-components';

const FooterContainer = styled.footer`
  width: 100%;
  padding: 40px 24px;
  background: var(--bg-primary, #0b0b0e);
  border-top: 1px solid var(--border-color, rgba(255, 255, 255, 0.05));
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-top: auto;
  position: relative;
  z-index: 100;
`;

const LogoText = styled.h2`
  font-size: 28px;
  font-weight: 900;
  color: #fff;
  letter-spacing: 2px;
  margin: 0;
  cursor: pointer;
  
  &:hover {
    color: #a881e6;
  }
`;

const Disclaimer = styled.p`
  color: var(--text-muted, #888);
  font-size: 13px;
  text-align: center;
  max-width: 800px;
  line-height: 1.5;
  margin: 0;
`;

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <FooterContainer>
      <LogoText onClick={scrollToTop}>SHUYORA</LogoText>
      <Disclaimer>
        This website does not retain any files on its server. Rather, it solely provides links to media content hosted by third-party services.
      </Disclaimer>
    </FooterContainer>
  );
};

export default Footer;
