import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import NavBar from '../components/NavBar';
import { FaPlay, FaPause, FaStepForward, FaRandom, FaList } from 'react-icons/fa';

const Container = styled.div`
  min-height: 100vh;
  background: var(--bg-primary);
  color: #fff;
  padding-bottom: 50px;
`;

const JukeboxWrapper = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;

  @media (min-width: 900px) {
    flex-direction: row;
  }
`;

const PlayerSection = styled.div`
  flex: 2;
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const VideoContainer = styled.div`
  width: 100%;
  aspect-ratio: 16/9;
  background: #000;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
  position: relative;

  video {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
`;

const TrackInfo = styled.div`
  background: #111;
  padding: 20px;
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.05);

  .anime-title {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--primary-color);
    margin-bottom: 5px;

    @media (max-width: 480px) {
      font-size: 1.2rem;
    }
  }

  .theme-name {
    font-size: 1.1rem;
    color: #ccc;
    margin-bottom: 15px;

    @media (max-width: 480px) {
      font-size: 1rem;
    }
  }
`;

const Controls = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  justify-content: center;
  margin-top: 10px;

  button {
    background: transparent;
    border: none;
    color: #fff;
    cursor: pointer;
    font-size: 1.2rem;
    transition: 0.2s;
    
    &:hover {
      color: var(--primary-color);
    }
  }

  .play-btn {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: var(--primary-color);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
    color: #fff;
    
    &:hover {
      background: #ff6b6b;
      transform: scale(1.05);
    }
  }
`;

const PlaylistSection = styled.div`
  flex: 1;
  background: #111;
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.05);
  height: 600px;
  display: flex;
  flex-direction: column;

  @media (max-width: 480px) {
    height: auto;
    max-height: 400px;
  }
`;

const PlaylistHeader = styled.div`
  padding: 20px;
  border-bottom: 1px solid rgba(255,255,255,0.05);
  font-weight: 700;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const PlaylistItems = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 10px;

  ::-webkit-scrollbar {
    width: 6px;
  }
  ::-webkit-scrollbar-thumb {
    background: #333;
    border-radius: 3px;
  }
`;

const PlaylistItem = styled.div`
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  background: ${props => props.active ? 'rgba(255, 77, 77, 0.1)' : 'transparent'};
  border: 1px solid ${props => props.active ? 'rgba(255, 77, 77, 0.3)' : 'transparent'};
  transition: 0.2s;
  margin-bottom: 5px;

  &:hover {
    background: rgba(255,255,255,0.05);
  }

  .p-anime {
    font-size: 0.9rem;
    font-weight: 600;
    color: ${props => props.active ? 'var(--primary-color)' : '#eee'};
    margin-bottom: 4px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .p-theme {
    font-size: 0.8rem;
    color: #888;
  }
`;

const LoadingOverlay = styled.div`
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  color: var(--primary-color);
  font-weight: bold;
`;

const Jukebox = () => {
  const [playlist, setPlaylist] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const videoRef = useRef(null);

  const fetchRandomThemes = async () => {
    try {
      setLoading(true);
      // Fetch random videos with their associated anime and theme info
      const res = await fetch('https://api.animethemes.moe/video?sort=random&page[size]=30&include=animethemeentries.animetheme.anime');
      const data = await res.json();
      
      if (data.videos && data.videos.length > 0) {
        const formattedPlaylist = data.videos.map(v => {
          const entry = v.animethemeentries?.[0];
          const theme = entry?.animetheme;
          const anime = theme?.anime;
          
          return {
            id: v.id,
            url: v.link,
            animeTitle: anime?.name || 'Unknown Anime',
            themeName: theme ? `${theme.type} - ${theme.slug}` : 'Unknown Theme',
            year: anime?.year
          };
        }).filter(t => t.url);
        
        setPlaylist(formattedPlaylist);
        setCurrentIndex(0);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load OP/ED themes. Animethemes API might be down.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRandomThemes();
  }, []);

  useEffect(() => {
    if (videoRef.current && playlist.length > 0) {
      if (isPlaying) {
        videoRef.current.play().catch(e => console.log('Autoplay prevented:', e));
      }
    }
  }, [currentIndex, playlist, isPlaying]);

  const handleNext = () => {
    if (currentIndex < playlist.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      fetchRandomThemes();
    }
  };

  const handleTogglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const currentTrack = playlist[currentIndex];

  return (
    <Container>
      <NavBar />
      <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '10px' }}>🎵 OP/ED Jukebox</h1>
        <p style={{ color: '#aaa', marginBottom: '30px' }}>Continuous stream of random anime openings and endings.</p>
        
        {error ? (
          <div style={{ color: '#ff4d4d', padding: '20px', background: 'rgba(255,77,77,0.1)', borderRadius: '8px' }}>
            {error}
          </div>
        ) : (
          <JukeboxWrapper>
            <PlayerSection>
              <VideoContainer>
                {loading && <LoadingOverlay>Loading Tracks...</LoadingOverlay>}
                {currentTrack && (
                  <video 
                    ref={videoRef}
                    src={currentTrack.url}
                    onEnded={handleNext}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    controls
                    autoPlay
                  />
                )}
              </VideoContainer>
              
              <TrackInfo>
                <div className="anime-title">{currentTrack?.animeTitle || 'Loading...'}</div>
                <div className="theme-name">{currentTrack?.themeName || 'Loading...'} {currentTrack?.year ? `(${currentTrack.year})` : ''}</div>
                
                <Controls>
                  <button onClick={fetchRandomThemes} title="Shuffle New Playlist"><FaRandom /></button>
                  <button className="play-btn" onClick={handleTogglePlay}>
                    {isPlaying ? <FaPause /> : <FaPlay style={{ marginLeft: '4px' }} />}
                  </button>
                  <button onClick={handleNext} title="Skip Track"><FaStepForward /></button>
                </Controls>
              </TrackInfo>
            </PlayerSection>
            
            <PlaylistSection>
              <PlaylistHeader>
                <FaList /> Up Next
              </PlaylistHeader>
              <PlaylistItems>
                {playlist.map((track, idx) => (
                  <PlaylistItem 
                    key={idx} 
                    active={idx === currentIndex}
                    onClick={() => {
                      setCurrentIndex(idx);
                      setIsPlaying(true);
                    }}
                  >
                    <div className="p-anime">{track.animeTitle}</div>
                    <div className="p-theme">{track.themeName}</div>
                  </PlaylistItem>
                ))}
              </PlaylistItems>
            </PlaylistSection>
          </JukeboxWrapper>
        )}
      </div>
    </Container>
  );
};

export default Jukebox;
