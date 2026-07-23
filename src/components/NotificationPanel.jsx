import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaTimes, FaSync, FaCheck, FaUserCircle, FaPlay, FaBell } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(2px);
  z-index: 2000;
  opacity: ${props => props.isOpen ? 1 : 0};
  visibility: ${props => props.isOpen ? 'visible' : 'hidden'};
  transition: all 0.3s ease;
`;

const Panel = styled.div`
  position: fixed;
  top: 0;
  right: ${props => props.isOpen ? '0' : '-400px'};
  width: 400px;
  height: 100vh;
  background: #0f0f0f;
  z-index: 2001;
  transition: right 0.3s ease;
  display: flex;
  flex-direction: column;
  box-shadow: -5px 0 25px rgba(0,0,0,0.5);
  @media (max-width: 500px) { width: 100vw; right: ${props => props.isOpen ? '0' : '-100vw'}; }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid rgba(255,255,255,0.05);
`;

const Title = styled.h2`
  margin: 0;
  font-size: 1.2rem;
  color: #fff;
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const ActionBtn = styled.button`
  background: transparent;
  border: 1px solid rgba(255,255,255,0.1);
  color: #ccc;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: 0.2s;
  &:hover { background: rgba(255,255,255,0.1); color: #fff; }
`;

const MarkReadBtn = styled.button`
  background: transparent;
  border: 1px solid rgba(255,255,255,0.1);
  color: #ccc;
  border-radius: 16px;
  padding: 0 12px;
  height: 32px;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  font-weight: bold;
  cursor: pointer;
  transition: 0.2s;
  &:hover { background: rgba(255,255,255,0.1); color: #fff; }
`;

const Content = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  
  /* Scrollbar styles */
  &::-webkit-scrollbar { width: 6px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }
`;

const CenterContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 16px;
  color: #888;
  padding: 40px;
  text-align: center;
`;

const LoginBtn = styled.button`
  background: var(--primary-color, #ffdd95);
  border: none;
  color: #000;
  border-radius: 6px;
  padding: 12px 24px;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  transition: 0.2s;
  &:hover { filter: brightness(1.1); transform: translateY(-2px); }
`;

const NotificationItem = styled.div`
  display: flex;
  gap: 12px;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255,255,255,0.03);
  cursor: pointer;
  transition: background 0.2s;
  
  &:hover {
    background: rgba(255,255,255,0.02);
  }
`;

const NotifImage = styled.div`
  width: 50px;
  height: 70px;
  border-radius: 4px;
  background-image: url(${props => props.src});
  background-size: cover;
  background-position: center;
  flex-shrink: 0;
`;

const NotifBody = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  flex: 1;
`;

const NotifTitle = styled.h4`
  margin: 0 0 4px 0;
  font-size: 0.95rem;
  color: #fff;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const NotifSubtitle = styled.span`
  font-size: 0.8rem;
  color: var(--primary-color, #ffdd95);
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const NotificationPanel = ({ isOpen, onClose, user, setShowAuthModal }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const API_BASE = import.meta.env.VITE_API_BASE || `http://${window.location.hostname}:8000`;
      const res = await axios.get(`${API_BASE}/recent?page=1`);
      setNotifications(res.data.results || []);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isOpen && user && notifications.length === 0) {
      fetchNotifications();
    }
  }, [isOpen, user]);

  const handleLoginClick = () => {
    onClose();
    if (setShowAuthModal) setShowAuthModal(true);
  };

  const handleNotificationClick = (id) => {
    onClose();
    navigate(`/watch/${id}`);
  };

  return (
    <>
      <Overlay isOpen={isOpen} onClick={onClose} />
      <Panel isOpen={isOpen}>
        <Header>
          <Title>Notifications</Title>
          <HeaderActions>
            {user && <ActionBtn title="Refresh" onClick={fetchNotifications}><FaSync size={12} className={loading ? 'spin' : ''} /></ActionBtn>}
            <MarkReadBtn><FaCheck size={12} /> Mark all read</MarkReadBtn>
            <ActionBtn onClick={onClose} title="Close"><FaTimes size={14} /></ActionBtn>
          </HeaderActions>
        </Header>
        
        <Content>
          {!user ? (
            <CenterContent>
              <FaUserCircle size={48} color="#333" />
              <p>You must be logged in to view your notifications.</p>
              <LoginBtn onClick={handleLoginClick}>
                Login / Register
              </LoginBtn>
            </CenterContent>
          ) : loading ? (
            <CenterContent>
              <FaSync size={24} className="spin" color="#555" />
              <span>Checking for new releases...</span>
            </CenterContent>
          ) : notifications.length > 0 ? (
            notifications.map((notif, index) => (
              <NotificationItem key={index} onClick={() => handleNotificationClick(notif.id)}>
                <NotifImage src={notif.coverImage?.extraLarge || notif.coverImage?.large || notif.image} />
                <NotifBody>
                  <NotifTitle>{notif.title.english || notif.title.romaji || notif.title.native}</NotifTitle>
                  <NotifSubtitle>
                    <FaPlay size={10} /> {notif.episodeNumber ? `Episode ${notif.episodeNumber}` : "New Episode"} Available Now
                  </NotifSubtitle>
                </NotifBody>
              </NotificationItem>
            ))
          ) : (
            <CenterContent>
              <FaBell size={32} color="#333" />
              <p>No new notifications right now.</p>
            </CenterContent>
          )}
        </Content>
      </Panel>
      
      <style dangerouslySetInnerHTML={{__html: `
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}} />
    </>
  );
};

export default NotificationPanel;
