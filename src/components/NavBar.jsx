import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';
import { FaSearch, FaBars, FaRandom, FaBell, FaTimes, FaStar, FaCalendarAlt, FaFilm, FaClosedCaptioning, FaComments, FaCog, FaBookmark, FaSignOutAlt, FaDiscord, FaCrown, FaPen, FaUserCircle } from 'react-icons/fa';
import Sidebar from './Sidebar';
import NotificationPanel from './NotificationPanel';
import AuthModal from './AuthModal';
import axios from 'axios';

const NavWrapper = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 24px;
  background: var(--bg-primary);
  border-bottom: 1px solid var(--border-color);
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
  box-sizing: border-box;

  @media (max-width: 768px) {
    padding: 0 12px;
    flex-wrap: wrap;
    gap: 10px;
  }
`;

const NavLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const MenuBtn = styled.button`
  background: var(--btn-bg);
  border: 1px solid var(--border-color-strong);
  color: var(--text-primary);
  border-radius: 6px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  &:hover { background: var(--btn-hover); }
`;

const LogoText = styled.div`
  font-size: 20px;
  font-weight: 900;
  letter-spacing: -0.5px;
  display: flex;
  align-items: center;
  color: var(--text-primary);
  cursor: pointer;
  span { font-size: 10px; margin-left: 2px; color: var(--text-secondary); margin-top: 6px; }
`;

const NavCenter = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  position: relative;

  @media (max-width: 768px) {
    order: 3;
    width: 100%;
    justify-content: space-between;
  }
`;

const SearchContainer = styled.form`
  display: flex;
  align-items: center;
  background: var(--btn-bg);
  border: 1px solid var(--border-color-strong);
  border-radius: 8px;
  padding: 6px 12px;
  width: 400px;
  color: var(--text-muted);
  position: relative;
  
  @media (max-width: 768px) {
    width: 100%;
    flex: 1;
  }

  input {
    background: transparent;
    border: none;
    outline: none;
    color: var(--text-primary);
    flex: 1;
    margin-left: 10px;
    font-size: 14px;
  }
`;

const CmdK = styled.div`
  font-size: 12px;
  color: var(--text-secondary);
  border: 1px solid var(--border-color-strong);
  border-radius: 4px;
  padding: 2px 6px;
  background: var(--bg-primary);
  display: flex;
  align-items: center;
  gap: 4px;
`;

const ClearBtn = styled.div`
  cursor: pointer;
  margin-right: 8px;
  color: var(--text-secondary);
  &:hover { color: var(--text-primary); }
  display: flex;
  align-items: center;
`;

const IconButton = styled.button`
  background: var(--btn-bg);
  border: 1px solid var(--border-color-strong);
  color: var(--text-secondary);
  border-radius: 8px;
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  &:hover { background: var(--btn-hover); color: var(--text-primary); }
`;

const MobileSearchButton = styled(IconButton)`
  display: none;
  @media (max-width: 768px) {
    display: flex;
  }
`;

const NavRight = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;

  @media (max-width: 768px) {
    gap: 4px;
  }
`;

const Avatar = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 6px;
  background: var(--btn-hover);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 16px;
  color: var(--text-primary);
  cursor: pointer;
`;


/* Search Dropdown Styles */
const DropdownWrapper = styled.div`
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  width: calc(100vw - 32px);
  max-width: 400px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color-strong);
  border-radius: 8px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
  overflow: hidden;
  z-index: 1001;
`;

const DropdownList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  max-height: 400px;
  overflow-y: auto;
`;

const DropdownItem = styled.li`
  display: flex;
  gap: 12px;
  padding: 10px 16px;
  cursor: pointer;
  background: ${(props) => props.active ? 'var(--btn-hover)' : 'transparent'};
  transition: background 0.1s;
  
  &:hover {
    background: var(--btn-hover);
  }
`;

const ItemPoster = styled.img`
  width: 40px;
  height: 56px;
  object-fit: cover;
  border-radius: 4px;
  background: var(--bg-primary);
`;

const ItemInfo = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  flex: 1;
  overflow: hidden;
`;

const ItemTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 4px;
`;

const ItemMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  color: var(--text-secondary);
  font-weight: bold;
`;

const MetaBadge = styled.span`
  background: rgba(255, 255, 255, 0.06);
  padding: 3px 7px;
  border-radius: 4px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.3px;
  color: var(--text-secondary);
  white-space: nowrap;

  svg {
    opacity: 0.6;
    flex-shrink: 0;
  }

  &.format {
    color: #a881e6;
    background: rgba(168, 129, 230, 0.1);
  }
  &.rating {
    color: #f59e0b;
    background: rgba(245, 158, 11, 0.1);
  }
`;

const DropdownFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 16px;
  background: var(--bg-primary);
  border-top: 1px solid var(--border-color-strong);
  font-size: 11px;
  color: var(--text-secondary);
`;

const ViewAllBtn = styled.button`
  background: transparent;
  border: none;
  color: var(--text-primary);
  font-size: 12px;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  &:hover { text-decoration: underline; }
`;

const API_BASE = `http://${window.location.hostname}:8000`;

const ProfileDropdown = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 12px;
  width: 280px;
  background: #1e1e24;
  border-radius: 8px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.8);
  border: 1px solid rgba(255,255,255,0.1);
  overflow: hidden;
  z-index: 1001;

  @media (max-width: 768px) {
    top: 50px;
  }

  @media (max-width: 480px) {
    width: 240px;
    right: 0;
  }
`;

const ProfileHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: #25252b;
  border-bottom: 1px solid rgba(255,255,255,0.05);
`;

const HeaderInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const HeaderName = styled.div`
  font-weight: bold;
  font-size: 15px;
  color: #fff;
`;

const EditIcon = styled.div`
  color: #aaa;
  cursor: pointer;
  &:hover { color: #fff; }
`;

const PremiumBtn = styled.button`
  width: calc(100% - 32px);
  margin: 16px;
  background: #f7a600;
  color: #000;
  border: none;
  border-radius: 4px;
  padding: 10px;
  font-weight: 800;
  font-size: 13px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  &:hover { background: #d99100; }
`;

const MenuList = styled.div`
  display: flex;
  flex-direction: column;
`;

const MenuItem = styled.div`
  padding: 16px 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  cursor: pointer;
  color: ${p => p.accent ? '#ff7e00' : '#e0e0e0'};
  font-size: 14.5px;
  font-weight: 500;
  border-bottom: 1px solid rgba(255,255,255,0.05);
  transition: 0.2s;
  
  &:last-child {
    border-bottom: none;
  }
  
  &:hover { background: rgba(255,255,255,0.05); }
  
  svg {
    font-size: 18px;
    color: ${p => p.accent ? '#ff7e00' : '#aaaaaa'};
  }
`;

const DiscordBtn = styled.button`
  width: calc(100% - 32px);
  margin: 16px;
  background: #5865F2;
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 12px;
  font-weight: 700;
  font-size: 14px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  &:hover { background: #4752C4; }
`;

const AvatarWrapper = styled.div`
  position: relative;
`;

const NavBar = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const searchRef = useRef(null);
  const inputRef = useRef(null);
  
  // Ctrl+K to focus search
  useEffect(() => {
    const handleGlobalKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleGlobalKey);
    return () => window.removeEventListener('keydown', handleGlobalKey);
  }, []);
  
  // Debounce search fetching
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!searchQuery.trim()) {
        setSuggestions([]);
        setIsDropdownOpen(false);
        return;
      }
      try {
        const API_BASE = import.meta.env.VITE_API_BASE || `http://${window.location.hostname}:4001`;
        const res = await axios.get(`${API_BASE}/api/search?q=${encodeURIComponent(searchQuery.trim())}`);
        setSuggestions(res.data || []);
        setIsDropdownOpen(true);
        setSelectedIndex(-1);
      } catch (err) {
        console.error("Failed to fetch suggestions", err);
      }
    };
    
    const timeoutId = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
      if (!e.target.closest('#profile-menu-container')) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  const handleRandomAnime = async () => {
    try {
      const page = Math.floor(Math.random() * 5) + 1;
      const res = await axios.get(`${API_BASE}/trending?page=${page}`);
      const animeList = res.data.results;
      if (animeList && animeList.length > 0) {
        const randomAnime = animeList[Math.floor(Math.random() * animeList.length)];
        navigate(`/watch/${randomAnime.id}`);
      }
    } catch (err) {
      console.error("Failed to fetch random anime", err);
    }
  };

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      setIsDropdownOpen(false);
      navigate(`/search/${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleKeyDown = (e) => {
    if (!isDropdownOpen || suggestions.length === 0) return;
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
        setIsDropdownOpen(false);
        navigate(`/watch/${suggestions[selectedIndex].id}`);
      } else {
        handleSearchSubmit();
      }
    } else if (e.key === 'Escape') {
      setIsDropdownOpen(false);
    }
  };

  return (
    <>
      <NavWrapper>
        <NavLeft>
          <MenuBtn onClick={() => setIsSidebarOpen(true)}><FaBars /></MenuBtn>
          <LogoText onClick={() => navigate('/')}>SHUYORA</LogoText>
        </NavLeft>
        <NavCenter>
          <div ref={searchRef} style={{ position: 'relative' }}>
            <SearchContainer onSubmit={handleSearchSubmit}>
              <FaSearch size={14} />
              <input 
                ref={inputRef}
                type="text" 
                placeholder="Search Anime" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.trim() && setIsDropdownOpen(true)}
                onKeyDown={handleKeyDown}
              />
              {searchQuery && (
                <ClearBtn onClick={() => { setSearchQuery(''); setIsDropdownOpen(false); }}>
                  <FaTimes size={12} />
                </ClearBtn>
              )}
            </SearchContainer>
            
            {isDropdownOpen && suggestions.length > 0 && (
              <DropdownWrapper>
                <DropdownList>
                  {suggestions.map((item, index) => (
                    <DropdownItem 
                      key={item.id} 
                      active={index === selectedIndex}
                      onMouseEnter={() => setSelectedIndex(index)}
                      onClick={() => {
                        setIsDropdownOpen(false);
                        navigate(`/watch/${item.id}`);
                      }}
                    >
                      <ItemPoster src={item.coverImage} alt={item.title_english || item.title_romaji} />
                      <ItemInfo>
                        <ItemTitle>{item.title_english || item.title_romaji}</ItemTitle>
                        <ItemMeta>
                        {item.format && <MetaBadge className="format">{item.format}</MetaBadge>}
                          {item.seasonYear && <MetaBadge><FaCalendarAlt size={9} /> {item.seasonYear}</MetaBadge>}
                          {item.episodes && <MetaBadge><FaFilm size={9} /> {item.episodes}</MetaBadge>}
                          {item.averageScore && <MetaBadge className="rating"><FaStar size={9} /> {(item.averageScore / 10).toFixed(1)}</MetaBadge>}
                        </ItemMeta>
                      </ItemInfo>
                    </DropdownItem>
                  ))}
                </DropdownList>
              </DropdownWrapper>
            )}
          </div>
          <MobileSearchButton onClick={handleSearchSubmit}><FaSearch size={16}/></MobileSearchButton>
          <IconButton onClick={handleRandomAnime} title="Watch Random Anime"><FaRandom size={16}/></IconButton>
        </NavCenter>
        <NavRight>
          <div onClick={() => user ? navigate('/watch-party') : setShowAuthModal(true)} style={{textDecoration: 'none', color: 'inherit'}}>
            <IconButton title="Watch Party"><FaComments size={18} /></IconButton>
          </div>
          <IconButton title="Notifications" onClick={() => setShowNotifications(true)}><FaBell size={18} /></IconButton>
          <AvatarWrapper id="profile-menu-container">
            <Avatar onClick={() => setShowProfileMenu(!showProfileMenu)} style={{cursor: 'pointer', background: 'transparent'}}>
              {user ? (
                user.avatar ? (
                  <img loading="lazy" src={user.avatar} alt="Profile" style={{width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%'}} />
                ) : (
                  <img loading="lazy" src={`https://api.dicebear.com/9.x/lorelei/svg?seed=${user.username}`} alt="Profile" style={{width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%'}} />
                )
              ) : (
                <img loading="lazy" src={`https://api.dicebear.com/9.x/lorelei/svg?seed=Guest`} alt="Profile" style={{width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%'}} />
              )}
            </Avatar>
            {showProfileMenu && (
              <ProfileDropdown>
                {user ? (
                  <>
                    <ProfileHeader>
                      <HeaderInfo>
                        <Avatar style={{width: '42px', height: '42px', fontSize: '18px', fontWeight: 'bold', borderRadius: '8px', background: 'transparent'}}>
                          {user.avatar ? <img loading="lazy" src={user.avatar} alt="Profile" style={{width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px'}} /> : <img loading="lazy" src={`https://api.dicebear.com/9.x/lorelei/svg?seed=${user.username}`} alt="Profile" style={{width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px'}} />}
                        </Avatar>
                        <HeaderName style={{fontSize: '16px'}}>{user.username}</HeaderName>
                      </HeaderInfo>
                      <Link to="/profile" style={{color: 'inherit'}}><EditIcon><FaPen size={14}/></EditIcon></Link>
                    </ProfileHeader>
                    
                    <MenuList>
                      <MenuItem accent><FaCog /> Settings</MenuItem>
                      <MenuItem><FaBookmark /> Watchlist</MenuItem>
                      <MenuItem onClick={handleLogout}><FaSignOutAlt /> Log Out</MenuItem>
                    </MenuList>
                  </>
                ) : (
                  <>
                    <ProfileHeader>
                      <HeaderName>Welcome to Shuyora!</HeaderName>
                    </ProfileHeader>
                    <MenuList style={{borderBottom: 'none'}}>
                      <MenuItem onClick={() => { setShowProfileMenu(false); setShowAuthModal(true); }}>
                        <FaUserCircle size={16}/> Login / Register
                      </MenuItem>
                    </MenuList>
                  </>
                )}
              </ProfileDropdown>
            )}
          </AvatarWrapper>
        </NavRight>
      </NavWrapper>
      
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} user={user} setShowAuthModal={setShowAuthModal} />
      <NotificationPanel 
        isOpen={showNotifications} 
        onClose={() => setShowNotifications(false)} 
        user={userStr ? JSON.parse(userStr) : null}
        setShowAuthModal={setShowAuthModal}
      />
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  );
};

export default NavBar;


