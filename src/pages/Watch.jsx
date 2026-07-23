import DOMPurify from 'dompurify';
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import styled from 'styled-components';
import toast from 'react-hot-toast';
import NavBar from '../components/NavBar';
import CustomPlayer from '../components/CustomPlayer';
import AuthModal from '../components/AuthModal';
import { Helmet } from 'react-helmet-async';
import { MangaModal, ReportModal, RecapModal, WatchOrderModal } from '../components/WatchModals';
import JapaneseDictionary from '../components/JapaneseDictionary';
import { FaList, FaThLarge, FaSearch, FaBell, FaKeyboard, FaLightbulb, FaStepForward, FaStepBackward, FaPlay, FaClosedCaptioning, FaMicrophone, FaEye, FaImage, FaChevronDown, FaDownload, FaShareAlt, FaBug, FaBolt, FaBook, FaHistory, FaRoute, FaLanguage, FaStar, FaFolderOpen } from 'react-icons/fa';

const API_BASE = import.meta.env.VITE_API_BASE || `http://${window.location.hostname}:4001`;

const Container = styled.div`
  min-height: 100vh;
  background: #0b0b0e;
  color: var(--text-primary);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding-top: 61px;
  
  @media (max-width: 1024px) {
    overflow-y: auto;
  }

  @media (max-width: 768px) {
    padding-top: 110px;
  }
  @media (max-width: 480px) {
    padding-top: 110px;
  }
`;

const TheaterLayout = styled.div`
  display: flex;
  max-width: 100%;
  width: 100%;
  margin: 0 auto;
  padding: ${p => p.$isTheaterMode ? '20px 24px' : '20px 464px 20px 24px'};
  flex-direction: ${p => p.$isTheaterMode ? 'column' : 'row'};
  position: relative;
  align-items: flex-start;

  

  @media (max-width: 1024px) {
    flex-direction: column;
    padding: 20px 24px;
  }

  @media (max-width: 480px) {
    padding: 12px 8px;
  }
`;



// --- LEFT COLUMN: VIDEO PLAYER ---

const VideoSection = styled.div`

  width: 100%;

  display: flex;

  flex-direction: column;

`;



const PlayerContainer = styled.div`

  width: 100%;

  aspect-ratio: 16/9; /* Strictly force 16:9 so it dictates the height */

  background: #000;

  border-radius: 12px;

  overflow: hidden;

  position: relative;

`;



const LoadingOverlay = styled.div`

  position: absolute;

  top: 0; left: 0; right: 0; bottom: 0;

  display: flex;

  align-items: center;

  justify-content: center;

  background: #000;

  z-index: 10;

`;



const Spinner = styled.div`

  width: 40px;

  height: 40px;

  border: 3px solid rgba(255, 255, 255, 0.1);

  border-radius: 50%;

  border-top-color: #a881e6;

  animation: spin 1s ease-in-out infinite;

  

  @keyframes spin {

    to { transform: rotate(360deg); }

  }

`;



const ServerControlContainer = styled.div`

  display: flex;

  flex-direction: column;

  align-items: flex-end;

  gap: 12px;

  background: transparent;

  padding: 0;

  border: none;



  @media (max-width: 768px) {
    align-items: flex-start;
  }

  @media (max-width: 480px) {
    gap: 8px;
  }
`;



const ControlCluster = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 16px;

  @media (max-width: 480px) {
    flex-wrap: wrap;
    gap: 8px;
  }
`;



const SelectorGroup = styled.div`

  display: flex;

  flex-direction: column;

  align-items: center;

  gap: 4px;

`;



const SelectorLabel = styled.div`

  font-size: 10px;

  font-weight: 700;

  color: var(--text-muted);

  display: flex;

  align-items: center;

  gap: 4px;

`;



const SelectorDropdown = styled.div`

  background: #000;

  border: 1px solid rgba(255,255,255,0.1);

  border-radius: 6px;

  padding: 6px 12px;

  color: #fff;

  font-size: 13px;

  font-weight: 600;

  display: flex;

  align-items: center;

  gap: 12px;

  cursor: pointer;

  position: relative;

  transition: 0.2s;

  

  &:hover {

    background: #111;

    border-color: rgba(255,255,255,0.2);

  }

`;



const DropdownMenu = styled.div`

  position: absolute;

  top: 100%;

  left: 0;

  margin-top: 4px;

  background: #111;

  border: 1px solid rgba(255,255,255,0.1);

  border-radius: 8px;

  padding: 8px 0;

  min-width: 150px;

  z-index: 100;

  box-shadow: 0 10px 30px rgba(0,0,0,0.5);

`;



const DropdownItem = styled.div`

  padding: 8px 16px;

  font-size: 13px;

  font-weight: 600;

  color: ${p => p.active ? '#a881e6' : '#bbb'};

  display: flex;

  align-items: center;

  justify-content: space-between;

  cursor: pointer;

  transition: 0.2s;

  

  &:hover {

    background: rgba(255,255,255,0.05);

    color: #fff;

  }

  

  .badges {

    display: flex;

    gap: 6px;

  }

  

  .badge {

    font-size: 9px;

    padding: 2px 6px;

    border-radius: 12px;

    border: 1px solid rgba(255,255,255,0.1);

    color: var(--text-secondary);

  }

  

  .badge.dl { color: #81e6a2; border-color: rgba(129, 230, 162, 0.2); }

  .badge.sub { color: #81a2e6; border-color: rgba(129, 162, 230, 0.2); }

`;



const ActionButtonsRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: auto;
  padding-bottom: 2px;
  flex-wrap: wrap;

  @media (max-width: 480px) {
    gap: 4px;
  }
`;



const ActionButton = styled.button`

  background: transparent;

  border: 1px solid rgba(255,255,255,0.1);

  border-radius: 6px;

  padding: 6px 12px;

  color: #fff;

  font-size: 12px;

  font-weight: 600;

  display: flex;

  align-items: center;

  gap: 6px;

  cursor: pointer;

  transition: 0.2s;

  

  &:hover {

    background: rgba(255,255,255,0.05);

  }

  

  svg {

    color: #888;

  }

  &:hover svg {
    color: #fff;
  }

  @media (max-width: 480px) {
    padding: 6px 8px;
    font-size: 0;
    svg {
      font-size: 14px;
    }
  }
`;



const TextButton = styled.div`

  display: flex;

  align-items: center;

  gap: 6px;

  cursor: pointer;

  color: #666;

  transition: 0.2s;

  

  &:hover {

    color: #999;

  }

`;



const NavLink = styled.div`

  cursor: pointer;

  color: ${p => p.disabled ? '#333' : '#a881e6'};

  pointer-events: ${p => p.disabled ? 'none' : 'auto'};

  transition: 0.2s;

  

  &:hover {

    color: #d1baff;

  }

`;



const NavEpBtn = styled.button`

  background: transparent;

  border: none;

  color: #777;

  font-size: 12px;

  font-weight: 500;

  cursor: ${p => p.disabled ? 'default' : 'pointer'};

  opacity: ${p => p.disabled ? 0.3 : 1};

  display: flex;

  align-items: center;

  gap: 6px;

  transition: 0.2s;

  

  &:hover { color: ${p => p.disabled ? '#777' : '#fff'}; }

`;

// --- RIGHT: EPISODE SIDEBAR ---

const EpisodeSidebar = styled.div`

  width: ${p => p.$isTheaterMode ? '100%' : '420px'};

  background: var(--bg-primary);

  border: 1px solid var(--border-color);

  border-radius: 12px;

  display: flex;

  flex-direction: column;

  position: ${p => p.$isTheaterMode ? 'static' : 'absolute'};

  top: 20px;

  right: 24px;

  bottom: 20px;

  margin-top: ${p => p.$isTheaterMode ? '20px' : '0'};

  height: ${p => p.$isTheaterMode ? '500px' : 'auto'};

  

  @media (max-width: 1024px) {
    position: static;
    width: 100%;
    margin-top: 20px;
    height: 500px;
  }

  @media (max-width: 480px) {
    height: auto;
    max-height: 350px;
  }
`;



const SidebarHeader = styled.div`
  padding: 16px;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  gap: 8px; /* tighter gap for exact match */

  @media (max-width: 480px) {
    flex-wrap: wrap;
  }
`;



const SeasonSelect = styled.select`

  background: transparent;

  border: 1px solid rgba(255,255,255,0.15);

  color: var(--text-primary);

  padding: 6px 10px;

  border-radius: 6px;

  font-size: 13px;

  font-weight: 600;

  outline: none;

  cursor: pointer;

  

  option {

    background: var(--bg-primary);

    color: var(--text-primary);

  }

`;



const SearchInput = styled.div`
  flex: 1;
  background: transparent;
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: 6px;
  padding: 6px 10px;
  display: flex;
  align-items: center;

  @media (max-width: 480px) {
    min-width: 0;
    flex: 1 1 100%;
  }

  gap: 8px;

  color: var(--text-secondary);

  input {

    background: transparent;

    border: none;

    outline: none;

    color: var(--text-primary);

    width: 100%;

    font-size: 12px;

  }

`;



const ViewToggle = styled.div`

  display: flex;

  gap: 6px;

  

  .toggle-btn {

    display: flex;

    align-items: center;

    justify-content: center;

    width: 28px;

    height: 28px;

    border-radius: 6px;

    border: 1px solid rgba(255,255,255,0.15);

    color: var(--text-secondary);

    cursor: pointer;

    transition: 0.2s;

    

    &:hover {

      color: var(--text-primary);

      border-color: rgba(255,255,255,0.3);

    }

  }

`;



const EpisodeList = styled.div`

  flex: 1; /* Stretch to fill the sidebar */

  min-height: 0; /* Crucial for overflow scrolling in flex containers */

  overflow-y: auto;

  overscroll-behavior: contain; /* Prevents scroll chaining to the main page */

  padding: 16px;

  display: ${p => p.mode === 'grid' ? 'grid' : 'flex'};

  grid-template-columns: ${p => p.mode === 'grid' ? 'repeat(auto-fill, minmax(45px, 1fr))' : 'none'};

  flex-direction: column;

  align-content: start;

  gap: ${p => p.mode === 'grid' ? '8px' : '12px'};

  

  /* Miruro-style Scrollbar with Buttons */

  &::-webkit-scrollbar {

    width: 12px;

  }

  &::-webkit-scrollbar-track {

    background: var(--bg-primary);

    border-radius: 10px;

  }

  &::-webkit-scrollbar-thumb {

    background: #888;

    border-radius: 10px;

    border: 3px solid #111111;

  }

  &::-webkit-scrollbar-thumb:hover {

    background: #aaa;

  }

  

  /* Scrollbar Buttons (Up and Down Arrows) */

  &::-webkit-scrollbar-button:single-button {

    background-color: var(--bg-primary);

    display: block;

    height: 16px;

  }

  

  /* Up Arrow */

  &::-webkit-scrollbar-button:single-button:vertical:decrement {

    border-style: solid;

    border-width: 0 4px 5px 4px;

    border-color: transparent transparent #666 transparent;

  }

  &::-webkit-scrollbar-button:single-button:vertical:decrement:hover {

    border-color: transparent transparent #aaa transparent;

  }

  

  /* Down Arrow */

  &::-webkit-scrollbar-button:single-button:vertical:increment {

    border-style: solid;

    border-width: 5px 4px 0 4px;

    border-color: var(--text-muted) transparent transparent transparent;

  }

  &::-webkit-scrollbar-button:single-button:vertical:increment:hover {

    border-color: var(--text-secondary) transparent transparent transparent;

  }

  

  @media (max-width: 1024px) {

    max-height: 500px;

  }

`;



const EpGridItem = styled.div`

  background: ${p => p.active ? 'var(--accent-alt)' : p.isFiller ? 'rgba(243, 156, 18, 0.15)' : 'var(--btn-bg)'};

  color: ${p => p.active ? '#fff' : p.isFiller ? '#f39c12' : '#aaa'};

  border: ${p => p.active ? '1px solid var(--accent-alt)' : p.isFiller ? '1px solid rgba(243, 156, 18, 0.3)' : '1px solid transparent'};

  height: 38px;

  display: flex;

  align-items: center;

  justify-content: center;

  border-radius: 6px;

  font-size: 13px;

  font-weight: 700;

  cursor: pointer;

  transition: 0.2s;

  

  &:hover {

    background: ${p => p.active ? '#9b70de' : '#2a2a2a'};

    color: var(--text-primary);

  }

`;



const EpCard = styled.div`

  display: flex;

  flex-shrink: 0; /* Prevents the card from squishing when there are many episodes */

  height: 104px;

  width: 100%;

  gap: 12px;

  padding: 10px;

  border-radius: 8px;

  

  /* Current Episode Styling matching Miruro */

  background: ${p => p.active ? '#b1a1ea' : 'transparent'};

  border: 1px solid rgba(255,255,255,0.02);

  

  cursor: pointer;

  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

  position: relative;

  overflow: hidden;

  

  /* Hover Effects */
  &:hover { 
    background: ${p => p.active ? '#b1a1ea' : '#1e1e1e'}; 
  }

  @media (max-width: 480px) {
    height: auto;
    min-height: 70px;
  }
`;



const EpThumb = styled.div`

  height: 100%;

  aspect-ratio: 16/9; /* Thumbnail on left, 16:9 ratio */

  border-radius: 6px;

  background: #222;

  position: relative;

  overflow: hidden;

  flex-shrink: 0;

  

  img { 

    width: 100%; height: 100%; object-fit: cover; 

    opacity: ${p => p.active ? 1 : 0.7}; 

    transition: transform 0.3s, opacity 0.3s;

  }

  

  /* Hover zoom effect */
  ${EpCard}:hover img { 
    opacity: 1; 
    transform: scale(1.05); 
  }

  @media (max-width: 480px) {
    display: none;
  }
`;



const EpBadge = styled.div`

  position: absolute;

  bottom: 4px;

  left: 4px;

  background: rgba(0,0,0,0.8);

  color: var(--text-primary);

  font-size: 10px;

  font-weight: 800;

  padding: 3px 6px;

  border-radius: 4px;

`;



const EpInfo = styled.div`

  display: flex;

  flex-direction: column;

  justify-content: space-between;

  overflow: hidden;

  flex: 1;

`;



const EpTitle = styled.div`

  font-size: 13px;

  font-weight: 700;

  color: ${p => p.active ? '#111' : '#fff'};

  margin-bottom: 2px;

  white-space: nowrap;

  overflow: hidden;

  text-overflow: ellipsis;

`;



const EpDesc = styled.div`

  font-size: 11px;

  color: ${p => p.active ? '#444' : '#888'};

  line-height: 1.3;

  display: -webkit-box;

  -webkit-line-clamp: 3; /* Matches Miruro 3 line description */
  -webkit-box-orient: vertical;
  overflow: hidden;

  margin-bottom: 4px;

  @media (max-width: 480px) {
    display: none;
  }
`;



const EpMeta = styled.div`

  display: flex;

  justify-content: space-between;

  align-items: center;

  font-size: 10px;

  color: ${p => p.active ? '#555' : '#666'};

  font-weight: 600;

`;



const StickyFooter = styled.div`

  background: var(--bg-primary);

  padding: 16px;

  border-top: 1px solid rgba(255,255,255,0.05);

  font-size: 13px;

  font-weight: 600;

  display: flex;

  align-items: center;

  justify-content: center;

  gap: 10px;

  color: var(--text-secondary);

  span { color: #a881e6; font-weight: 800; }

`;



const RecommendationsWrapper = styled.div`

  max-width: 1920px;

  width: 100%;

  margin: 0 auto;

  padding: ${p => p.$isTheaterMode ? '0 24px 60px 24px' : '0 464px 60px 24px'};

  

  @media (max-width: 1024px) {

    padding: 0 24px 60px 24px;

  }

`;



const SectionTitle = styled.h2`

  font-size: 20px;

  color: var(--text-primary);

  margin-bottom: 20px;

  font-weight: 700;

  display: flex;

  align-items: center;

  gap: 8px;

`;



const RecGrid = styled.div`

  display: grid;

  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));

  gap: 20px;



  @media (max-width: 768px) {

    grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));

    gap: 12px;

  }

`;



const RecImageWrapper = styled.div`

  width: 100%;

  aspect-ratio: 2/3;

  border-radius: 8px;

  overflow: hidden;

  position: relative;

  margin-bottom: 8px;

  

  img {

    width: 100%;

    height: 100%;

    object-fit: cover;

    margin-bottom: 0;

  }

`;



const HoverOverlay = styled.div`

  position: absolute;

  top: 0; left: 0; right: 0; bottom: 0;

  background: rgba(0,0,0,0.5);

  display: flex;

  flex-direction: column;

  align-items: center;

  justify-content: center;

  opacity: 0;

  transition: 0.3s;

  gap: 8px;

`;



const PlayNowBtn = styled.button`

  background: #fff;

  color: #000;

  border: none;

  border-radius: 20px;

  padding: 8px 16px;

  font-size: 13px;

  font-weight: 700;

  display: flex;

  align-items: center;

  gap: 6px;

  cursor: pointer;

  box-shadow: 0 4px 10px rgba(0,0,0,0.3);

  transition: 0.2s;

  &:hover { transform: scale(1.05); }

`;



const DetailsBtn = styled.button`

  background: rgba(255,255,255,0.1);

  backdrop-filter: blur(4px);

  color: #fff;

  border: 1px solid rgba(255,255,255,0.4);

  border-radius: 20px;

  padding: 8px 24px;

  font-size: 13px;

  font-weight: 600;

  cursor: pointer;

  transition: 0.2s;

  &:hover { background: rgba(255,255,255,0.2); }

`;



const RecCard = styled.div`

  cursor: pointer;

  transition: transform 0.2s;

  

  &:hover {

    transform: translateY(-5px);

  }



  &:hover .hover-overlay {

    opacity: 1;

  }

  

  /* img styles moved to RecImageWrapper */

  

  .title {

    color: var(--text-primary);

    font-size: 13px;

    font-weight: 600;

    line-height: 1.4;

    display: -webkit-box;

    -webkit-line-clamp: 2;

    -webkit-box-orient: vertical;

    overflow: hidden;

  }

  

  .meta {

    color: var(--text-secondary);

    font-size: 11px;

    margin-top: 4px;

    display: flex;

    justify-content: space-between;

  }

`;



const DetailsWrapper = styled.div`

  display: flex;

  max-width: 1920px;

  width: 100%;

  margin: 0 auto;

  padding: ${p => p.$isTheaterMode ? '0 24px 40px 24px' : '0 464px 40px 24px'};



  @media (max-width: 1024px) {

    padding: 0 24px 40px 24px;

  }

  

  @media (max-width: 768px) {

    padding: 0 16px 20px 16px;

  }

  flex-direction: ${p => p.$isTheaterMode ? 'column' : 'row'};

  position: relative;

  align-items: flex-start;

  color: var(--text-primary);

  

  @media (max-width: 1024px) {
    flex-direction: column;
    padding: 0 24px 40px 24px;
  }

  @media (max-width: 480px) {
    padding: 12px;
  }
`;



const DetailsSection = styled.div`
  width: 100%;
  display: flex;
  gap: 24px;
  background: rgba(255,255,255,0.02);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 24px;
  color: var(--text-primary);

  @media (max-width: 768px) {
    gap: 16px;
  }

  @media (max-width: 480px) {
    padding: 12px;
    gap: 12px;
    flex-wrap: wrap;
  }
`;



const DetailsLeft = styled.div`

  flex: 0 0 220px;

  

  img {

    width: 100%;

    border-radius: 12px;

    box-shadow: 0 10px 30px rgba(0,0,0,0.5);

    aspect-ratio: 2/3;

    object-fit: cover;

  }

  @media (max-width: 768px) {
    flex: 0 0 auto;
    width: 150px;
  }

  @media (max-width: 480px) {
    width: 120px;

    img {
      border-radius: 8px;
    }
  }
`;



const DetailsRight = styled.div`

  flex: 1;

  display: flex;

  flex-direction: column;

  gap: 16px;

`;



const AnimeTitleText = styled.h1`
  font-size: 28px;
  font-weight: 800;
  margin: 0;
  color: var(--text-primary);
  letter-spacing: -0.5px;

  @media (max-width: 480px) {
    font-size: 20px;
  }
`;



const AnimeSubtitle = styled.div`

  font-size: 14px;

  color: var(--text-secondary);

  margin-top: -10px;

  text-transform: uppercase;

  font-style: italic;

`;



const RelatedSidebar = styled.div`

  width: ${p => p.$isTheaterMode ? '100%' : '420px'};

  position: ${p => p.$isTheaterMode ? 'static' : 'absolute'};

  margin-top: ${p => p.$isTheaterMode ? '24px' : '0'};

  right: 24px;

  top: 0;

  display: flex;

  flex-direction: column;

  gap: 16px;

  background: rgba(255,255,255,0.02);

  border: 1px solid var(--border-color);

  border-radius: 12px;

  padding: 16px;

  

  @media (max-width: 1024px) {
    position: static;
    width: 100%;
    margin-top: 24px;
  }

  @media (max-width: 480px) {
    padding: 0;
  }
`;



const RelatedCard = styled.div`
  display: flex;
  gap: 12px;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: background 0.2s;
  
  &:hover {
    background: rgba(255,255,255,0.05);
  }

  img {
    width: 60px;
    height: 85px;
    object-fit: cover;
    border-radius: 6px;
  }

  .info {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 6px;
    flex: 1;

    .title {
      color: #fff;
      font-size: 13px;
      font-weight: 700;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;

      .blue-dot {
        color: #3498db;
        margin-right: 6px;
      }
    }

    .meta {
      display: flex;
      gap: 12px;
      font-size: 11px;
      color: #888;
      font-weight: 600;
    }
  }
`;

const SeasonsContainer = styled.div`
  margin-bottom: 8px;
`;

const SeasonsHeader = styled.div`
  font-size: 16px;
  font-weight: 900;
  color: #fff;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  text-transform: uppercase;
`;

const SeasonsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  
  @media (max-width: 480px) {
    gap: 8px;
  }
`;

const SeasonCard = styled.div`
  position: relative;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  background: #111;
  border: 1px solid rgba(255,255,255,0.1);
  transition: all 0.2s ease;
  
  &:hover {
    border-color: var(--primary-color);
    transform: scale(1.02);
    
    img {
      opacity: 0.6;
    }
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: 0.35;
    transition: all 0.3s ease;
  }

  .title {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    font-weight: 800;
    font-size: 14px;
    color: #fff;
    text-shadow: 0 2px 4px rgba(0,0,0,0.9);
    padding: 8px;
    pointer-events: none;
    z-index: 2;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  
  ${p => p.$active && `
    border-color: var(--primary-color);
    box-shadow: 0 0 10px rgba(168, 129, 230, 0.3);
    .title {
      color: #a881e6;
    }
  `}
`;





const GenreList = styled.div`

  display: flex;

  gap: 8px;

  flex-wrap: wrap;

`;



const GenreTag = styled.span`

  background: rgba(255,255,255,0.1);

  color: #ccc;

  padding: 4px 12px;

  border-radius: 20px;

  font-size: 12px;

  font-weight: 600;

  transition: all 0.2s;

  

  &:hover {

    background: #a881e6;

    color: var(--text-primary);

    cursor: pointer;

  }

`;



const Synopsis = styled.div`

  font-size: 14px;

  line-height: 1.6;

  color: #bbb;

  background: rgba(255,255,255,0.03);

  padding: 20px;

  border-radius: 12px;

  border: 1px solid var(--border-color);

  

  a { color: #a881e6; text-decoration: none; }

`;



const MetaGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 20px;
  margin-top: 10px;
`;

const MetaItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;

  .label {
    font-size: 11px;
    color: var(--text-muted);
    text-transform: uppercase;
    font-weight: 700;
    letter-spacing: 0.5px;
  }

  .value {
    font-size: 13px;
    color: #eee;
    font-weight: 600;
  }
`;



const ModalOverlay = styled.div`

  position: fixed;

  top: 0; left: 0; right: 0; bottom: 0;

  background: rgba(0,0,0,0.7);

  backdrop-filter: blur(5px);

  z-index: 1000;

  display: flex;

  align-items: center;

  justify-content: center;

  animation: fadeIn 0.2s ease;

  

  @keyframes fadeIn {

    from { opacity: 0; }

    to { opacity: 1; }

  }

`;



const ModalContent = styled.div`

  background: #111;

  border-radius: 12px;

  width: 90%;

  max-width: 600px;

  padding: 24px;

  box-shadow: 0 10px 30px rgba(0,0,0,0.8);

  border: 1px solid rgba(255,255,255,0.05);

`;



const ModalHeader = styled.div`

  display: flex;

  align-items: center;

  font-size: 1.25rem;

  font-weight: 700;

  margin-bottom: 24px;

  gap: 10px;

  color: #fff;

`;



const ReportSectionTitle = styled.h3`

  font-size: 0.95rem;

  font-weight: 600;

  color: #aaa;

  margin-bottom: 16px;

`;



const CheckboxGrid = styled.div`

  display: grid;

  grid-template-columns: 1fr 1fr;

  gap: 16px;

  margin-bottom: 24px;

  

  @media (max-width: 600px) {

    grid-template-columns: 1fr;

  }

`;



const CheckboxLabel = styled.label`

  display: flex;

  align-items: center;

  gap: 12px;

  font-size: 0.95rem;

  color: #ccc;

  cursor: pointer;

  

  input {

    appearance: none;

    width: 20px;

    height: 20px;

    border-radius: 4px;

    border: 1px solid #444;

    background: transparent;

    cursor: pointer;

    position: relative;

    transition: all 0.2s;

    

    &:checked {

      background: #888;

      border-color: #888;

    }

    

    &:checked::after {

      content: '';

      position: absolute;

      left: 6px;

      top: 2px;

      width: 6px;

      height: 10px;

      border: solid #111;

      border-width: 0 2px 2px 0;

      transform: rotate(45deg);

    }

  }

`;



const NotesArea = styled.textarea`

  width: 100%;

  height: 120px;

  background: #161616;

  border: 1px solid #333;

  border-radius: 8px;

  padding: 12px;

  color: #fff;

  font-family: inherit;

  resize: none;

  margin-bottom: 24px;

  font-size: 0.95rem;

  

  &:focus {

    outline: none;

    border-color: #555;

  }

`;



const SubmitButton = styled.button`

  width: 100%;

  padding: 14px;

  background: #1a1a1a;

  border: 1px solid #333;

  border-radius: 8px;

  color: #ccc;

  font-weight: 600;

  font-size: 1rem;

  cursor: pointer;

  transition: all 0.2s;

  

  &:hover {

    background: #252525;

    color: #fff;

  }

`;



const Watch = () => {

  const { animeName: animeIdStr } = useParams();

  const navigate = useNavigate();

  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);

  const targetEpId = searchParams.get('ep');

  const targetTime = searchParams.get('t');



  const animeId = parseInt(animeIdStr, 10) || animeIdStr;

  const [episodesData, setEpisodesData] = useState({});

  const [audioLang, setAudioLang] = useState('sub');

  const [showAuthModal, setShowAuthModal] = useState(false);

  const user = localStorage.getItem('user');

  const [showReportModal, setShowReportModal] = useState(false);

  const [showMangaModal, setShowMangaModal] = useState(false);

  const [reportIssues, setReportIssues] = useState({

    missingServers: false,

    wontPlay: false,

    missingDownload: false,

    wrongShow: false

  });

  const [reportNotes, setReportNotes] = useState('');

  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  

  const [showRecapModal, setShowRecapModal] = useState(false);

  const [showWatchOrderModal, setShowWatchOrderModal] = useState(false);



  const [episodes, setEpisodes] = useState([]);

  const [hideFillers, setHideFillers] = useState(false);

  const [currentEpisodeIndex, setCurrentEpisodeIndex] = useState(0);

  const [streamData, setStreamData] = useState(null);

  const [skipTimes, setSkipTimes] = useState(null);

  const [loading, setLoading] = useState(true);

  const [isTheaterMode, setIsTheaterMode] = useState(false);

  const [error, setError] = useState(null);
  const [animeInfo, setAnimeInfo] = useState(null);
  const [franchiseSeasons, setFranchiseSeasons] = useState([]);

  const [viewMode, setViewMode] = useState('list');

  const [episodePage, setEpisodePage] = useState(0);



  const [autoPlay, setAutoPlay] = useState(false);

  const [autoSkip, setAutoSkip] = useState(true);

  const [isNeverSkip, setIsNeverSkip] = useState(false);

  const [autoNext, setAutoNext] = useState(true);



  const [learnJapaneseMode, setLearnJapaneseMode] = useState(false);

  const [dictQuery, setDictQuery] = useState('');

  const [dictResults, setDictResults] = useState([]);

  const [isDictLoading, setIsDictLoading] = useState(false);

  const [initialTime, setInitialTime] = useState(0);



  useEffect(() => {

    if (animeId) {

      const neverSkipList = JSON.parse(localStorage.getItem('neverSkipList') || '[]');

      setIsNeverSkip(neverSkipList.includes(animeId));

    }

  }, [animeId]);



  const toggleNeverSkip = () => {

    const neverSkipList = JSON.parse(localStorage.getItem('neverSkipList') || '[]');

    if (isNeverSkip) {

      const updated = neverSkipList.filter(id => id !== animeId);

      localStorage.setItem('neverSkipList', JSON.stringify(updated));

      setIsNeverSkip(false);

    } else {

      neverSkipList.push(animeId);

      localStorage.setItem('neverSkipList', JSON.stringify(neverSkipList));

      setIsNeverSkip(true);

    }

  };






  const [providersData, setProvidersData] = useState({});

  const [selectedServer, setSelectedServer] = useState(null);

  const [isServerDropdownOpen, setIsServerDropdownOpen] = useState(false);

  const [isAudioDropdownOpen, setIsAudioDropdownOpen] = useState(false);

  const [isRacing, setIsRacing] = useState(false);



  useEffect(() => {

    const fetchAnime = async () => {

      try {

        setLoading(true);



        const infoRes = await axios.get(`${API_BASE}/info/${animeId}`);
        setAnimeInfo(infoRes.data);
        const title = infoRes.data.title.english || infoRes.data.title.romaji || "Anime";
        document.title = `Watch ${title} - Shuyora`;

        try {
          const baseQuery = (infoRes.data.title.romaji || infoRes.data.title.english || "").split(' ').slice(0, 2).join(' ');
          const searchRes = await axios.get(`${API_BASE}/api/search?q=${encodeURIComponent(baseQuery)}`);
          const results = searchRes.data?.value || searchRes.data || [];
          const filtered = results.filter(r => ['TV', 'MOVIE'].includes(r.format) && r.episodes != null && r.episodes > 0 && r.seasonYear != null);
          // Deduplicate by ID
          const uniqueSeasons = Array.from(new Map(filtered.map(item => [item.id, item])).values());
          uniqueSeasons.sort((a, b) => (a.seasonYear || 0) - (b.seasonYear || 0));
          setFranchiseSeasons(uniqueSeasons.slice(0, 6));
        } catch (e) {
          console.error('Failed to fetch franchise seasons', e);
        }



        let epsRes = { data: { providers: {} } };
        try {
          epsRes = await axios.get(`${API_BASE}/episodes/${animeId}`);
        } catch (err) {
          console.warn("No episodes found for this ID (might be unaired or a movie without streams).");
        }

        const providers = epsRes.data.providers || {};
        const pNames = Object.keys(providers);
        
        const nowBuffer = new Date();
        nowBuffer.setDate(nowBuffer.getDate() + 2); // 2 days buffer

        // Clean providersData to remove unaired/future episodes
        pNames.forEach(pName => {
           if (providers[pName] && providers[pName].episodes) {
               ['sub', 'dub'].forEach(lang => {
                  if (providers[pName].episodes[lang]) {
                      providers[pName].episodes[lang] = providers[pName].episodes[lang].filter(ep => {
                          if (!ep.airDate) return true;
                          const airD = new Date(ep.airDate);
                          if (isNaN(airD)) return true;
                          return airD <= nowBuffer;
                      });
                      if (providers[pName].episodes[lang].length === 0) {
                          delete providers[pName].episodes[lang];
                      }
                  }
               });
           }
        });

        setProvidersData(providers);

        // Find best server for initial state
        const preferredOrder = [...new Set(['bonk', 'kiwi', 'hop', 'pewe', 'moo', 'bee', 'ally', ...pNames])];
        let bestServer = null;
        let compiledEps = { sub: null, dub: null };
        if (pNames.length > 0) {

          // Find the best 'sub' and 'dub' lists across all available providers



          // Prioritize providers that provide raw m3u8 streams (bonk, kiwi) over IP-locked providers (ally)

          const preferredOrder = ['bonk', 'kiwi', 'hop', 'pewe', 'moo', 'bee', 'ally', ...pNames];

          

          for (const pName of preferredOrder) {

            if (!providers[pName]) continue;

            const pEps = providers[pName].episodes || {};

            if (pEps.sub && !compiledEps.sub) compiledEps.sub = pEps.sub;

            if (pEps.dub && !compiledEps.dub) compiledEps.dub = pEps.dub;

            

            if (!bestServer && (pEps.sub || pEps.dub)) {

              bestServer = pName;

            }

            

            // Stop early if we have both

            if (compiledEps.sub && compiledEps.dub) break;

          }

          

          setSelectedServer(bestServer);

          setEpisodesData(compiledEps);

          

          const langs = Object.keys(compiledEps);

          if (langs.length > 0) {

            const defaultLang = langs.includes('sub') ? 'sub' : langs[0];

            const finalEps = compiledEps[defaultLang] || [];

            setAudioLang(defaultLang);

            setEpisodes(finalEps);

            

            if (targetEpId) {

              const targetIndex = finalEps.findIndex(e => e.id === targetEpId);

              if (targetIndex !== -1) {

                setCurrentEpisodeIndex(targetIndex);

              }

            }

          }

        }

        setLoading(false);

      } catch (err) {
        console.error(err);
        setError(`Error: ${err.message} | ${err.stack}`);
        setLoading(false);
      }

    };

    if (animeId) fetchAnime();

  }, [animeId]);



  const racedEpisodeRef = useRef(-1);
  const targetTimeUsedRef = useRef(false);



  // The Server Race: Instantly find the absolute fastest server in the background

  useEffect(() => {

    if (episodes.length === 0 || !selectedServer || Object.keys(providersData).length === 0) return;

    

    if (racedEpisodeRef.current === currentEpisodeIndex) return;

    racedEpisodeRef.current = currentEpisodeIndex;

    

    const raceServers = async () => {
      const globalPreferred = ['bonk', 'kiwi', 'hop', 'pewe', 'moo', 'bee', 'ally'];
      
      // Sort servers by preference and only race the top 3 available ones (allowlist)
      const allServers = Object.keys(providersData)
         .filter(p => providersData[p].episodes && providersData[p].episodes[audioLang])
         .sort((a, b) => {
             const idxA = globalPreferred.indexOf(a) !== -1 ? globalPreferred.indexOf(a) : 99;
             const idxB = globalPreferred.indexOf(b) !== -1 ? globalPreferred.indexOf(b) : 99;
             return idxA - idxB;
         })
         .slice(0, 3); // ONLY race the top 3 to prevent API spam

      if (allServers.length < 2) return;
      
      setIsRacing(true);
      const ac = new AbortController();
      
      const wait = (ms, signal) => new Promise((resolve, reject) => {
          if (signal?.aborted) return reject(new Error('Aborted'));
          const t = setTimeout(resolve, ms);
          if (signal) {
              signal.addEventListener('abort', () => {
                  clearTimeout(t);
                  reject(new Error('Aborted'));
              }, { once: true });
          }
      });
      
      try {
        const winner = await Promise.any(
          allServers.map(async (serverName, index) => {
             // Happy Eyeballs stagger: delay backup servers so the primary server has a head start
             if (index > 0) {
                 await wait(index * 300, ac.signal);
             }

             const ep = providersData[serverName].episodes[audioLang][currentEpisodeIndex];

             if (!ep) throw new Error('No episode');

             

             const res = await axios.get(`${API_BASE}/${ep.id}`, { signal: ac.signal });

             if (!res.data || !res.data.streams) throw new Error('No streams');

             

             const validStreams = res.data.streams.filter(s => s.type !== 'embed');

             if (validStreams.length === 0) throw new Error('No video streams');

             

             const pingUrl = `/api/proxy?url=${encodeURIComponent(validStreams[0].url)}&referer=${encodeURIComponent(validStreams[0].referer || 'https://allmanga.to/')}`;

             

             const pingRes = await fetch(pingUrl, { credentials: 'include', signal: ac.signal });

             if (!pingRes.ok && pingRes.status !== 206) throw new Error('Ping failed');

             

             const contentType = pingRes.headers.get('content-type') || '';

             if (contentType.includes('text/html')) throw new Error('Invalid stream content');

             

             return serverName;

          })

        );

        

        ac.abort(); // Cancel the losers

        

        setSelectedServer(prevServer => {

           if (winner !== prevServer) {

              console.log(`Server Race Won by ${winner}! Hot-swapping from ${prevServer}...`);

              return winner;

           }

           console.log(`Server Race Won by ${winner} (already selected)`);

           return prevServer;

        });

        

      } catch (err) {

         console.log("Server race failed or was aborted");

      } finally {

         setIsRacing(false);

      }

    };

    

    // Safe to race servers now using Happy Eyeballs stagger
    raceServers();
  }, [currentEpisodeIndex, episodes.length, providersData, audioLang]);



  // Fetch AniSkip times when episode changes

  useEffect(() => {

    const malId = animeInfo?.idMal || animeInfo?.malId;

    if (malId && episodes[currentEpisodeIndex]?.number) {

      setSkipTimes(null);

      fetch(`https://api.aniskip.com/v2/skip-times/${malId}/${episodes[currentEpisodeIndex].number}?types[]=ed&types[]=op&episodeLength=0`)

        .then(res => res.json())

        .then(data => {

          if (data.found) {

            setSkipTimes(data.results);

          }

        })

        .catch(err => console.error('AniSkip error:', err));

    }

  }, [animeInfo, currentEpisodeIndex, episodes]);



  // Fetch initial timestamp from history or URL

  useEffect(() => {
    if (animeInfo && episodes[currentEpisodeIndex]) {
      if (targetTime && !targetTimeUsedRef.current) {
        targetTimeUsedRef.current = true;
        setInitialTime(parseFloat(targetTime));
        return;
      }

      

      const history = JSON.parse(localStorage.getItem('watchHistory') || '[]');

      const epNumber = episodes[currentEpisodeIndex].number;

      const entry = history.find(h => h.animeId == animeInfo.id && h.episodeNumber == epNumber);

      

      // Only restore time if they haven't finished the episode (less than 30s remaining)

      if (entry && entry.currentTime && entry.duration && (entry.duration - entry.currentTime > 30)) {

        setInitialTime(entry.currentTime);

      } else {

        setInitialTime(0);

      }

    }

  }, [animeInfo, currentEpisodeIndex, episodes, targetTime]);



  // Handle Audio Change

  const handleAudioChange = (lang) => {

    if (episodesData[lang]) {

      setAudioLang(lang);

      setEpisodes(episodesData[lang]);

    }

  };

  const lastHistorySaveRef = useRef(0);



  const handleProgress = useCallback((currentTime, duration) => {
    const now = Date.now();
    if (now - lastHistorySaveRef.current > 5000 && animeInfo && episodes[currentEpisodeIndex]) {
      lastHistorySaveRef.current = now;
      const history = JSON.parse(localStorage.getItem('watchHistory') || '[]');
      const animeId = animeInfo.id;
      
      const existingIndex = history.findIndex(h => h.animeId === animeId);
      const newEntry = {
        animeId,
        title: animeInfo.title?.english || animeInfo.title?.romaji,
        image: animeInfo.bannerImage || episodes[currentEpisodeIndex].image || episodes[currentEpisodeIndex].img || animeInfo.coverImage?.extraLarge || animeInfo.coverImage?.large || animeInfo.image,
        episodeNumber: episodes[currentEpisodeIndex].number,
        episodeId: episodes[currentEpisodeIndex].id,
        currentTime,
        duration,
        watchedAt: now
      };
      
      if (existingIndex > -1) {
        history.splice(existingIndex, 1);
      }
      history.unshift(newEntry);
      
      localStorage.setItem('watchHistory', JSON.stringify(history));
    }
  }, [animeInfo, episodes, currentEpisodeIndex]);
  useEffect(() => {

    const fetchStream = async () => {

      if (episodes.length === 0 || !selectedServer || !providersData[selectedServer]) return;

      

      const handleServerFallback = (failedServer) => {

        const preferredOrder = [...new Set(['bonk', 'kiwi', 'hop', 'pewe', 'moo', 'bee', 'ally', ...Object.keys(providersData)])];

        const currentIndex = preferredOrder.indexOf(failedServer);

        if (currentIndex !== -1) {
           for (let i = currentIndex + 1; i < preferredOrder.length; i++) {
              const nextServer = preferredOrder[i];
              if (providersData[nextServer] && providersData[nextServer].episodes[audioLang]) {
                 console.log(`Auto-fallback: ${failedServer} failed, switching to ${nextServer}`);
                 setSelectedServer(nextServer);
                 return true;
              }
           }
        }
        
        // If all servers for current language fail, try the other language
        const otherLang = audioLang === 'sub' ? 'dub' : 'sub';
        for (let i = 0; i < preferredOrder.length; i++) {
           const nextServer = preferredOrder[i];
           if (providersData[nextServer] && providersData[nextServer].episodes[otherLang]) {
              console.log(`All servers failed for ${audioLang}. Auto-falling back to ${otherLang} on server ${nextServer}`);
              setAudioLang(otherLang);
              setEpisodes(providersData[nextServer].episodes[otherLang]);
              setSelectedServer(nextServer);
              return true;
           }
        }
        
        return false;
      };



      try {

        setLoading(true);

        const serverEpisodes = providersData[selectedServer].episodes[audioLang];

        if (!serverEpisodes || !serverEpisodes[currentEpisodeIndex]) {

          const didFallback = handleServerFallback(selectedServer);

          if (!didFallback) {

            setError(`Episode not available on server: ${selectedServer}`);

            setLoading(false);

          }

          return;

        }

        

        const epId = serverEpisodes[currentEpisodeIndex].id;

        const cleanedEpId = epId.startsWith("watch/") ? epId.replace("watch/", "") : epId; const watchRes = await axios.get(`${API_BASE}/watch/${cleanedEpId}`);

          

          // Wrap stream URLs with local CORS proxy, but leave embeds untouched

          if (watchRes.data && watchRes.data.streams && watchRes.data.streams.length > 0) {

             const processedStreams = watchRes.data.streams.map(s => {

               if (s.type === 'embed' || s.url.includes('videoembed')) {

                 return s;

               }

               return {

                 ...s,

                 url: `/api/proxy?url=${encodeURIComponent(s.url)}&referer=${encodeURIComponent(s.referer || 'https://allmanga.to/')}`

               };

             });

             

             watchRes.data.streams = processedStreams;

             

             // Automatically ping the streams to find the fastest one, ONLY if there are multiple choices
             const videoStreams = processedStreams.filter(s => s.type !== 'embed');

             if (videoStreams.length > 1) {
                 const ac = new AbortController();
                 const promises = videoStreams.map(s => 
                    fetch(s.url, { credentials: 'include', signal: ac.signal })
                      .then(r => {
                         const contentType = r.headers.get('content-type') || '';
                         if ((r.ok || r.status === 206) && !contentType.includes('text/html')) return s;
                         throw new Error('Not OK');
                      })
                 );
                 
                 Promise.any(promises).then(fastest => {
                    ac.abort();
                    let finalStreams = processedStreams;
                    if (fastest !== videoStreams[0]) {
                      console.log("Auto-switching to fastest stream inside server:", fastest.server || 'Unknown');
                      finalStreams = [fastest, ...processedStreams.filter(s => s !== fastest)];
                    }
                    setStreamData({ ...watchRes.data, streams: finalStreams });
                    setLoading(false);
                 }).catch(e => {
                    console.log('All streams for server failed ping test:', selectedServer);
                    const didFallback = handleServerFallback(selectedServer);
                    if (!didFallback) {
                       setError("Failed to fetch stream sources on all servers.");
                       setLoading(false);
                    }
                 });
             } else {
                 setStreamData({ ...watchRes.data, streams: processedStreams });
                 setLoading(false);
             }

          } else {
             throw new Error("No streams returned from provider");
          }

        } catch (err) {

        console.error("Stream fetch failed for server", selectedServer, err);

        const didFallback = handleServerFallback(selectedServer);

        if (!didFallback) {

           setError("Failed to fetch stream sources. The video might be unavailable.");

           setLoading(false);

        }

      }

    };

    fetchStream();

  }, [currentEpisodeIndex, episodes, selectedServer]);



  // Pre-fetch the next episode in the background

  useEffect(() => {

    if (episodes.length === 0 || !selectedServer || !providersData || !providersData[selectedServer]) return;

    

    const serverEpisodes = providersData[selectedServer]?.episodes?.[audioLang];

    const nextEpisodeIndex = currentEpisodeIndex + 1;

    

    if (serverEpisodes && serverEpisodes[nextEpisodeIndex]) {

      const nextEpId = serverEpisodes[nextEpisodeIndex].id;

      // Silently request the next episode so the proxy caches it

      const cleanedNextEpId = nextEpId.startsWith("watch/") ? nextEpId.replace("watch/", "") : nextEpId; axios.get(`${API_BASE}/watch/${cleanedNextEpId}`).catch(e => {

        // Ignore prefetch errors silently

      });

    }

  }, [currentEpisodeIndex, episodes, selectedServer, providersData, audioLang]);



  // Generate chunks for the dropdown

  const epsSource = useMemo(() => hideFillers ? episodes.filter(e => !e.filler) : episodes, [hideFillers, episodes]);

  const chunkCount = Math.ceil(epsSource.length / 100);

  const chunkOptions = Array.from({ length: chunkCount }, (_, i) => {

    const start = i * 100 + 1;

    const end = Math.min((i + 1) * 100, epsSource.length);

    return { label: `${start} - ${end}`, value: i };

  });



  // Calculate episodes for the current page

  const visibleEpisodes = useMemo(() => epsSource.slice(episodePage * 100, (episodePage + 1) * 100), [epsSource, episodePage]);





  const handleVideoEnd = async () => {

    // Award Points

    const token = localStorage.getItem('isAuthenticated');

    if (token) {

      try {

        await fetch("http://$(${window.location.hostname}):4001/reward", { credentials: 'include',

          method: 'POST',

          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },

          body: JSON.stringify({ points: 10 })

        });

      } catch (err) {

        console.error('Failed to earn points:', err);

      }

    }



    if (autoNext && currentEpisodeIndex < episodes.length - 1) {

      setCurrentEpisodeIndex(currentEpisodeIndex + 1);

    }

  };



  const getAiringString = () => {

    if (!animeInfo) return 'Loading...';

    if (animeInfo.status === 'FINISHED' || animeInfo.status === 'COMPLETED') {

      return 'Completed';

    }

    if (animeInfo.nextAiringEpisode) {

      const ep = animeInfo.nextAiringEpisode.episode;

      const date = new Date(animeInfo.nextAiringEpisode.airingAt * 1000);

      

      const now = new Date();

      const diffMs = date - now;

      if (diffMs > 0) {

        const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        const hours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);

        

        const options = { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };

        const dateString = date.toLocaleString('en-US', options);

        

        return <span><b>Episode {ep}</b> in {days}d {hours}h - {dateString}</span>;

      }

    }

    return 'Unknown Status';

  };



  const submitReport = async () => {

    setIsSubmittingReport(true);

    

    // Discord Webhook URL for reports

    const WEBHOOK_URL = "https://discord.com/api/webhooks/1526226469460774944/DHjGpkvS-y5HaKy1nrinVgEiM8PjFlsd7uNDU6Ma5zCk5R9dXGd2_8QZ321eERd7yQbo";

    

    const issuesList = [];

    if (reportIssues.missingServers) issuesList.push("- Missing servers or providers");

    if (reportIssues.wontPlay) issuesList.push("- Selected episode won't play");

    if (reportIssues.missingDownload) issuesList.push("- Missing download link");

    if (reportIssues.wrongShow) issuesList.push("- Wrong show (title, synopsis, etc)");

    

    const payload = {

      content: "🚨 **New Episode Report** 🚨",

      embeds: [{

        title: `Report for Episode ${episodes[currentEpisodeIndex]?.number} - ${animeInfo?.title?.english || animeInfo?.title?.romaji || "Unknown Anime"}`,

        url: window.location.href,

        color: 16711680,

        fields: [

          { name: "Anime ID", value: String(animeId), inline: true },

          { name: "Current Server", value: selectedServer || "Unknown", inline: true },

          { name: "Selected Issues", value: issuesList.length > 0 ? issuesList.join("\n") : "None selected" },

          { name: "Notes", value: reportNotes || "No notes provided" }

        ],

        timestamp: new Date().toISOString()

      }]

    };



    try {

      if (WEBHOOK_URL) {

        await fetch(WEBHOOK_URL, { credentials: 'include',

          method: 'POST',

          headers: { 'Content-Type': 'application/json' },

          body: JSON.stringify(payload)

        });

      } else {

        console.warn("Discord Webhook URL not set! Payload:", payload);

      }

      setShowReportModal(false);

      setReportIssues({ missingServers: false, wontPlay: false, missingDownload: false, wrongShow: false });

      setReportNotes('');

      toast.success("Report submitted! We'll fix it soon.");

    } catch (err) {

      console.error("Failed to submit report:", err);

      toast.error("Failed to submit report.");

    } finally {

      setIsSubmittingReport(false);

    }

  };



  return (

    <Container>

      <NavBar />



      <TheaterLayout $isTheaterMode={isTheaterMode}>

        {/* LEFT COLUMN: PLAYER & CONTROLS */}

        <VideoSection>

          <PlayerContainer>

            {loading ? (

              <LoadingOverlay><Spinner /></LoadingOverlay>

            ) : error ? (

              <LoadingOverlay>

                <div style={{ color: 'white', fontSize: '1.2rem', textAlign: 'center' }}>

                  <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>⚠️</span>

                  {error}

                </div>

              </LoadingOverlay>

            ) : streamData ? (

              <div style={{width: '100%', height: '100%', position: 'relative'}}>

                {learnJapaneseMode && (

                  <div style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(0,0,0,0.6)', padding: '5px 10px', borderRadius: '5px', zIndex: 100, color: '#ff4d4d', fontSize: '0.8rem', fontWeight: 'bold' }}>

                    <FaLanguage /> DICTIONARY ACTIVE

                  </div>

                )}

                {(() => {

                const firstStream = streamData.streams?.[0];

                if (firstStream?.type === 'embed' || (firstStream?.url && firstStream.url.includes('videoembed'))) {

                  return (

                    <iframe 

                      src={firstStream.url} 

                      width="100%" 

                      height="100%" 

                      style={{ border: 'none', background: '#000', borderRadius: '12px' }} 

                      allowFullScreen 

                    />

                  );

                }

                return (

                  <CustomPlayer 

                    streamData={streamData}

                    skipTimes={skipTimes}

                    autoPlay={autoPlay}

                    title={`${animeInfo?.title?.english || animeInfo?.title?.romaji || ""} - Episode ${episodes[currentEpisodeIndex]?.number || ''}${episodes[currentEpisodeIndex]?.title ? `: ${episodes[currentEpisodeIndex].title}` : ''}`}

                    audioLang={audioLang}

                    hasDub={!!providersData[selectedServer]?.episodes?.dub}

                    onAudioChange={handleAudioChange}

                    onSwitchServer={() => {

                      // handled by selectedServer state, but player can tell us if it wants to switch.

                    }}

                    autoSkip={autoSkip && !isNeverSkip}

                    onVideoEnd={handleVideoEnd}

                    onProgress={handleProgress}

                    onToggleTheater={() => setIsTheaterMode(!isTheaterMode)}
                    initialTime={initialTime}
                    onError={() => {
                       console.log("CustomPlayer reported a fatal error. Triggering fallback.");
                       const didFallback = handleServerFallback(selectedServer);
                       if (!didFallback) {
                          setError("Failed to play the video. All streams and backups failed.");
                          setLoading(false);
                       }
                    }}
                  />

                );

              })()}

              </div>

            ) : (

              <LoadingOverlay><Spinner /></LoadingOverlay>

            )}

          </PlayerContainer>

        </VideoSection>



        {/* RIGHT COLUMN: EPISODES OR DICTIONARY */}

        {learnJapaneseMode ? (

          <JapaneseDictionary isTheaterMode={isTheaterMode} />

        ) : (

          <EpisodeSidebar $isTheaterMode={isTheaterMode}>

            <SidebarHeader>

            <SeasonSelect value={episodePage} onChange={(e) => setEpisodePage(Number(e.target.value))}>

              {chunkOptions.length > 0 ? (

                chunkOptions.map(opt => (

                  <option key={opt.value} value={opt.value}>{opt.label}</option>

                ))

              ) : (

                <option value={0}>1 - 0</option>

              )}

            </SeasonSelect>

            <SearchInput>

              <FaSearch size={10} />

              <input type="text" placeholder="Filter episodes..." />

            </SearchInput>

            <ViewToggle>

              <div 

                className="toggle-btn" 

                style={{ 

                  color: hideFillers ? "#ff4d4d" : "#888", 

                  borderColor: hideFillers ? "rgba(255,77,77,0.3)" : "rgba(255,255,255,0.15)",

                  marginRight: '8px',

                  padding: '0 8px',

                  fontSize: '11px',

                  fontWeight: 'bold',

                  width: 'auto'

                }} 

                onClick={() => setHideFillers(!hideFillers)}

                title="Hide Filler Episodes" aria-label="Hide Filler Episodes"

              >

                No Fillers

              </div>

              <div className="toggle-btn" style={{ color: viewMode === 'list' ? "#fff" : "#888", borderColor: viewMode === 'list' ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.15)" }} onClick={() => setViewMode('list')} aria-label="List View">

                <FaEye size={14} />

              </div>

              <div className="toggle-btn" style={{ color: viewMode === 'grid' ? "#fff" : "#888", borderColor: viewMode === 'grid' ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.15)" }} onClick={() => setViewMode('grid')} aria-label="Grid View">

                <FaImage size={14} />

              </div>

            </ViewToggle>

          </SidebarHeader>



          <EpisodeList mode={viewMode}>

            {visibleEpisodes.map((ep, idx) => {

              // Map visual index back to absolute index in the master array

              const actualIndex = episodes.findIndex(e => e.id === ep.id);

              const isActive = actualIndex === currentEpisodeIndex;

              const isFiller = ep.filler;

              

              if (viewMode === 'grid') {

                return (

                  <EpGridItem 

                    key={ep.id} 

                    active={isActive} 

                    isFiller={isFiller}

                    onClick={() => setCurrentEpisodeIndex(actualIndex)}

                    style={{ position: 'relative' }}

                  >

                    {ep.number}

                  </EpGridItem>

                );

              }

              return (

                <EpCard 

                  key={ep.id} 

                  active={isActive} 

                  onClick={() => setCurrentEpisodeIndex(actualIndex)}

                  style={isFiller && !isActive ? { background: 'rgba(243, 156, 18, 0.05)', borderLeft: '3px solid #f39c12' } : {}}

                >

                  <EpThumb active={isActive}>

                    <img loading="lazy" src={ep.image || ep.thumbnail || ep.img || animeInfo?.bannerImage || animeInfo?.coverImage?.large} alt={`Ep ${ep.number}`} />

                    <EpBadge>EP {ep.number}</EpBadge>

                  </EpThumb>

                  <EpInfo>

                    <EpTitle active={isActive}>

                      {ep.title || `Episode ${ep.number}`}

                      {isFiller && <span style={{ marginLeft: '8px', fontSize: '9px', background: 'rgba(255,77,77,0.2)', color: '#ff4d4d', padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase' }}>Filler</span>}

                    </EpTitle>

                    <EpDesc>

                      {ep.description || ep.desc || `Watch Episode ${ep.number} of ${animeInfo?.title?.english || animeInfo?.title?.romaji || 'this anime'}.`}

                    </EpDesc>

                    <EpMeta>

                      <span style={{ display: 'flex', gap: '6px', alignItems: 'center' }}><FaClosedCaptioning /> Sub &nbsp; <FaMicrophone /> Dub</span>

                      <span>📅 {ep.airDate || ep.createdAt ? new Date(ep.airDate || ep.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : 'Jan 11, 2021'}</span>

                    </EpMeta>

                  </EpInfo>

                </EpCard>

              )

            })}

          </EpisodeList>



          <StickyFooter>

            <FaBell color="#a881e6"/> {getAiringString()}

          </StickyFooter>

        </EpisodeSidebar>

        )}

      </TheaterLayout>



      {animeInfo && (

        <DetailsWrapper $isTheaterMode={isTheaterMode}>
          <DetailsSection>
            <DetailsLeft>
              <img loading="lazy" src={animeInfo.coverImage?.extraLarge || animeInfo.coverImage?.large} alt="Cover" />
            </DetailsLeft>
            <DetailsRight>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>

                <div>

                  <AnimeTitleText>{animeInfo.title?.english || animeInfo.title?.romaji}</AnimeTitleText>

                  {animeInfo.title?.native && <AnimeSubtitle>{animeInfo.title.native}</AnimeSubtitle>}

                </div>

              {/* Server controls hidden on mobile, shown on desktop */}
              <ServerControlContainer className="desktop-server-controls">

                <ControlCluster>

                    <SelectorGroup>

                      <SelectorLabel><FaClosedCaptioning size={10} /> AUDIO</SelectorLabel>

                      <SelectorDropdown onClick={() => { setIsAudioDropdownOpen(!isAudioDropdownOpen); setIsServerDropdownOpen(false); }}>

                        <span style={{background: '#fff', color: '#000', padding: '1px 4px', borderRadius: '4px', fontSize: '9px', fontWeight: '800'}}>CC</span>

                        {audioLang === 'sub' ? 'Sub' : 'Dub'} <FaChevronDown size={10} color="#666" />

                        

                        {isAudioDropdownOpen && (

                          <DropdownMenu>

                            <DropdownItem active={audioLang === 'sub'} onClick={(e) => { e.stopPropagation(); handleAudioChange('sub'); setIsAudioDropdownOpen(false); }}>

                              Sub {episodesData.sub ? '' : '(Unavailable)'}

                            </DropdownItem>

                            <DropdownItem active={audioLang === 'dub'} onClick={(e) => { e.stopPropagation(); handleAudioChange('dub'); setIsAudioDropdownOpen(false); }}>

                              Dub {episodesData.dub ? '' : '(Unavailable)'}

                            </DropdownItem>

                          </DropdownMenu>

                        )}

                      </SelectorDropdown>

                    </SelectorGroup>

                    

                    <SelectorGroup>

                      <SelectorLabel><FaList size={10} /> SERVER ({Object.keys(providersData).length})</SelectorLabel>

                      <SelectorDropdown onClick={() => { setIsServerDropdownOpen(!isServerDropdownOpen); setIsAudioDropdownOpen(false); }}>

                        <FaBolt size={12} color={isRacing ? "#f39c12" : "inherit"} /> 

                        <span style={{ color: isRacing ? "#f39c12" : "inherit" }}>

                          {isRacing ? "Auto-Selecting..." : selectedServer}

                        </span>

                        <FaChevronDown size={10} color="#666" />

                        

                        {isServerDropdownOpen && (

                          <DropdownMenu>

                            {Object.keys(providersData).map(p => {

                               const pEps = providersData[p].episodes || {};

                               const hasSub = !!pEps.sub;

                               const hasDub = !!pEps.dub;

                               if (!hasSub && !hasDub) return null;

                               

                               return (

                                 <DropdownItem 

                                   key={p} 

                                   active={selectedServer === p}

                                   onClick={(e) => { e.stopPropagation(); setSelectedServer(p); setIsServerDropdownOpen(false); }}

                                 >

                                   {p}

                                   <div className="badges">

                                     {hasSub && <span className="badge sub">S-SUB</span>}

                                     {hasDub && <span className="badge dl">DUB</span>}

                                   </div>

                                 </DropdownItem>

                               );

                            })}

                          </DropdownMenu>

                        )}

                      </SelectorDropdown>

                    </SelectorGroup>



                    <SelectorGroup>

                      <SelectorLabel><FaStepForward size={10} /> AUTO SKIP</SelectorLabel>

                      <div style={{ display: 'flex', gap: '15px', alignItems: 'center', background: 'rgba(255,255,255,0.05)', padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>

                        <div 

                          onClick={() => setAutoSkip(!autoSkip)} aria-label="Toggle Auto Skip"

                          style={{ color: autoSkip ? '#2ecc71' : '#888', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold' }}

                        >

                          GLOBAL {autoSkip ? 'ON' : 'OFF'}

                        </div>

                        <div style={{ width: '1px', height: '15px', background: 'rgba(255,255,255,0.2)' }}></div>

                        <div 

                          onClick={toggleNeverSkip} aria-label="Toggle Never Skip for this anime"

                          style={{ color: isNeverSkip ? '#f39c12' : '#888', cursor: 'pointer', fontSize: '0.8rem', fontWeight: isNeverSkip ? 'bold' : 'normal' }}

                          title="If enabled, auto-skip will ignore this specific anime."

                        >

                          NEVER SKIP THIS SHOW

                        </div>

                      </div>

                    </SelectorGroup>

                  </ControlCluster>

                  

                  <ActionButtonsRow>

                    {animeInfo?.format !== 'MOVIE' && (

                      <ActionButton 

                        style={{ background: 'rgba(46, 204, 113, 0.15)', color: '#2ecc71', borderColor: 'rgba(46, 204, 113, 0.3)' }}

                        onClick={() => setShowMangaModal(true)}

                      >

                        <FaBook /> Continue in Manga

                      </ActionButton>

                    )}

                    <ActionButton aria-label="Open Watch Order" onClick={() => setShowWatchOrderModal(true)}><FaRoute /> Watch Order</ActionButton>

                    <ActionButton aria-label="Open Story Recap" onClick={() => setShowRecapModal(true)}><FaHistory /> Story So Far</ActionButton>

                    <ActionButton 

                      style={{ background: 'rgba(255, 215, 0, 0.15)', color: '#ffd700', borderColor: 'rgba(255, 215, 0, 0.3)' }}

                      onClick={() => user ? navigate(`/anime/${animeInfo.id}`, { state: { tab: 'Reviews' } }) : setShowAuthModal(true)}

                    >

                      <FaStar /> Reviews

                    </ActionButton>

                    <ActionButton 

                      onClick={() => user ? setLearnJapaneseMode(!learnJapaneseMode) : setShowAuthModal(true)}

                      style={{ background: learnJapaneseMode ? 'rgba(255, 77, 77, 0.15)' : 'rgba(255, 255, 255, 0.05)', color: learnJapaneseMode ? '#ff4d4d' : '#fff' }}

                    >

                      <FaLanguage /> {learnJapaneseMode ? 'Exit Learn Mode' : 'Learn Japanese Mode'}

                    </ActionButton>

                    <ActionButton onClick={() => user ? setShowReportModal(true) : setShowAuthModal(true)}><FaBug /> Report</ActionButton>

                    <ActionButton onClick={() => alert('Share feature coming soon')}><FaShareAlt /> Share</ActionButton>

                  </ActionButtonsRow>

                </ServerControlContainer>

              </div>

              

              {animeInfo.genres && (

                <GenreList>

                  {animeInfo.genres.map(g => (

                    <GenreTag key={g}>{g}</GenreTag>

                  ))}

                </GenreList>

              )}

              

              <Synopsis dangerouslySetInnerHTML={{ __html: animeInfo.description || 'No description available.' }} />

              

              <MetaGrid>

                {animeInfo.format && (

                  <MetaItem>

                    <span className="label">Format:</span>

                    <span className="value">{animeInfo.format}</span>

                  </MetaItem>

                )}

                {animeInfo.episodes && (

                  <MetaItem>

                    <span className="label">Episodes:</span>

                    <span className="value">{animeInfo.episodes}</span>

                  </MetaItem>

                )}

                {animeInfo.duration && (

                  <MetaItem>

                    <span className="label">Duration:</span>

                    <span className="value">{animeInfo.duration} min</span>

                  </MetaItem>

                )}

                {animeInfo.status && (

                  <MetaItem>

                    <span className="label">Status:</span>

                    <span className="value">{animeInfo.status}</span>

                  </MetaItem>

                )}

                {animeInfo.averageScore && (

                  <MetaItem>

                    <span className="label">Rating:</span>

                    <span className="value">{animeInfo.averageScore} / 100</span>

                  </MetaItem>

                )}

                {animeInfo.seasonYear && (

                  <MetaItem>

                    <span className="label">Season:</span>

                    <span className="value">{animeInfo.season} {animeInfo.seasonYear}</span>

                  </MetaItem>

                )}

              </MetaGrid>
            </DetailsRight>
          </DetailsSection>

          

          {animeInfo.relations?.edges?.length > 0 && (
            <RelatedSidebar $isTheaterMode={isTheaterMode}>
              
              {(() => {
                // Separate seasons from other related content
                const otherEdges = animeInfo.relations.edges.filter(e => 
                  e.node?.type === 'ANIME' && 
                  !['PREQUEL', 'SEQUEL', 'PARENT', 'SIDE_STORY'].includes(e.relationType)
                );

                // Helper to format season names cleanly
                const formatSeasonTitle = (title, format) => {
                   const t = title.toLowerCase();
                   if (t.includes('season 1') || t.includes('1st season')) return 'Season 1';
                   if (t.includes('season 2') || t.includes('2nd season')) return 'Season 2';
                   if (t.includes('season 3') || t.includes('3rd season')) return 'Season 3';
                   if (t.includes('season 4') || t.includes('4th season')) return 'Season 4';
                   if (t.includes('season 5') || t.includes('5th season')) return 'Season 5';
                   if (format === 'MOVIE') return 'Movie';
                   if (format === 'OVA' || format === 'SPECIAL' || format === 'ONA') return 'Specials';
                   return title.length > 25 ? title.substring(0, 22) + '...' : title;
                };

                return (
                  <>
                    {franchiseSeasons.length > 0 && (
                      <SeasonsContainer>
                        <SeasonsHeader>
                          <FaFolderOpen size={14} /> SEASONS
                        </SeasonsHeader>
                        <SeasonsGrid>
                          {franchiseSeasons.map((season, idx) => {
                            const isCurrent = season.id.toString() === animeId.toString();
                            const displayTitle = isCurrent ? "Current" : formatSeasonTitle(season.title?.english || season.title?.romaji || season.title_english || season.title_romaji || '', season.format);
                            const imgUrl = season.coverImage?.large || season.coverImage || season.bannerImage;
                            
                            return (
                              <SeasonCard key={season.id || idx} $active={isCurrent} onClick={() => !isCurrent && navigate(`/watch/${season.id}`)}>
                                <img loading="lazy" src={imgUrl} alt={displayTitle} />
                                <div className="title">{displayTitle}</div>
                              </SeasonCard>
                            );
                          })}
                        </SeasonsGrid>
                      </SeasonsContainer>
                    )}

                    {(otherEdges.length > 0 || franchiseSeasons.length === 0) && (
                      <div style={{ marginTop: franchiseSeasons.length > 0 ? '8px' : '0' }}>
                        <div style={{ fontSize: '16px', fontWeight: 900, color: '#fff', marginBottom: '12px' }}>&gt; RELATED</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          {(otherEdges.length > 0 ? otherEdges : animeInfo.relations.edges).slice(0, 6).map((edge, idx) => {
                            const item = edge.node;
                            if (!item || item.type !== 'ANIME') return null;
                            return (
                              <RelatedCard key={item.id || idx} onClick={() => navigate(`/watch/${item.id}`)}>
                                <img loading="lazy" src={item.coverImage?.large} alt={item.title?.english || item.title?.romaji} />
                                <div className="info">
                                  <div className="title">
                                    <span className="blue-dot">•</span>
                                    {item.title?.english || item.title?.romaji}
                                  </div>
                                  <div className="meta">
                                    <span>{item.format}</span>
                                    <span>📺 {item.episodes || '?'}</span>
                                    <span>⭐ {item.meanScore || item.averageScore || '?'}</span>
                                  </div>
                                </div>
                              </RelatedCard>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </>
                );
              })()}
            </RelatedSidebar>
          )}

        </DetailsWrapper>

      )}



      {animeInfo?.recommendations?.nodes?.length > 0 && (

        <RecommendationsWrapper $isTheaterMode={isTheaterMode}>

          <SectionTitle>💎 Recommended Anime</SectionTitle>

          <RecGrid>

            {animeInfo.recommendations.nodes.slice(0, 12).map((rec, idx) => {

              const item = rec.mediaRecommendation;

              if (!item) return null;

              return (

                <RecCard key={item.id || idx} onClick={() => navigate(`/watch/${item.id}`)}>

                  <RecImageWrapper>

                    <img loading="lazy" src={item.coverImage?.large} alt={item.title?.english || item.title?.romaji} />

                    <HoverOverlay className="hover-overlay">

                      <PlayNowBtn><FaPlay size={10}/> Play Now</PlayNowBtn>

                      <DetailsBtn onClick={(e) => { e.stopPropagation(); navigate(`/anime/${item.id}`); }}>Details</DetailsBtn>

                    </HoverOverlay>

                  </RecImageWrapper>

                  <div className="title">{item.title?.english || item.title?.romaji}</div>

                  <div className="meta">

                    <span>{item.format} • {item.episodes || '?'} EPS</span>

                    <span>⭐ {item.averageScore ? (item.averageScore / 10).toFixed(1) : '?'}</span>

                  </div>

                </RecCard>

              );

            })}

          </RecGrid>

        </RecommendationsWrapper>

      )}



            {showMangaModal && <MangaModal onClose={() => setShowMangaModal(false)} />}
      
      {showReportModal && (
        <ReportModal 
          onClose={() => setShowReportModal(false)} 
          currentEpisode={episodes[currentEpisodeIndex]}
          reportIssues={reportIssues}
          setReportIssues={setReportIssues}
          reportNotes={reportNotes}
          setReportNotes={setReportNotes}
          submitReport={submitReport}
          isSubmittingReport={isSubmittingReport}
        />
      )}

      {showRecapModal && <RecapModal onClose={() => setShowRecapModal(false)} animeInfo={animeInfo} />}
      
      {showWatchOrderModal && <WatchOrderModal onClose={() => setShowWatchOrderModal(false)} animeInfo={animeInfo} />}

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />

    </Container>

  );

};



export default Watch;



