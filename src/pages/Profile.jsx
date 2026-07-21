import toast from 'react-hot-toast';
import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import NavBar from '../components/NavBar';
import { FaUserCircle, FaCoins, FaGift, FaSignOutAlt, FaCamera } from 'react-icons/fa';

const API_URL = `http://${window.location.hostname}:4000`;

const Container = styled.div`
  min-height: 100vh;
  background: var(--bg-primary);
  color: #fff;
  padding-bottom: 50px;
`;

const Banner = styled.div`
  width: 100%;
  height: 250px;
  background: linear-gradient(135deg, #1e1e28 0%, #0f0f13 100%);
  position: relative;
  overflow: hidden;
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0; left: 0; right: 0;
    height: 100px;
    background: linear-gradient(to top, var(--bg-primary) 0%, transparent 100%);
  }
`;

const BannerDecor = styled.div`
  position: absolute;
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(168,129,230,0.15) 0%, transparent 70%);
  top: -100px;
  right: -100px;
  border-radius: 50%;
  filter: blur(40px);
`;

const Content = styled.div`
  max-width: 1000px;
  margin: -100px auto 0;
  padding: 0 20px;
  position: relative;
  z-index: 10;
`;

const ProfileCard = styled.div`
  background: rgba(30, 30, 36, 0.6);
  backdrop-filter: blur(12px);
  border-radius: 16px;
  padding: 30px;
  border: 1px solid rgba(255,255,255,0.05);
  box-shadow: 0 20px 40px rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 40px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
    gap: 20px;
  }
`;

const AuthForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 15px;
  max-width: 400px;
  margin: 100px auto 0;
  background: rgba(30, 30, 36, 0.6);
  backdrop-filter: blur(12px);
  padding: 40px;
  border-radius: 16px;
  border: 1px solid rgba(255,255,255,0.05);
  h2 { text-align: center; color: var(--primary-color); margin-top: 0; }
`;

const Input = styled.input`
  padding: 14px;
  border-radius: 8px;
  border: 1px solid rgba(255,255,255,0.1);
  background: rgba(0,0,0,0.3);
  color: #fff;
  font-size: 14px;
  &:focus { outline: none; border-color: var(--primary-color); }
`;

const Button = styled.button`
  padding: 14px;
  border-radius: 8px;
  border: none;
  background: var(--primary-color);
  color: #fff;
  font-weight: 700;
  font-size: 15px;
  cursor: pointer;
  transition: 0.2s;
  box-shadow: 0 4px 15px rgba(168, 129, 230, 0.3);
  
  &:hover { background: #9b72d8; transform: translateY(-2px); box-shadow: 0 6px 20px rgba(168, 129, 230, 0.4); }
  &:disabled { background: #555; cursor: not-allowed; transform: none; box-shadow: none; }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 24px;
  @media (max-width: 768px) { flex-direction: column; }
`;

const AvatarContainer = styled.div`
  position: relative;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  border: 3px solid rgba(168, 129, 230, 0.5);
  padding: 3px;
  cursor: pointer;
  
  &:hover .overlay {
    opacity: 1;
  }
`;

const Avatar = styled.div`
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: #2a2a32;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  font-weight: 800;
  color: #fff;
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const AvatarOverlay = styled.div`
  position: absolute;
  top: 3px; left: 3px; right: 3px; bottom: 3px;
  border-radius: 50%;
  background: rgba(0,0,0,0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: 0.2s;
  color: #fff;
  font-size: 1.5rem;
`;

const FileInput = styled.input`
  display: none;
`;

const Stats = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
`;

const StatBadge = styled.div`
  background: rgba(255, 215, 0, 0.1);
  border: 1px solid rgba(255, 215, 0, 0.3);
  padding: 10px 20px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 800;
  color: #ffd700;
  font-size: 1.1rem;
  box-shadow: 0 4px 15px rgba(255, 215, 0, 0.1);
`;

const glowAnim = keyframes`
  0% { box-shadow: 0 0 10px ${p => p.glow}; }
  50% { box-shadow: 0 0 25px ${p => p.glow}; }
  100% { box-shadow: 0 0 10px ${p => p.glow}; }
`;

const GachaArea = styled.div`
  text-align: center;
  margin: 0 0 40px 0;
  padding: 50px;
  background: linear-gradient(180deg, rgba(30, 30, 36, 0.8) 0%, rgba(20, 20, 24, 0.8) 100%);
  border: 1px solid rgba(255,255,255,0.05);
  border-radius: 16px;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; height: 2px;
    background: linear-gradient(90deg, transparent, var(--primary-color), transparent);
  }
`;

const InventoryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 20px;
  margin-top: 20px;

  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
    gap: 12px;
  }
`;

const ItemCard = styled.div`
  background: rgba(20, 20, 24, 0.8);
  border: 1px solid ${p => p.glow};
  border-radius: 12px;
  padding: 20px 15px;
  text-align: center;
  animation: ${glowAnim} 3s infinite;
  transition: transform 0.2s;
  
  &:hover {
    transform: translateY(-5px);
  }
  
  img { 
    width: 80px; height: 80px; 
    object-fit: contain; 
    margin-bottom: 15px; 
    filter: drop-shadow(0 5px 15px ${p => p.glow});
  }
  h4 { margin: 0; font-size: 0.95rem; font-weight: 700; color: #fff; }
  p { margin: 5px 0 0; font-size: 0.75rem; font-weight: 800; color: ${p => p.glow}; text-transform: uppercase; letter-spacing: 1px; }
`;

const getRarityColor = (rarity) => {
  switch(rarity?.toLowerCase()) {
    case 'legendary': return '#ffd700'; // Gold
    case 'epic': return '#a881e6'; // Purple
    case 'rare': return '#4ade80'; // Green/Blue
    default: return '#9ca3af'; // Gray
  }
};

const compressImage = (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 250;
        const MAX_HEIGHT = 250;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      };
    };
  });
};

const Profile = () => {
  const [token, setToken] = useState(localStorage.getItem('isAuthenticated'));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [pulling, setPulling] = useState(false);
  const [pulledItem, setPulledItem] = useState(null);
  const fileInputRef = useRef(null);

  const fetchProfile = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/profile`, { credentials: 'include',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
        localStorage.setItem('user', JSON.stringify(data));
      } else {
        logout();
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [token]);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/${authMode}`, { credentials: 'include',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (res.ok) {
        setToken(data.token);
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
      } else {
        toast(data.error);
      }
    } catch (err) {
      toast("Server error");
    }
    setLoading(false);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('user');
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      const base64Image = await compressImage(file);
      const res = await fetch(`${API_URL}/user/avatar`, { credentials: 'include',
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ avatar: base64Image })
      });
      
      const data = await res.json();
      if (res.ok) {
        setUser(prev => ({ ...prev, avatar: data.avatar }));
        const localUser = JSON.parse(localStorage.getItem('user'));
        localStorage.setItem('user', JSON.stringify({ ...localUser, avatar: data.avatar }));
      } else {
        toast(data.error);
      }
    } catch (err) {
      toast("Error uploading avatar");
    }
  };

  const handlePull = async () => {
    if (user.points < 50) return toast("Not enough Otaku Points!");
    setPulling(true);
    setPulledItem(null);
    try {
      const res = await fetch(`${API_URL}/gacha/pull`, { credentials: 'include',
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setTimeout(() => {
          setPulledItem(data.item);
          setUser(prev => ({ ...prev, points: data.remainingPoints, inventory: [...prev.inventory, data.item] }));
          setPulling(false);
        }, 1500);
      } else {
        toast(data.error);
        setPulling(false);
      }
    } catch (err) {
      toast("Error pulling gacha");
      setPulling(false);
    }
  };

  if (!token || !user) {
    return (
      <Container>
        <NavBar />
        <Content>
          <AuthForm onSubmit={handleAuth}>
            <h2>{authMode === 'login' ? 'Welcome Back' : 'Create Account'}</h2>
            <Input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} required />
            <Input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
            <Button type="submit" disabled={loading}>{loading ? 'Please wait...' : (authMode === 'login' ? 'Login' : 'Register')}</Button>
            <p style={{textAlign: 'center', fontSize: '0.9rem', cursor: 'pointer', color: '#a0a0a0', marginTop: '10px'}} onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}>
              {authMode === 'login' ? "Don't have an account? Register" : "Already have an account? Login"}
            </p>
          </AuthForm>
        </Content>
      </Container>
    );
  }

  return (
    <Container>
      <NavBar />
      <Banner>
        <BannerDecor />
      </Banner>
      
      <Content>
        <ProfileCard>
          <UserInfo>
            <AvatarContainer onClick={() => fileInputRef.current.click()}>
              <Avatar>
                {user.avatar ? <img src={user.avatar} alt="Avatar" /> : user.username[0].toUpperCase()}
              </Avatar>
              <AvatarOverlay className="overlay">
                <FaCamera />
              </AvatarOverlay>
              <FileInput type="file" accept="image/*" ref={fileInputRef} onChange={handleAvatarUpload} />
            </AvatarContainer>
            
            <div>
              <h2 style={{margin: '0 0 5px 0', fontSize: '28px', fontWeight: '900'}}>{user.username}</h2>
              <p style={{margin: 0, color: '#a0a0a0', fontWeight: '600', fontSize: '14px'}}>Otaku Rank: Beginner</p>
            </div>
          </UserInfo>
          
          <Stats>
            <StatBadge><FaCoins /> {user.points} OP</StatBadge>
            <Button onClick={logout} style={{background: 'rgba(255,255,255,0.1)', color: '#fff', boxShadow: 'none'}}><FaSignOutAlt /> Logout</Button>
          </Stats>
        </ProfileCard>

        <GachaArea>
          <h3 style={{marginTop: 0, fontSize: '24px', fontWeight: '800'}}><FaGift /> Gacha Pull (50 OP)</h3>
          <p style={{color: '#a0a0a0', marginBottom: '30px', fontSize: '15px'}}>Spend 50 Otaku Points to unlock a random digital collectible!</p>
          
          {pulling ? (
            <div style={{height: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <div style={{ fontSize: '3rem', animation: 'spin 1s infinite linear' }}>🎁</div>
            </div>
          ) : pulledItem ? (
            <div style={{ marginBottom: '30px', animation: 'fadeIn 0.5s' }}>
              <h4 style={{color: getRarityColor(pulledItem.rarity), fontSize: '18px', marginBottom: '15px'}}>You unlocked: {pulledItem.item_name || pulledItem.name}!</h4>
              <img src={pulledItem.image_url} alt="item" style={{width: '120px', height: '120px', filter: `drop-shadow(0 0 20px ${getRarityColor(pulledItem.rarity)})`}} />
            </div>
          ) : null}

          <Button onClick={handlePull} disabled={pulling || user.points < 50} style={{ fontSize: '1.2rem', padding: '15px 50px', borderRadius: '30px' }}>
            {pulling ? 'Pulling...' : 'PULL GACHA'}
          </Button>
        </GachaArea>

        <h3 style={{fontSize: '20px', marginBottom: '20px'}}>Your Collection</h3>
        {user.inventory?.length === 0 ? (
          <p style={{color: '#888', textAlign: 'center', padding: '40px 0', background: 'rgba(255,255,255,0.02)', borderRadius: '12px'}}>
            You haven't unlocked any items yet. Watch anime to earn points!
          </p>
        ) : (
          <InventoryGrid>
            {user.inventory?.map((item, i) => (
              <ItemCard key={i} glow={getRarityColor(item.rarity)}>
                <img src={item.image_url} alt={item.item_name || item.name} />
                <h4>{item.item_name || item.name}</h4>
                <p>{item.rarity}</p>
              </ItemCard>
            ))}
          </InventoryGrid>
        )}
      </Content>
    </Container>
  );
};

export default Profile;
