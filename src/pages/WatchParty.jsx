import toast from 'react-hot-toast';
import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { io } from 'socket.io-client';
import NavBar from '../components/NavBar';
import CustomPlayer from '../components/CustomPlayer';
import { FaUser, FaPlay, FaSync, FaCopy, FaUsers, FaSearch, FaTimes } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE || `http://${window.location.hostname}:4000`;

const Container = styled.div`
  min-height: 100vh;
  background: var(--bg-primary);
  color: #fff;
  padding-bottom: 50px;
`;

const Layout = styled.div`
  display: flex;
  max-width: 1920px;
  width: 100%;
  margin: 0 auto;
  padding: 80px 24px 20px 24px;
  gap: 20px;
  height: 100vh;
  box-sizing: border-box;
  overflow: hidden;
  @media (max-width: 1000px) { flex-direction: column; height: auto; overflow: auto; }
`;

const VideoSection = styled.div`
  flex: 3;
  display: flex;
  flex-direction: column;
  gap: 15px;
  overflow-y: auto;
  padding-right: 5px;
  &::-webkit-scrollbar { width: 5px; }
  &::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 5px; }
`;

const RightColumn = styled.div`
  width: 350px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  height: 100%;
  overflow: hidden;
`;

const ChatSection = styled.div`
  background: var(--bg-secondary);
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.05);
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
`;

const ChatHeader = styled.div`
  padding: 15px;
  background: rgba(0,0,0,0.2);
  border-bottom: 1px solid rgba(255,255,255,0.05);
  font-weight: bold;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Messages = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 15px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  
  .sys-msg { color: #888; font-size: 0.8rem; text-align: center; margin: 10px 0; font-style: italic; }
  .user-msg { background: rgba(255,255,255,0.05); padding: 8px 12px; border-radius: 8px; font-size: 0.9rem; }
  .user-msg span { font-weight: bold; color: var(--primary-color); margin-right: 5px; }
`;

const ChatInput = styled.form`
  display: flex;
  border-top: 1px solid rgba(255,255,255,0.05);
  input {
    flex: 1; padding: 15px; background: transparent; border: none; color: #fff;
    &:focus { outline: none; }
  }
  button {
    padding: 0 20px; background: var(--primary-color); border: none; color: #fff; cursor: pointer; font-weight: bold;
  }
`;

const SetupCard = styled.div`
  max-width: 500px; margin: 100px auto; background: var(--bg-secondary); padding: 30px; border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.5); text-align: center; border: 1px solid rgba(255,255,255,0.1);
`;

const Input = styled.input`
  width: 100%; padding: 12px; margin-bottom: 15px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1);
  background: rgba(0,0,0,0.3); color: #fff; box-sizing: border-box;
`;

const Button = styled.button`
  width: 100%; padding: 12px; border-radius: 6px; border: none; background: var(--primary-color);
  color: #fff; font-weight: bold; cursor: pointer; transition: 0.2s; margin-bottom: 10px;
  &:hover { background: #ff4d4d; }
`;

const HostControls = styled.div`
  background: var(--bg-secondary);
  padding: 20px;
  border-radius: 12px;
  margin-top: 20px;
  border: 1px solid rgba(255,255,255,0.05);
  flex-shrink: 0;
`;

const SearchGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 15px;
  margin-top: 15px;
  max-height: 200px;
  overflow-y: auto;
`;

const AnimeResult = styled.div`
  cursor: pointer;
  text-align: center;
  font-size: 0.8rem;
  &:hover { opacity: 0.8; }
  img { width: 100%; height: 140px; object-fit: cover; border-radius: 6px; }
`;

const EpisodeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(50px, 1fr));
  gap: 5px;
  margin-top: 15px;
  max-height: 150px;
  overflow-y: auto;
`;

const EpBtn = styled.button`
  background: rgba(255,255,255,0.1);
  border: none;
  color: white;
  padding: 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: 0.2s;
  &:hover { background: var(--primary-color); }
`;

const CloseBtn = styled.button`
  background: linear-gradient(135deg, #ff4b4b, #d80000);
  color: white;
  border: none;
  padding: 6px 14px;
  border-radius: 20px;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  transition: transform 0.2s, box-shadow 0.2s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(255, 75, 75, 0.4);
  }
`;

const SOCKET_URL = import.meta.env.VITE_API_BASE || `http://${window.location.hostname}:4000`;

const WatchParty = () => {
  const [socket, setSocket] = useState(null);
  const [roomId, setRoomId] = useState('');
  const [username, setUsername] = useState('');
  const [inRoom, setInRoom] = useState(false);
  const [roomData, setRoomData] = useState(null);
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  
  const [streamData, setStreamData] = useState(null);
  const [videoTitle, setVideoTitle] = useState('Waiting for Host...');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedAnime, setSelectedAnime] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [allProviders, setAllProviders] = useState({});
  const [loadingMedia, setLoadingMedia] = useState(false);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Check if user is logged in
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      setUsername(user.username);
    }
  }, []);

  const handleJoinOrCreate = () => {
    if (!username.trim()) return toast("Please enter a username.");
    const id = roomId.trim() || Math.random().toString(36).substring(2, 8).toUpperCase();
    
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);
    
    newSocket.on('connect', () => {
      newSocket.emit('join_room', { roomId: id, username });
      setRoomId(id);
      setInRoom(true);
    });

    newSocket.on('room_update', (data) => setRoomData(data));
    newSocket.on('chat_message', (msg) => {
      setMessages(prev => [...prev, msg]);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    });
    newSocket.on('video_changed', (data) => {
      setStreamData(data.streamData);
      setVideoTitle(data.title);
    });

    newSocket.on('room_closed', () => {
      toast("The host has closed the party. Returning to home page...");
      navigate('/');
    });

    return () => newSocket.disconnect();
  };
  const searchAnime = async () => {
    if (!searchQuery) return;
    try {
      const res = await axios.get(`${API_BASE}/search?query=${encodeURIComponent(searchQuery)}`);
      setSearchResults(res.data.results || []);
    } catch (err) {
      console.error(err);
    }
  };

  const selectAnime = async (anime) => {
    setSelectedAnime(anime);
    setEpisodes([]);
    try {
      const epsRes = await axios.get(`${API_BASE}/episodes/${anime.id}`);
      const providers = epsRes.data.providers || {};
      setAllProviders(providers);
      
      const pNames = Object.keys(providers);
      if (pNames.length > 0) {
        const firstProvider = providers[pNames[0]];
        if (firstProvider.episodes) {
           const subEps = firstProvider.episodes.sub || [];
           const dubEps = firstProvider.episodes.dub || [];
           setEpisodes(subEps.length > 0 ? subEps : dubEps);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const playEpisode = async (ep) => {
    setLoadingMedia(true);
    let success = false;
    
    for (const pName of Object.keys(allProviders)) {
      const providerEps = allProviders[pName].episodes?.sub || allProviders[pName].episodes?.dub || [];
      const targetEp = providerEps.find(e => e.number === ep.number);
      if (!targetEp) continue;

      try {
        const res = await axios.get(`${API_BASE}/${targetEp.id}`);
        if (res.data && res.data.streams && res.data.streams.length > 0) {
          setStreamData(res.data);
          const title = `${selectedAnime.title.english || selectedAnime.title.romaji} - Episode ${ep.number}`;
          setVideoTitle(title);
          socket.emit('change_video', { roomId, streamData: res.data, title });
          success = true;
          break;
        }
      } catch (err) {
        console.warn(`Provider ${pName} failed:`, err);
      }
    }
    
    if (!success) {
      toast("Failed to load episode streams from all available servers.");
    }
    setLoadingMedia(false);
  };

  const handleSendChat = (e) => {
    e.preventDefault();
    if (!chatInput.trim() || !socket) return;
    socket.emit('send_chat', { roomId, username, message: chatInput });
    setChatInput('');
  };

  if (!inRoom) {
    return (
      <Container>
        <NavBar />
        <SetupCard>
          <h2><FaUsers /> Watch Party</h2>
          <p style={{color: '#888', marginBottom: '20px'}}>Watch anime in sync with friends!</p>
          <Input 
            placeholder="Your Username" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
          />
          <Input 
            placeholder="Room Code (Leave empty to create new)" 
            value={roomId} 
            onChange={(e) => setRoomId(e.target.value.toUpperCase())} 
          />
          <Button onClick={handleJoinOrCreate}>{roomId ? 'Join Room' : 'Create Room'}</Button>
        </SetupCard>
      </Container>
    );
  }

  const isHost = roomData?.host === socket?.id;

  return (
    <Container>
      <NavBar />
      <Layout>
        <VideoSection>
          <div style={{ background: '#111', padding: '15px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ margin: 0, color: 'var(--primary-color)' }}>Room: {roomId}</h2>
              <p style={{ margin: 0, color: '#888', fontSize: '0.9rem' }}>You are {isHost ? 'the Host' : 'a Guest'}.</p>
            </div>
            <button 
              onClick={() => { navigator.clipboard.writeText(roomId); toast('Room code copied!'); }}
              style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', padding: '10px 15px', borderRadius: '8px', cursor: 'pointer' }}
            >
              <FaCopy /> Copy Code
            </button>
          </div>
          <div style={{ aspectRatio: '16/9', background: '#000', borderRadius: '12px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {streamData ? (
              <CustomPlayer 
                streamData={streamData} 
                autoPlay={false}
                isSyncMode={true}
                socket={socket}
                roomId={roomId}
                isHost={isHost}
                title={videoTitle}
              />
            ) : (
              <h3 style={{color: '#666'}}>{videoTitle}</h3>
            )}
          </div>
          
          {isHost && (
            <HostControls>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px'}}>
                <h3 style={{margin: 0}}><FaSearch /> Host Controls</h3>
                <CloseBtn onClick={() => socket.emit('close_room', { roomId })}><FaTimes /> Close Party</CloseBtn>
              </div>
              <div style={{display: 'flex', gap: '10px'}}>
                <Input placeholder="Search Anime..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={{marginBottom: 0}} />
                <Button onClick={searchAnime} style={{width: 'auto', marginBottom: 0}}>Search</Button>
              </div>
              
              {!selectedAnime && searchResults.length > 0 && (
                <SearchGrid>
                  {searchResults.map(res => (
                    <AnimeResult key={res.id} onClick={() => selectAnime(res)}>
                      <img src={res.coverImage?.large} alt={res.title?.english || res.title?.romaji || 'Anime'} />
                      <p>{(res.title?.english || res.title?.romaji || 'Unknown').substring(0,25)}</p>
                    </AnimeResult>
                  ))}
                </SearchGrid>
              )}
            </HostControls>
          )}
        </VideoSection>
        
        <RightColumn>
          <ChatSection>
            <ChatHeader>
            <span>Live Chat</span>
            <span style={{ fontSize: '0.8rem', color: '#888' }}><FaUser /> {roomData?.users?.length || 0} Online</span>
          </ChatHeader>
          <Messages>
            {messages.map((msg, i) => (
              msg.type === 'system' ? (
                <div key={i} className="sys-msg">{msg.message}</div>
              ) : (
                <div key={i} className="user-msg">
                  <span>{msg.username}:</span> {msg.message}
                </div>
              )
            ))}
            <div ref={messagesEndRef} />
          </Messages>
          <ChatInput onSubmit={handleSendChat}>
            <input 
              placeholder="Say something..." 
              value={chatInput} 
              onChange={e => setChatInput(e.target.value)} 
            />
            <button type="submit">Send</button>
          </ChatInput>
        </ChatSection>

        {isHost && selectedAnime && (
          <HostControls style={{ marginTop: 0, maxHeight: '50%', overflowY: 'auto' }}>
            <p style={{fontWeight: 'bold', margin: '0 0 10px 0'}}>
              Selected: {selectedAnime.title?.english || selectedAnime.title?.romaji} 
              <button onClick={() => setSelectedAnime(null)} style={{background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', marginLeft: '10px'}}>(Change)</button>
            </p>
            <EpisodeGrid>
              {episodes.map(ep => (
                <EpBtn key={ep.id} onClick={() => playEpisode(ep)}>
                  EP {ep.number}
                </EpBtn>
              ))}
            </EpisodeGrid>
            {loadingMedia && <p style={{color: '#888', marginTop: '10px'}}>Loading stream...</p>}
          </HostControls>
        )}
      </RightColumn>
      </Layout>
    </Container>
  );
};

export default WatchParty;
