import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { FiX, FiChevronDown, FiSearch, FiArrowLeft } from 'react-icons/fi';

const PageContainer = styled.div`
  width: 100%;
  min-height: 100vh;
  background: #0f0f13;
  color: #fff;
  padding: 24px;
  display: flex;
  gap: 30px;
  
  @media (max-width: 900px) {
    flex-direction: column;
  }
`;

const MainContent = styled.div`
  flex: 1;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 24px;
  
  .back-btn {
    background: transparent;
    border: none;
    color: #fff;
    font-size: 24px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 8px;
    border-radius: 50%;
    margin-right: 16px;
    transition: background 0.2s;
    
    &:hover {
      background: rgba(255,255,255,0.1);
    }
  }
  
  h2 {
    margin: 0;
    font-size: 24px;
    font-weight: 700;
  }
`;

const SidebarContainer = styled.div`
  width: 280px;
  flex-shrink: 0;
  
  @media (max-width: 900px) {
    width: 100%;
  }
`;

const DateGroup = styled.div`
  margin-bottom: 30px;
  position: relative;
`;

const DateBadge = styled.div`
  display: inline-flex;
  align-items: center;
  background: #1e1e24;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 700;
  margin-bottom: 16px;
  
  span {
    background: #2a2a32;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 11px;
    margin-left: 8px;
    color: #a0a0a0;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;

  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 12px;
  }
`;

const HistoryCard = styled.div`
  cursor: pointer;
  
  .thumb-wrapper {
    position: relative;
    width: 100%;
    aspect-ratio: 16/9;
    border-radius: 6px;
    overflow: hidden;
    background: #1a1a20;
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    .remove-btn {
      position: absolute;
      top: 6px;
      right: 6px;
      background: rgba(0,0,0,0.5);
      border: none;
      color: #fff;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      opacity: 0;
      transition: opacity 0.2s;
      
      &:hover {
        background: rgba(255,255,255,0.2);
      }
    }
    
    .ep-badge {
      position: absolute;
      bottom: 10px;
      left: 6px;
      background: rgba(0,0,0,0.7);
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 700;
    }
    
    .time-badge {
      position: absolute;
      bottom: 10px;
      right: 6px;
      background: rgba(0,0,0,0.7);
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 10px;
      font-weight: 600;
    }
    
    .progress-bar {
      position: absolute;
      bottom: 0;
      left: 0;
      height: 3px;
      background: #e50914; /* Red like youtube/netflix */
    }
  }
  
  &:hover .remove-btn {
    opacity: 1;
  }
  
  .title {
    margin-top: 8px;
    font-size: 13px;
    font-weight: 500;
    color: #e0e0e0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

const SidePanel = styled.div`
  background: #141419;
  border-radius: 8px;
  padding: 16px;
  border: 1px solid #2a2a32;
  margin-bottom: 16px;
`;

const SelectBox = styled.div`
  background: #1e1e24;
  padding: 10px 14px;
  border-radius: 6px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  margin-bottom: 16px;
  
  &:hover {
    background: #2a2a32;
  }
`;

const ToggleRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  font-size: 13px;
  color: #a0a0a0;
  font-weight: 500;
  
  .toggle {
    width: 32px;
    height: 18px;
    background: #fff;
    border-radius: 9px;
    position: relative;
    cursor: pointer;
    
    &::after {
      content: '';
      position: absolute;
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background: #1e1e24;
      top: 2px;
      left: 2px;
      transition: 0.2s;
    }
  }
`;

const Tabs = styled.div`
  display: flex;
  background: #1e1e24;
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 16px;
`;

const Tab = styled.div`
  flex: 1;
  text-align: center;
  padding: 8px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  background: ${props => props.active ? 'transparent' : 'rgba(0,0,0,0.2)'};
  color: ${props => props.active ? '#fff' : '#666'};
`;

const SearchBox = styled.div`
  position: relative;
  
  input {
    width: 100%;
    background: #1e1e24;
    border: 1px solid #2a2a32;
    border-radius: 6px;
    padding: 10px 10px 10px 32px;
    color: #fff;
    font-size: 13px;
    
    &:focus {
      outline: none;
      border-color: #a881e6;
    }
  }
  
  svg {
    position: absolute;
    left: 10px;
    top: 50%;
    transform: translateY(-50%);
    color: #666;
  }
`;

const formatTime = (seconds) => {
  if (!seconds || isNaN(seconds)) return "00:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
};

const History = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem('watchHistory') || '[]');
    setHistory(data);
  }, []);

  const removeItem = (e, indexToRemove, originalItem) => {
    e.stopPropagation();
    const updated = history.filter(item => !(item.animeId === originalItem.animeId && item.episodeNumber === originalItem.episodeNumber));
    setHistory(updated);
    localStorage.setItem('watchHistory', JSON.stringify(updated));
  };

  const groupHistory = () => {
    const groups = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    history.forEach(item => {
      const d = new Date(item.watchedAt);
      d.setHours(0, 0, 0, 0);
      let groupName = d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
      
      if (d.getTime() === today.getTime()) {
        groupName = "Today";
      } else if (d.getTime() === yesterday.getTime()) {
        groupName = "Yesterday";
      }

      if (!groups[groupName]) groups[groupName] = [];
      groups[groupName].push(item);
    });
    
    return Object.keys(groups).map(key => ({
      dateLabel: key,
      items: groups[key]
    }));
  };

  const grouped = groupHistory();

  return (
    <PageContainer>
      <MainContent>
        <Header>
          <button className="back-btn" onClick={() => navigate(-1)}>
            <FiArrowLeft />
          </button>
          <h2>Watch History</h2>
        </Header>
        {grouped.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>No watch history found.</div>
        ) : (
          grouped.map((group, idx) => (
            <DateGroup key={idx}>
              <DateBadge>{group.dateLabel} <span>{group.items.length}</span></DateBadge>
              <Grid>
                {group.items.map((item, i) => (
                  <HistoryCard key={i} onClick={() => navigate(`/watch/${item.animeId}`)}>
                    <div className="thumb-wrapper">
                      <img src={item.image} alt={item.title} />
                      <button className="remove-btn" onClick={(e) => removeItem(e, i, item)}>
                        <FiX />
                      </button>
                      <div className="ep-badge">EP {item.episodeNumber}</div>
                      <div className="time-badge">{formatTime(item.currentTime)}/{formatTime(item.duration)}</div>
                      <div className="progress-bar" style={{ width: `${Math.min((item.currentTime / (item.duration || 1)) * 100, 100)}%` }} />
                    </div>
                    <div className="title">{item.title}</div>
                  </HistoryCard>
                ))}
              </Grid>
            </DateGroup>
          ))
        )}
      </MainContent>


    </PageContainer>
  );
};

export default History;
