import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import Hls from 'hls.js';
import { 
  FaPlay, FaPause, FaVolumeUp, FaVolumeMute, FaCog, FaExpand, 
  FaCompress, FaUndo, FaRedo, FaClosedCaptioning, FaDownload, 
  FaCamera, FaClone, FaChromecast, FaTachometerAlt, FaChevronRight,
  FaLanguage, FaDesktop, FaUniversalAccess, FaArrowLeft, FaCheck
} from 'react-icons/fa';

const PlayerWrapper = styled.div`
  position: relative;
  width: 100%;
  max-height: 100%;
  aspect-ratio: 16/9;
  background: #000;
  overflow: hidden;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
  font-family: 'Inter', sans-serif;
  cursor: ${p => p.isIdle ? 'none' : 'default'};
  
  &:hover .controls-overlay {
    opacity: ${p => p.isIdle ? 0 : 1}; pointer-events: ${p => p.isIdle ? "none" : "auto"};
  }
`;

const Video = styled.video`
  width: 100%;
  height: 100%;
  display: block;
`;

const CenterPlayButton = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80px;
  height: 80px;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 32px;
  cursor: pointer;
  z-index: 5;
  transition: all 0.2s ease;
  backdrop-filter: blur(4px);
  
  &:hover {
    background: #ffbade;
    color: #000;
    transform: translate(-50%, -50%) scale(1.1);
  }
`;

const ControlsOverlay = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0) 100%);
  padding: 40px 20px 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
`;

const TopOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to bottom, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0) 100%);
  padding: 20px;
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
  font-size: 16px;
  font-weight: 600;
  text-shadow: 0px 2px 4px rgba(0,0,0,0.8);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  z-index: 10;
`;

const ProgressContainer = styled.div`
  width: 100%;
  height: 6px;
  background: rgba(255,255,255,0.2);
  border-radius: 3px;
  cursor: pointer;
  position: relative;
  transition: height 0.2s;
  
  &:hover {
    height: 8px;
  }
`;

const HoverTooltip = styled.div`
  position: absolute;
  bottom: 16px;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.85);
  color: #fff;
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  pointer-events: none;
  white-space: nowrap;
  border: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.6);
  z-index: 15;
  transition: opacity 0.15s ease;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -5px;
    left: 50%;
    transform: translateX(-50%);
    border-width: 5px 5px 0;
    border-style: solid;
    border-color: rgba(0, 0, 0, 0.85) transparent transparent transparent;
  }
`;

const ProgressLoaded = styled.div`
  background: rgba(255, 255, 255, 0.4);
  height: 100%;
  border-radius: 3px;
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
  width: ${p => p.loaded || 0}%;
`;

const ProgressFilled = styled.div`
  height: 100%;
  background: #a881e6;
  border-radius: 3px;
  width: ${p => p.progress || 0}%;
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
  
  &::after {
    content: '';
    position: absolute;
    right: -6px;
    top: 50%;
    transform: translateY(-50%);
    width: 12px;
    height: 12px;
    background: #fff;
    border-radius: 50%;
  }
`;

const TimelineMarker = styled.div`
  position: absolute;
  top: 0;
  height: 100%;
  background: transparent;
  left: ${p => p.start}%;
  width: ${p => p.width}%;
  pointer-events: none;
  border-left: 2px solid #000;
  border-right: 2px solid #000;
  z-index: 2;
`;

const ControlsRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 16px 12px 16px;
`;

const LeftControls = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const RightControls = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;

  .desktop-only {
    @media (max-width: 1024px) {
      display: none;
    }
  }
`;

const ControlIcon = styled.button`
  background: transparent;
  border: none;
  color: #eee;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
  padding: 0;
  
  &:hover {
    color: #fff;
  }
`;

const TimeDisplay = styled.div`
  font-size: 12px;
  font-weight: 500;
  color: #ddd;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.3px;
`;

const VolumeContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  
  input[type=range] {
    width: 80px;
    accent-color: #a881e6;
    cursor: pointer;
  }

  @media (max-width: 1024px) {
    display: none;
  }
`;

const LoadingSkeleton = styled.div`
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: var(--bg-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 20;
  
  &::after {
    content: '';
    width: 50px;
    height: 50px;
    border: 4px solid rgba(255,255,255,0.1);
    border-top: 4px solid #a881e6;
    border-radius: 50%;
    animation: custom-spin 1s linear infinite;
  }
  
  @keyframes custom-spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const SettingsMenu = styled.div`
  position: absolute;
  bottom: 60px;
  right: 20px;
  background: #0f0f0f;
  border-radius: 8px;
  width: 260px;
  padding: 8px 0;
  display: flex;
  flex-direction: column;
  z-index: 50;
  box-shadow: 0 4px 20px rgba(0,0,0,0.8);
  transform-origin: bottom right;
  animation: slideUp 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  font-family: 'Inter', sans-serif;
  overflow: hidden;
  
  @keyframes slideUp {
    from { opacity: 0; transform: scale(0.95) translateY(10px); }
    to { opacity: 1; transform: scale(1) translateY(0); }
  }
`;

const MenuHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-color);
  font-size: 14px;
  font-weight: 700;
  color: #f1f1f1;
  cursor: pointer;
  margin-bottom: 4px;
  
  svg {
    font-size: 14px;
    color: #f1f1f1;
  }
  
  &:hover {
    background: rgba(255,255,255,0.05);
  }
`;

const SettingItem = styled.div`
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  color: #f1f1f1;
  transition: background 0.2s;
  
  &:hover {
    background: rgba(255,255,255,0.1);
  }
`;

const SettingLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  
  svg {
    font-size: 16px;
    color: #f1f1f1;
  }
`;

const SettingValue = styled.div`
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 13px;
  font-weight: 400;
  
  svg {
    font-size: 12px;
    color: var(--text-secondary);
  }
`;

const CheckIcon = styled.div`
  width: 16px;
  display: flex;
  align-items: center;
  color: var(--text-primary);
  svg { font-size: 12px; }
`;

const ToggleSwitch = styled.div`
  width: 34px;
  height: 20px;
  background: ${p => p.active ? '#a881e6' : '#555'};
  border-radius: 10px;
  position: relative;
  cursor: pointer;
  transition: 0.2s;
  
  &::after {
    content: '';
    position: absolute;
    top: 2px;
    left: ${p => p.active ? '16px' : '2px'};
    width: 16px;
    height: 16px;
    background: #fff;
    border-radius: 50%;
    transition: 0.2s;
    box-shadow: 0 1px 3px rgba(0,0,0,0.3);
  }
`;

const SliderContainer = styled.div`
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  
  input[type=range] {
    flex: 1;
    accent-color: #f1f1f1;
    cursor: pointer;
  }
`;

const SkipOverlayButton = styled.button`
  position: absolute;
  bottom: 80px;
  right: 20px;
  background: rgba(255, 255, 255, 0.85);
  color: #111;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  z-index: 20;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;

  &:hover {
    background: #fff;
    transform: scale(1.02);
  }
`;

const DoubleTapZone = styled.div`
  position: absolute;
  top: 0;
  ${p => p.side === 'left' ? 'left: 0;' : 'right: 0;'}
  width: 40%;
  height: 100%;
  z-index: 4;
  display: none;

  @media (max-width: 1024px) {
    display: block;
  }
`;

const SeekIndicator = styled.div`
  position: absolute;
  top: 50%;
  ${p => p.side === 'left' ? 'left: 20%;' : 'right: 20%;'}
  transform: translate(${p => p.side === 'left' ? '-50%' : '50%'}, -50%);
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  color: #fff;
  border-radius: 50%;
  width: 60px;
  height: 60px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  pointer-events: none;
  z-index: 6;
  animation: seekPop 0.5s ease-out forwards;

  svg { font-size: 18px; margin-bottom: 2px; }

  @keyframes seekPop {
    0% { opacity: 0; transform: translate(${p => p.side === 'left' ? '-50%' : '50%'}, -50%) scale(0.5); }
    30% { opacity: 1; transform: translate(${p => p.side === 'left' ? '-50%' : '50%'}, -50%) scale(1.1); }
    100% { opacity: 0; transform: translate(${p => p.side === 'left' ? '-50%' : '50%'}, -50%) scale(1); }
  }
`;

const formatTime = (timeInSeconds) => {
  if (isNaN(timeInSeconds)) return "00:00";
  const m = Math.floor(timeInSeconds / 60);
  const s = Math.floor(timeInSeconds % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
};

const CustomPlayer = ({ streamData, skipTimes = null, autoPlay = true, title = "", audioLang = 'sub', hasDub = false, onAudioChange = () => {}, autoSkip = false, onVideoEnd = () => {}, onProgress = () => {}, onToggleTheater = null, isSyncMode = false, socket = null, roomId = null, isHost = false, initialTime = 0, onError = null }) => {
  const videoRef = useRef(null);
  const wrapperRef = useRef(null);
  const hlsRef = useRef(null);
  const savedTimeRef = useRef(0);
  const progressContainerRef = useRef(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isIdle, setIsIdle] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [hoverPos, setHoverPos] = useState(null);
  const [hoverTime, setHoverTime] = useState(0);
  
  // Premium Settings State
  const [activeMenu, setActiveMenu] = useState('main'); // main, accessibility, captionStyles, family, weight, border, quality
  const [captionState, setCaptionState] = useState('Off');
  const [keyboardAnimations, setKeyboardAnimations] = useState(true);
  const [autoSync, setAutoSync] = useState(true);
  const [fontFamily, setFontFamily] = useState('Default');
  const [fontWeight, setFontWeight] = useState('Bold');
  const [borderOp, setBorderOp] = useState(100);
  const [currentQuality, setCurrentQuality] = useState('Auto');
  const [availableQualities, setAvailableQualities] = useState([]);
  const [alwaysHD, setAlwaysHD] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [seekIndicator, setSeekIndicator] = useState(null); // { side: 'left'|'right', seconds: 10 }
  
  let idleTimeout = useRef(null);
  const doubleTapRef = useRef({ lastTap: 0, lastSide: null, timer: null });

  const autoPlayRef = useRef(autoPlay);
  const autoSkipRef = useRef(autoSkip);
  const streamDataRef = useRef(streamData);
  const skipTimesRef = useRef(skipTimes);
  const onVideoEndRef = useRef(onVideoEnd);

  useEffect(() => { autoPlayRef.current = autoPlay; }, [autoPlay]);
  useEffect(() => { autoSkipRef.current = autoSkip; }, [autoSkip]);
  useEffect(() => { streamDataRef.current = streamData; }, [streamData]);
  useEffect(() => { skipTimesRef.current = skipTimes; }, [skipTimes]);
  useEffect(() => { onVideoEndRef.current = onVideoEnd; }, [onVideoEnd]);
  
  // Handle asynchronous initialTime updates
  useEffect(() => {
    if (initialTime > 0 && videoRef.current) {
      const video = videoRef.current;
      
      const jumpToTime = () => {
        if (video.currentTime < 5) {
          video.currentTime = initialTime;
        }
      };

      if (video.readyState >= 1) {
        jumpToTime();
      } else {
        video.addEventListener('loadedmetadata', jumpToTime, { once: true });
        return () => video.removeEventListener('loadedmetadata', jumpToTime);
      }
    }
  }, [initialTime]);

  // Handle Socket Events for Sync Mode
  useEffect(() => {
    if (!isSyncMode || !socket) return;
    
    const handleForcePlay = ({ time }) => {
      if (videoRef.current) {
        if (Math.abs(videoRef.current.currentTime - time) > 1) videoRef.current.currentTime = time;
        videoRef.current.play().catch(e => console.warn(e));
      }
    };
    
    const handleForcePause = ({ time }) => {
      if (videoRef.current) {
        videoRef.current.currentTime = time;
        videoRef.current.pause();
      }
    };
    
    const handleForceSeek = ({ time }) => {
      if (videoRef.current) videoRef.current.currentTime = time;
    };
    
    const handleRequestSync = ({ target }) => {
      if (isHost && videoRef.current) {
        socket.emit('send_sync', { 
          target, 
          time: videoRef.current.currentTime, 
          isPlaying: !videoRef.current.paused 
        });
      }
    };
    
    const handleInitialSync = ({ time, isPlaying }) => {
      if (videoRef.current) {
        videoRef.current.currentTime = time;
        if (isPlaying) videoRef.current.play().catch(e => console.warn(e));
        else videoRef.current.pause();
      }
    };

    socket.on('force_play', handleForcePlay);
    socket.on('force_pause', handleForcePause);
    socket.on('force_seek', handleForceSeek);
    socket.on('request_sync', handleRequestSync);
    socket.on('initial_sync', handleInitialSync);

    return () => {
      socket.off('force_play', handleForcePlay);
      socket.off('force_pause', handleForcePause);
      socket.off('force_seek', handleForceSeek);
      socket.off('request_sync', handleRequestSync);
      socket.off('initial_sync', handleInitialSync);
    };
  }, [isSyncMode, socket, isHost]);

  // Initialize Video
  useEffect(() => {
    if (!streamData?.streams?.length) return;
    
    const video = videoRef.current;
    
    // Consume the explicitly saved time (from language switch) or initial time
    let timeToRestore = savedTimeRef.current || initialTime;
    savedTimeRef.current = 0;
    
    setLoading(true);
    const source = streamData.streams.find(s => s.quality === '1080p' || s.quality === 'auto') || streamData.streams[0];
    
    let hls;
    const isM3U8 = source.url.includes('.m3u8') || source.type === 'hls';

    if (isM3U8 && Hls.isSupported()) {
      hls = new Hls({
        maxBufferLength: 60,
        maxMaxBufferLength: 120,
        maxBufferSize: 60 * 1024 * 1024, // 60 MB
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90,
        fragLoadingTimeOut: 30000,
        manifestLoadingTimeOut: 30000,
        levelLoadingTimeOut: 30000,
        startLevel: -1 // Auto select based on bandwidth
      });
      hlsRef.current = hls;

      hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
        setLoading(false);
        if (timeToRestore > 0) video.currentTime = timeToRestore;
        if (autoPlayRef.current) {
          video.play().catch(e => {
            console.log("Autoplay with sound blocked, trying muted:", e);
            video.muted = true;
            setIsMuted(true);
            video.play().catch(err => console.log("Muted autoplay blocked too:", err));
          });
        }
        
        // Extract real quality levels from HLS manifest
        const extracted = data.levels.map((lvl, index) => ({
          height: lvl.height,
          name: `${lvl.height}p`,
          index
        })).sort((a,b) => b.height - a.height); // sort highest to lowest
        
        // Deduplicate in case of multiple bitrates at same resolution
        const unique = [];
        const seen = new Set();
        extracted.forEach(lvl => {
          if (!seen.has(lvl.height)) {
            seen.add(lvl.height);
            unique.push(lvl);
          }
        });
        
        setAvailableQualities(unique);
        setCurrentQuality('Auto'); // HLS starts in auto
      });
      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
           setLoading(false);
           if (onError) onError();
        }
      });

      hls.loadSource(source.url);
      hls.attachMedia(video);

      // Failsafe timeout in case MANIFEST_PARSED never fires
      setTimeout(() => setLoading(false), 5000);
    } else {
      video.src = source.url;
      video.load();
      const onMeta = () => {
        setLoading(false);
        if (timeToRestore > 0) video.currentTime = timeToRestore;
        if (autoPlayRef.current) video.play().catch(e => console.log("Autoplay blocked:", e));
      };
      video.addEventListener('loadedmetadata', onMeta, { once: true });
      video.addEventListener('error', () => {
         setLoading(false);
         if (onError) onError();
      }, { once: true });
      // Fallback timeout in case event doesn't fire
      setTimeout(() => setLoading(false), 3000);
    }
    
    return () => {
      if (hls) {
        hls.destroy();
        hlsRef.current = null;
      }
    };
  }, [streamData]);

  // Video Events
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      setProgress((video.currentTime / video.duration) * 100);
      onProgress(video.currentTime, video.duration);
      
      // Sync Mode: Emit play state to server periodically if Host
      if (isSyncMode && isHost && socket && roomId) {
        // Placeholder for sync logic
      }
      
      // Auto skip logic
      if (autoSkipRef.current) {
        const currentData = streamDataRef.current;
        if (currentData?.intro && video.currentTime >= currentData.intro.start && video.currentTime < currentData.intro.end - 1) {
          video.currentTime = currentData.intro.end;
        }
        if (currentData?.outro && video.currentTime >= currentData.outro.start && video.currentTime < currentData.outro.end - 1) {
          video.currentTime = currentData.outro.end;
        }

        // AniSkip logic
        const currentSkipTimes = skipTimesRef.current;
        if (currentSkipTimes && currentSkipTimes.length > 0) {
          for (const skip of currentSkipTimes) {
            if (video.currentTime >= skip.interval.startTime && video.currentTime < skip.interval.endTime - 1) {
              video.currentTime = skip.interval.endTime;
              break;
            }
          }
        }
      }
    };
    const handleDurationChange = () => setDuration(video.duration);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => { if (onVideoEndRef.current) onVideoEndRef.current(); };
    
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('durationchange', handleDurationChange);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);
    
    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('durationchange', handleDurationChange);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
    };
  }, []);

  // Idle Timer
  useEffect(() => {
    const resetIdleTimer = () => {
      setIsIdle(false);
      clearTimeout(idleTimeout.current);
      if (isPlaying) {
        idleTimeout.current = setTimeout(() => setIsIdle(true), 3000);
      }
    };
    
    const handleMouseLeave = () => { if (isPlaying) setIsIdle(true); };
    
    resetIdleTimer(); // Start the timer immediately when playing state changes
    
    const wrapper = wrapperRef.current;
    if (wrapper) {
      wrapper.addEventListener('mousemove', resetIdleTimer);
      wrapper.addEventListener('mouseleave', handleMouseLeave);
    }
    
    return () => {
      if (wrapper) {
        wrapper.removeEventListener('mousemove', resetIdleTimer);
        wrapper.removeEventListener('mouseleave', handleMouseLeave);
      }
      clearTimeout(idleTimeout.current);
    };
  }, [isPlaying]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      const video = videoRef.current;
      if (!video) return;
      
      // Ignore if typing in input
      if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') return;

      switch(e.key.toLowerCase()) {
        case ' ':
          e.preventDefault();
          togglePlay();
          break;
        case 'arrowleft':
          e.preventDefault();
          video.currentTime = Math.max(0, video.currentTime - 10);
          break;
        case 'arrowright':
          e.preventDefault();
          video.currentTime = Math.min(video.duration, video.currentTime + 10);
          break;
        case 'arrowup':
          e.preventDefault();
          handleVolumeChange({ target: { value: Math.min(1, volume + 0.1) }});
          break;
        case 'arrowdown':
          e.preventDefault();
          handleVolumeChange({ target: { value: Math.max(0, volume - 0.1) }});
          break;
        case 'm':
          e.preventDefault();
          toggleMute();
          break;
        case 'f':
          e.preventDefault();
          toggleFullscreen();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  // Fullscreen event listener to sync state
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const togglePlay = () => {
    if (videoRef.current.paused) {
      videoRef.current.play();
      if (isSyncMode && isHost && socket) socket.emit('sync_play', { roomId, time: videoRef.current.currentTime });
    }
    else {
      videoRef.current.pause();
      if (isSyncMode && isHost && socket) socket.emit('sync_pause', { roomId, time: videoRef.current.currentTime });
    }
  };

  const toggleMute = () => {
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    videoRef.current.volume = val;
    if (val === 0) {
      videoRef.current.muted = true;
      setIsMuted(true);
    } else {
      videoRef.current.muted = false;
      setIsMuted(false);
    }
  };

  const handleSeek = (e) => {
    if (!progressContainerRef.current) return;
    const rect = progressContainerRef.current.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const time = Math.max(0, Math.min(pos * duration, duration));
    videoRef.current.currentTime = time;
    if (isSyncMode && isHost && socket) {
      socket.emit('sync_seek', { roomId, time });
    }
  };

  const handleMouseMove = (e) => {
    if (!progressContainerRef.current || duration === 0) return;
    const rect = progressContainerRef.current.getBoundingClientRect();
    let pos = (e.clientX - rect.left) / rect.width;
    pos = Math.max(0, Math.min(pos, 1));
    setHoverPos(pos * 100);
    setHoverTime(pos * duration);
  };

  const handleMouseLeave = () => {
    setHoverPos(null);
  };

  const skip = (seconds) => {
    videoRef.current.currentTime += seconds;
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      wrapperRef.current.requestFullscreen().catch(err => {
        console.error("Error attempting to enable fullscreen:", err);
      });
    } else {
      document.exitFullscreen();
    }
  };

  // Double-tap to seek (mobile gesture)
  const handleDoubleTap = (side) => {
    const now = Date.now();
    const dt = doubleTapRef.current;
    const timeSinceLastTap = now - dt.lastTap;

    if (timeSinceLastTap < 300 && dt.lastSide === side) {
      // Double tap detected
      clearTimeout(dt.timer);
      const seekAmount = side === 'left' ? -10 : 10;
      if (videoRef.current) {
        videoRef.current.currentTime = Math.max(0, Math.min(videoRef.current.duration, videoRef.current.currentTime + seekAmount));
      }
      setSeekIndicator({ side, seconds: 10 });
      setTimeout(() => setSeekIndicator(null), 500);
      dt.lastTap = 0;
      dt.lastSide = null;
    } else {
      // First tap — wait to see if it's a double tap
      dt.lastTap = now;
      dt.lastSide = side;
      dt.timer = setTimeout(() => {
        // Single tap — toggle play/pause
        togglePlay();
        dt.lastTap = 0;
        dt.lastSide = null;
      }, 300);
    }
  };

  const togglePiP = async () => {
    if (document.pictureInPictureElement) {
      await document.exitPictureInPicture();
    } else if (document.pictureInPictureEnabled) {
      await videoRef.current.requestPictureInPicture();
    }
  };

  const handleSpeedChange = () => {
    const video = videoRef.current;
    if (!video) return;
    let newRate = video.playbackRate + 0.25;
    if (newRate > 2.0) newRate = 0.5;
    video.playbackRate = newRate;
  };

  const handleDownload = () => {
    if (!videoRef.current?.src) return;
    const a = document.createElement('a');
    a.href = videoRef.current.src;
    a.download = `miruro_episode_${Date.now()}.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleScreenshot = () => {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    const dataURI = canvas.toDataURL('image/jpeg');
    const a = document.createElement('a');
    a.href = dataURI;
    a.download = `miruro_screenshot_${formatTime(video.currentTime)}.jpg`;
    a.click();
  };

  const renderMenuContent = () => {
    switch (activeMenu) {
      case 'main':
        return (
          <>
            <SettingItem onClick={() => { 
                if (hasDub) {
                    savedTimeRef.current = videoRef.current ? videoRef.current.currentTime : 0;
                    onAudioChange(audioLang === 'sub' ? 'dub' : 'sub'); 
                }
            }}>
              <SettingLabel><FaLanguage /> Audio Language</SettingLabel>
              <SettingValue>{audioLang === 'sub' ? 'Japanese' : 'English'} <FaChevronRight /></SettingValue>
            </SettingItem>
            <SettingItem onClick={() => setActiveMenu('accessibility')}>
              <SettingLabel><FaUniversalAccess /> Accessibility</SettingLabel>
              <SettingValue><FaChevronRight /></SettingValue>
            </SettingItem>
            <SettingItem onClick={() => setActiveMenu('captions')}>
              <SettingLabel><FaClosedCaptioning /> Captions</SettingLabel>
              <SettingValue>{captionState} <FaChevronRight /></SettingValue>
            </SettingItem>
            <SettingItem onClick={() => setActiveMenu('speed')}>
              <SettingLabel><FaTachometerAlt /> Speed</SettingLabel>
              <SettingValue>{playbackSpeed === 1 ? 'Normal' : playbackSpeed + 'x'} <FaChevronRight /></SettingValue>
            </SettingItem>
            <SettingItem onClick={() => setActiveMenu('quality')}>
              <SettingLabel><FaDesktop /> Quality</SettingLabel>
              <SettingValue>{currentQuality} <FaChevronRight /></SettingValue>
            </SettingItem>
          </>
        );
      case 'speed':
        return (
          <>
            <MenuHeader onClick={() => setActiveMenu('main')}><FaArrowLeft /> Speed <span style={{marginLeft: 'auto', fontWeight: 400, color: '#aaa'}}>{playbackSpeed === 1 ? 'Normal' : playbackSpeed + 'x'}</span></MenuHeader>
            <SliderContainer>
              <span style={{color: '#666', fontSize: 12}}><FaTachometerAlt /></span>
              <input 
                type="range" 
                min="0.25" max="2" step="0.25" 
                value={playbackSpeed} 
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setPlaybackSpeed(val);
                  if (videoRef.current) videoRef.current.playbackRate = val;
                }} 
              />
              <span style={{color: '#666', fontSize: 12}}><FaTachometerAlt /></span>
            </SliderContainer>
          </>
        );
      case 'captions':
        const availableCaptions = ['Off', 'English', 'Spanish', 'French'];
        return (
          <>
            <MenuHeader onClick={() => setActiveMenu('main')}><FaArrowLeft /> Captions <span style={{marginLeft: 'auto', fontWeight: 400, color: '#aaa'}}>{captionState}</span></MenuHeader>
            {availableCaptions.map(cap => (
              <SettingItem key={cap} onClick={() => { setCaptionState(cap); setActiveMenu('main'); }}>
                <SettingLabel><CheckIcon>{captionState === cap && <FaCheck />}</CheckIcon> {cap}</SettingLabel>
              </SettingItem>
            ))}
          </>
        );
      case 'quality':
        const qualities = ['1080p', '720p', '360p', 'Auto'];
        return (
          <>
            <MenuHeader onClick={() => setActiveMenu('main')}><FaArrowLeft /> Quality <span style={{marginLeft: 'auto', fontWeight: 400, color: '#aaa'}}>{currentQuality}</span></MenuHeader>
            <SettingItem onClick={() => setAlwaysHD(!alwaysHD)}>
              <SettingLabel>Always HD</SettingLabel>
              <ToggleSwitch active={alwaysHD} />
            </SettingItem>
            {qualities.map(q => (
              <SettingItem key={q} onClick={() => { setCurrentQuality(q); setActiveMenu('main'); }}>
                <SettingLabel><CheckIcon>{currentQuality === q && <FaCheck />}</CheckIcon> {q}</SettingLabel>
              </SettingItem>
            ))}
          </>
        );
      case 'accessibility':
        return (
          <>
            <MenuHeader onClick={() => setActiveMenu('main')}><FaArrowLeft /> Accessibility</MenuHeader>
            <SettingItem onClick={() => setKeyboardAnimations(!keyboardAnimations)}>
              <SettingLabel>Keyboard Animations</SettingLabel>
              <ToggleSwitch active={keyboardAnimations} />
            </SettingItem>
            <SettingItem onClick={() => setActiveMenu('captionStyles')}>
              <SettingLabel>Caption Styles</SettingLabel>
              <SettingValue><FaChevronRight /></SettingValue>
            </SettingItem>
            <SettingItem onClick={() => setAutoSync(!autoSync)}>
              <SettingLabel>AutoSync</SettingLabel>
              <ToggleSwitch active={autoSync} />
            </SettingItem>
          </>
        );
      case 'captionStyles':
        return (
          <>
            <MenuHeader onClick={() => setActiveMenu('accessibility')}><FaArrowLeft /> Caption Styles</MenuHeader>
            <SettingItem onClick={() => setActiveMenu('family')}>
              <SettingLabel><FaClosedCaptioning /> Family</SettingLabel>
              <SettingValue>{fontFamily} <FaChevronRight /></SettingValue>
            </SettingItem>
            <SettingItem onClick={() => setActiveMenu('weight')}>
              <SettingLabel><FaClosedCaptioning /> Weight</SettingLabel>
              <SettingValue>{fontWeight} <FaChevronRight /></SettingValue>
            </SettingItem>
            <SettingItem onClick={() => setActiveMenu('border')}>
              <SettingLabel><FaClosedCaptioning /> Border</SettingLabel>
              <SettingValue>{borderOp}% <FaChevronRight /></SettingValue>
            </SettingItem>
          </>
        );
      case 'family':
        const families = ['Default', 'Trebuchet MS', 'Fira Sans', 'Nunito', 'Sans-Serif', 'Serif', 'Monospace'];
        return (
          <>
            <MenuHeader onClick={() => setActiveMenu('captionStyles')}><FaArrowLeft /> Family</MenuHeader>
            {families.map(f => (
              <SettingItem key={f} onClick={() => { setFontFamily(f); setActiveMenu('captionStyles'); }}>
                <SettingLabel><CheckIcon>{fontFamily === f && <FaCheck />}</CheckIcon> {f}</SettingLabel>
              </SettingItem>
            ))}
          </>
        );
      case 'weight':
        const weights = ['Bold', 'Normal'];
        return (
          <>
            <MenuHeader onClick={() => setActiveMenu('captionStyles')}><FaArrowLeft /> Weight</MenuHeader>
            {weights.map(w => (
              <SettingItem key={w} onClick={() => { setFontWeight(w); setActiveMenu('captionStyles'); }}>
                <SettingLabel><CheckIcon>{fontWeight === w && <FaCheck />}</CheckIcon> {w}</SettingLabel>
              </SettingItem>
            ))}
          </>
        );
      case 'border':
        return (
          <>
            <MenuHeader onClick={() => setActiveMenu('captionStyles')}><FaArrowLeft /> Border <span style={{marginLeft: 'auto', fontWeight: 400, color: '#aaa'}}>{borderOp}%</span></MenuHeader>
            <SliderContainer>
              <span style={{color: '#666', fontSize: 12}}>↓</span>
              <input type="range" min="0" max="100" value={borderOp} onChange={(e) => setBorderOp(e.target.value)} />
              <span style={{color: '#666', fontSize: 12}}>↑</span>
            </SliderContainer>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <PlayerWrapper ref={wrapperRef} isIdle={isIdle}>
      {loading && <LoadingSkeleton />}
      <Video 
        ref={videoRef} 
        onClick={togglePlay} 
        onDoubleClick={toggleFullscreen}
        crossOrigin="anonymous" 
      />

      {/* Double-tap seek zones for mobile */}
      <DoubleTapZone side="left" onClick={() => handleDoubleTap('left')} />
      <DoubleTapZone side="right" onClick={() => handleDoubleTap('right')} />
      {seekIndicator && (
        <SeekIndicator side={seekIndicator.side}>
          {seekIndicator.side === 'left' ? <FaUndo /> : <FaRedo />}
          {seekIndicator.seconds}s
        </SeekIndicator>
      )}
      
      {!isPlaying && !loading && (
        <CenterPlayButton onClick={togglePlay}>
          <FaPlay style={{ marginLeft: '6px' }} />
        </CenterPlayButton>
      )}
      
      {/* Legacy streamData intro/outro */}
      {streamData?.intro && currentTime >= streamData.intro.start && currentTime < streamData.intro.end - 1 && (
        <SkipOverlayButton onClick={() => { if (videoRef.current) videoRef.current.currentTime = streamData.intro.end; }}>
          Skip Opening
        </SkipOverlayButton>
      )}
      {streamData?.outro && currentTime >= streamData.outro.start && currentTime < streamData.outro.end - 1 && (
        <SkipOverlayButton onClick={() => { if (videoRef.current) videoRef.current.currentTime = streamData.outro.end; }}>
          Skip Ending
        </SkipOverlayButton>
      )}

      {/* AniSkip manual buttons */}
      {skipTimes && skipTimes.map((skip, idx) => {
         if (currentTime >= skip.interval.startTime && currentTime < skip.interval.endTime - 1) {
           return (
             <SkipOverlayButton key={idx} onClick={() => { if (videoRef.current) videoRef.current.currentTime = skip.interval.endTime; }}>
               Skip {skip.skipType === 'op' ? 'Opening' : 'Ending'}
             </SkipOverlayButton>
           );
         }
         return null;
      })}

        {/* Top Overlay for Title */}
        {title && (
          <TopOverlay className="controls-overlay" onClick={e => e.stopPropagation()}>
            {title}
          </TopOverlay>
        )}

        {/* Controls Overlay */}
        <ControlsOverlay className="controls-overlay" onClick={e => e.stopPropagation()}>
          {showSettings && (
            <SettingsMenu onClick={e => e.stopPropagation()}>
              {renderMenuContent()}
            </SettingsMenu>
          )}
          <ProgressContainer 
            ref={progressContainerRef} 
            onClick={handleSeek}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            {/* Hover Tooltip */}
            {hoverPos !== null && (
              <HoverTooltip style={{ left: `${hoverPos}%` }}>
                {formatTime(hoverTime)}
              </HoverTooltip>
            )}
            
            {/* Legacy streamData intro/outro */}
            {streamData?.intro && duration > 0 && (
              <TimelineMarker 
                start={(streamData.intro.start / duration) * 100} 
                width={((streamData.intro.end - streamData.intro.start) / duration) * 100} 
              />
            )}
            {streamData?.outro && duration > 0 && (
              <TimelineMarker 
                start={(streamData.outro.start / duration) * 100} 
                width={((streamData.outro.end - streamData.outro.start) / duration) * 100} 
              />
            )}
            
            {/* AniSkip intervals */}
            {skipTimes?.map((skip, idx) => (
              <TimelineMarker 
                key={idx}
                start={(skip.interval.startTime / duration) * 100} 
                width={((skip.interval.endTime - skip.interval.startTime) / duration) * 100} 
              />
            ))}
            
            <ProgressLoaded loaded={progress + 5} />
            <ProgressFilled progress={progress} />
          </ProgressContainer>
        
        <ControlsRow>
          <LeftControls>
            {(!isSyncMode || isHost) && (
              <ControlIcon onClick={togglePlay}>
                {isPlaying ? <FaPause /> : <FaPlay />}
              </ControlIcon>
            )}
            
            <VolumeContainer>
              <ControlIcon onClick={toggleMute}>
                {isMuted || volume === 0 ? <FaVolumeMute /> : <FaVolumeUp />}
              </ControlIcon>
              <input 
                type="range" 
                min="0" max="1" step="0.05" 
                value={isMuted ? 0 : volume} 
                onChange={handleVolumeChange} 
              />
            </VolumeContainer>
            
            <TimeDisplay>
              {formatTime(currentTime)} / {formatTime(duration)}
              {streamData?.intro && currentTime >= streamData.intro.start && currentTime < streamData.intro.end && <span style={{marginLeft: '6px'}}> • Intro</span>}
              {streamData?.outro && currentTime >= streamData.outro.start && currentTime < streamData.outro.end && <span style={{marginLeft: '6px'}}> • Outro</span>}
            </TimeDisplay>
          </LeftControls>
          
          <RightControls>
            {(!isSyncMode || isHost) && (
              <>
                <ControlIcon className="desktop-only" onClick={() => skip(-10)}><FaUndo size={14}/></ControlIcon>
                <ControlIcon className="desktop-only" onClick={() => skip(10)}><FaRedo size={14}/></ControlIcon>
                <ControlIcon className="desktop-only" title="Closed Captions"><FaClosedCaptioning size={16}/></ControlIcon>
              </>
            )}
            <ControlIcon onClick={handleDownload} title="Download"><FaDownload size={14}/></ControlIcon>
            <ControlIcon className="desktop-only" onClick={handleScreenshot} title="Screenshot"><FaCamera size={14}/></ControlIcon>
            {onToggleTheater && (
              <ControlIcon className="desktop-only" onClick={onToggleTheater} title="Theater Mode"><FaDesktop size={14}/></ControlIcon>
            )}
            <ControlIcon onClick={() => { setShowSettings(!showSettings); setActiveMenu('main'); }} title="Settings"><FaCog size={14}/></ControlIcon>
            <ControlIcon className="desktop-only" title="Cast"><FaChromecast size={14}/></ControlIcon>
            <ControlIcon className="desktop-only" onClick={togglePiP} title="Mini Player"><FaClone size={14}/></ControlIcon>
            <ControlIcon onClick={toggleFullscreen}>
              {isFullscreen ? <FaCompress size={14}/> : <FaExpand size={14}/>}
            </ControlIcon>
          </RightControls>
        </ControlsRow>
      </ControlsOverlay>
    </PlayerWrapper>
  );
};

export default CustomPlayer;

