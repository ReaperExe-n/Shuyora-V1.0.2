import React from 'react';
import styled from 'styled-components';
import { useNavigate, Link } from 'react-router-dom';
import { 
  FiX, FiHome, FiTrendingUp, FiClock, 
  FiMonitor, FiSun, FiMoon, FiMusic, FiMessageSquare, FiUser
} from 'react-icons/fi';
import { useTheme } from '../context/ThemeContext';

const SidebarOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: var(--overlay);
  backdrop-filter: blur(2px);
  z-index: 2000;
  opacity: ${props => props.isOpen ? 1 : 0};
  visibility: ${props => props.isOpen ? 'visible' : 'hidden'};
  transition: all 0.3s ease;
`;

const SidebarContainer = styled.div`
  position: fixed;
  top: 0;
  left: ${props => props.isOpen ? '0' : '-320px'};
  width: 280px;
  height: 100vh;
  background: var(--bg-primary);
  border-right: 1px solid var(--border-color);
  z-index: 2001;
  transition: left 0.3s ease;
  display: flex;
  flex-direction: column;
  padding: 20px;
  overflow-y: auto;
`;

const SidebarHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
`;

const LogoText = styled.div`
  font-size: 24px;
  font-weight: 900;
  letter-spacing: -1px;
  display: flex;
  align-items: center;
  color: var(--text-primary);
  cursor: pointer;
  span { font-size: 12px; margin-left: 2px; color: var(--text-secondary); margin-top: 6px; }
`;

const CloseBtn = styled.button`
  background: transparent;
  border: 1px solid var(--border-color-strong);
  color: var(--text-primary);
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  &:hover { background: var(--border-color-strong); }
`;

const NavList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
`;

const NavItem = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px 20px;
  background: var(--card-bg);
  border-radius: 12px;
  color: var(--text-primary);
  font-weight: 800;
  font-size: 16px;
  letter-spacing: 0.5px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: var(--card-hover);
    color: var(--text-primary);
  }
`;

const SidebarFooter = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const VersionText = styled.div`
  color: var(--text-secondary);
  font-size: 12px;
  text-align: center;
  font-weight: 600;
  letter-spacing: 0.5px;
  margin-bottom: -6px;
`;



const IconRow = styled.div`
  display: flex;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  overflow: hidden;
  
  .icon-btn {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 12px 0;
    color: var(--text-secondary);
    background: transparent;
    border: none;
    border-right: 1px solid var(--border-color);
    cursor: pointer;
    
    &:last-child {
      border-right: none;
    }
    
    &:hover {
      background: var(--border-color);
      color: var(--text-primary);
    }
    
    &.active {
      color: var(--accent);
    }
  }
`;



const Sidebar = ({ isOpen, onClose, user, setShowAuthModal }) => {
  const navigate = useNavigate();
  const { themeMode, setThemeMode } = useTheme();

  const handleNav = (path, requiresAuth = false) => {
    if (requiresAuth && !user) {
      onClose();
      setShowAuthModal(true);
    } else {
      navigate(path);
      onClose();
    }
  };

  return (
    <>
      <SidebarOverlay isOpen={isOpen} onClick={onClose} />
      <SidebarContainer isOpen={isOpen}>
        <SidebarHeader>
          <LogoText onClick={() => handleNav('/')}>SHUYORA</LogoText>
          <CloseBtn onClick={onClose}><FiX size={16} /></CloseBtn>
        </SidebarHeader>
        
        <NavList>
          <div onClick={() => handleNav('/')}>
            <NavItem><FiHome size={18} /> Home</NavItem>
          </div>

          <div onClick={() => handleNav('/history', true)}>
            <NavItem><FiClock size={18} /> History</NavItem>
          </div>
          <div onClick={() => handleNav('/jukebox', true)}>
            <NavItem><FiMusic size={18} /> OP/ED Jukebox</NavItem>
          </div>
          <div onClick={() => handleNav('/watch-party', true)}>
            <NavItem><FiMessageSquare size={18} /> Watch Party</NavItem>
          </div>
        </NavList>
        
        <SidebarFooter>
          <VersionText>v1.0.0</VersionText>
          <IconRow>
              <button 
                className={`icon-btn ${themeMode === 'system' ? 'active' : ''}`} 
                onClick={() => setThemeMode('system')}
              >
                <FiMonitor size={14} />
              </button>
              <button 
                className={`icon-btn ${themeMode === 'light' ? 'active' : ''}`} 
                onClick={() => setThemeMode('light')}
              >
                <FiSun size={14} />
              </button>
              <button 
                className={`icon-btn ${themeMode === 'dark' ? 'active' : ''}`} 
                onClick={() => setThemeMode('dark')}
              >
                <FiMoon size={14} />
              </button>
          </IconRow>
        </SidebarFooter>
      </SidebarContainer>
    </>
  );
};

export default Sidebar;
