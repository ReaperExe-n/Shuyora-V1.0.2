import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import axios from 'axios';
import { FaPlayCircle, FaInfoCircle, FaStar, FaClock, FaChevronLeft, FaChevronRight, FaChevronDown, FaTimes, FaReddit, FaDiscord, FaTwitter, FaPlay, FaCalendarAlt, FaClosedCaptioning, FaTiktok } from 'react-icons/fa';
import NavBar from '../components/NavBar';

const API_BASE = import.meta.env.VITE_API_BASE || `http://${window.location.hostname}:4001`;

const MainWrapper = styled.div`
  min-height: 100vh;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-family: 'Inter', sans-serif;
  overflow-x: hidden;
  padding-top: 61px;

  @media (max-width: 768px) {
    padding-top: 110px;
  }
`;

const ContentContainer = styled.div`
  padding: 20px 24px;
  max-width: 100%;
  margin: 0 auto;
  
  @media (max-width: 768px) {
    padding: 12px 16px;
  }

  @media (max-width: 480px) {
    padding: 8px 12px;
  }
`;

// --- HERO SLIDER ---
const HeroWrapper = styled.div`
  width: 100%;
  height: 60vh;
  min-height: 400px;
  border-radius: 16px;
  overflow: hidden;
  position: relative;
  background: var(--bg-secondary);

  @media (max-width: 768px) {
    height: 45vh;
    min-height: 280px;
    border-radius: 12px;
  }

  @media (max-width: 480px) {
    height: 40vh;
    min-height: 250px;
  }
`;

const HeroBg = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: linear-gradient(to right, rgba(17,17,17,1) 0%, rgba(17,17,17,0.4) 50%, transparent 100%), 
                    linear-gradient(to top, rgba(17,17,17,1) 0%, transparent 40%),
                    url(${p => p.bg});
  background-size: cover;
  background-position: center;
`;

const HeroTopNav = styled.div`
  position: absolute;
  top: 20px;
  left: 20px;
  right: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 10;
`;

const AiringBadge = styled.div`
  background: var(--overlay);
  backdrop-filter: blur(5px);
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const PaginationControls = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const PageArrow = styled.button`
  background: #2a2a2e;
  border: none;
  color: #fff;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  &:hover { background: #404044; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const PageCount = styled.div`
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  padding: 0 8px;
`;

const HeroBottom = styled.div`
  position: absolute;
  bottom: 30px;
  left: 30px;
  right: 30px;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  z-index: 10;

  @media (max-width: 768px) {
    bottom: 20px;
    left: 16px;
    right: 16px;
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
`;

const HeroInfo = styled.div`
  max-width: 700px;
`;

const MetaRow = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
  align-items: center;
`;

const SmallPill = styled.span`
  background: rgba(255,255,255,0.1);
  backdrop-filter: blur(5px);
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const HeroTitle = styled.h1`
  font-size: 42px;
  font-weight: 800;
  margin: 0 0 10px 0;
  line-height: 1.1;
  text-shadow: 2px 2px 10px rgba(0,0,0,0.5);

  @media (max-width: 768px) {
    font-size: 28px;
  }

  @media (max-width: 480px) {
    font-size: 22px;
  }
`;

const TagsRow = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 15px;
`;

const Tag = styled.span`
  background: var(--overlay);
  border: 1px solid var(--border-color-strong);
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
`;

const HeroDesc = styled.p`
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.6;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;

  @media (max-width: 768px) {
    display: none;
  }
`;

const HeroActions = styled.div`
  display: flex;
  gap: 12px;
  
  @media (max-width: 480px) {
    flex-wrap: wrap;
    width: 100%;
  }
`;

const ActionBtn = styled.button`
  background: ${p => p.primary ? '#fff' : 'rgba(0,0,0,0.5)'};
  color: ${p => p.primary ? '#000' : '#fff'};
  border: ${p => p.primary ? 'none' : '1px solid rgba(255,255,255,0.1)'};
  padding: 10px 20px;
  border-radius: 24px;
  font-size: 14px;
  font-weight: 800;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: 0.2s;
  &:hover { transform: scale(1.05); }
`;

// --- GENRES ROW ---
const GenresContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 20px;

  @media (max-width: 480px) {
    .genre-arrow {
      display: none;
    }
  }
`;

const GenreBtn = styled.button`
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
  padding: 10px 24px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
  transition: 0.2s;
  &:hover { background: var(--btn-hover); color: var(--text-primary); }
`;

const ArrowBtn = styled(PageArrow)`
  border-radius: 50%;
  width: 28px;
  height: 28px;
  background: var(--bg-secondary);
`;

// --- WATCH HISTORY ---
const SectionHeader = styled.div`
  margin-top: 40px;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
`;

const Subtitle = styled.div`
  color: var(--text-secondary);
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 4px;
`;

const Title = styled.h2`
  font-size: 24px;
  font-weight: 800;
  margin: 0;
`;

const HistorySliderWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 15px;
  margin-bottom: 40px;
`;

const HistoryGrid = styled.div`
  display: flex;
  gap: 12px;
  overflow-x: auto;
  scrollbar-width: none;
  ms-overflow-style: none;
  scroll-behavior: smooth;
  flex: 1;
  &::-webkit-scrollbar { display: none; }
`;

const HistoryCard = styled.div`
  background: #111;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.05);
  cursor: pointer;
  transition: 0.3s;
  flex: 0 0 calc(25% - 9px);
  
  @media (max-width: 1024px) {
    flex: 0 0 calc(33.333% - 8px);
  }
  @media (max-width: 768px) {
    flex: 0 0 calc(50% - 6px);
  }
  @media (max-width: 480px) {
    flex: 0 0 75%;
  }
  
  &:hover {
    transform: translateY(-4px);
    border-color: rgba(255, 255, 255, 0.15);
  }
  
  &:hover img {
    filter: brightness(1.1);
  }
`;

const ThumbWrapper = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 16/9;
  background: #222;
`;

const ThumbImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: 0.3s;
`;

const CloseIcon = styled.div`
  position: absolute;
  top: 8px;
  right: 8px;
  background: var(--overlay);
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  &:hover { color: var(--text-primary); background: rgba(0,0,0,0.8); }
`;

const EpBadge = styled.div`
  position: absolute;
  bottom: 12px;
  left: 8px;
  background: rgba(0,0,0,0.8);
  color: var(--text-primary);
  font-size: 11px;
  font-weight: 800;
  padding: 3px 6px;
  border-radius: 4px;
`;

const TimeBadge = styled.div`
  position: absolute;
  bottom: 12px;
  right: 8px;
  background: rgba(0,0,0,0.8);
  color: var(--text-primary);
  font-size: 11px;
  font-weight: 700;
  padding: 3px 6px;
  border-radius: 4px;
`;

const ProgressBar = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background: rgba(255,255,255,0.2);
  div {
    height: 100%;
    background: #ef4444;
    width: ${p => p.progress}%;
  }
`;

const AnimeTitle = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 10px 12px;
`;

// --- COMMUNITY BANNER ---
const Banner = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 20px 24px;
  margin-top: 40px;
  margin-bottom: 40px;

  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
    gap: 20px;
    padding: 16px;
  }
`;

const BannerLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const BannerIcon = styled.img`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
`;

const BannerText = styled.div`
  h3 { margin: 0 0 4px 0; font-size: 18px; font-weight: 800; }
  p { margin: 0; font-size: 14px; color: var(--text-secondary); font-weight: 500; }
`;

const BannerSocials = styled.div`
  display: flex;
  gap: 12px;
`;

const SocialIcon = styled.div`
  width: 40px;
  height: 40px;
  background: var(--bg-secondary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: ${p => p.color || '#fff'};
  transition: 0.2s;
  &:hover { background: var(--btn-hover); transform: scale(1.1); }
`;

// --- LOWER LAYOUT (MAIN + SIDEBAR) ---
const LowerLayout = styled.div`
  display: flex;
  gap: 30px;
  margin-top: 40px;
  @media (max-width: 1200px) {
    flex-direction: column;
  }
`;

const MainColumn = styled.div`
  flex: 1;
`;

const SidebarColumn = styled.div`
  width: 350px;
  @media (max-width: 1200px) { width: 100%; }
`;

const TabsRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const TabsGroup = styled.div`
  display: flex;
  background: transparent;
  gap: 4px;

  @media (max-width: 480px) {
    flex-wrap: wrap;
    gap: 8px;
  }
`;

const Tab = styled.button`
  background: ${p => p.active ? '#a881e6' : '#2a2a2e'};
  color: ${p => p.active ? '#ffffff' : '#a0a0a0'};
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover { 
    background: ${p => p.active ? '#a881e6' : '#3a3a3e'};
    color: #fff;
  }

  @media (max-width: 480px) {
    padding: 8px 14px;
    font-size: 12px;
  }
`;

const PosterGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 32px 24px;

  @media (max-width: 1400px) {
    grid-template-columns: repeat(5, 1fr);
  }
  @media (max-width: 1100px) {
    grid-template-columns: repeat(4, 1fr);
  }
  @media (max-width: 768px) {
    grid-template-columns: repeat(3, 1fr);
  }
  @media (max-width: 480px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const PosterCard = styled.div`
  cursor: pointer;
  display: flex;
  flex-direction: column;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
  will-change: transform, box-shadow;

  &:hover {
    transform: scale(1.04);
  }
  &:hover .hover-overlay { opacity: 1; }
  &:hover .poster-img { filter: brightness(1.1); }
`;

const PosterImgWrapper = styled.div`
  width: 100%;
  aspect-ratio: 2/3;
  border-radius: 16px;
  overflow: hidden;
  position: relative;
  margin-bottom: 12px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.3);
  transition: box-shadow 0.25s ease;

  ${PosterCard}:hover & {
    box-shadow: 0 8px 20px rgba(0,0,0,0.5);
  }
`;

const PosterImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: filter 0.25s ease;
  display: block;
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

const PosterTitle = styled.div`
  font-size: 14px;
  font-weight: 700;
  color: #fff;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.3;
  margin-bottom: 6px;
`;

const StatusDot = styled.span`
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${p => p.color || '#4ade80'};
  margin-right: 6px;
  vertical-align: middle;
`;

const PosterMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
`;

const MetaBadge = styled.span`
  background: #2a2a2e;
  color: #a0a0a0;
  font-size: 11px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
  height: 20px;
`;

// --- SIDEBAR CARDS ---
const SidebarSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: rgba(25, 25, 25, 0.5);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
`;

const SidebarTitle = styled.h3`
  font-size: 16px;
  font-weight: 800;
  color: #fff;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const SmallCard = styled.div`
  display: flex;
  gap: 12px;
  padding: 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: 0.2s;
  &:hover { background: var(--bg-secondary); }
`;

const SmallThumb = styled.img`
  width: 60px;
  height: 80px;
  border-radius: 6px;
  object-fit: cover;
`;

const SmallInfo = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  overflow: hidden;
`;

const SmallTitle = styled.div`
  font-size: 13px;
  font-weight: 700;
  color: var(--text-primary);
  display: flex;
  align-items: flex-start;
  gap: 6px;
  margin-bottom: 8px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const SmallMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 11px;
  color: var(--text-secondary);
  font-weight: 600;
`;

// --- MIDDLE LAYOUT (3 COLUMN) ---
const MiddleLayout = styled.div`
  display: grid;
  grid-template-columns: 1.2fr 1.2fr 1fr;
  gap: 20px;
  margin-top: 40px;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr 1fr;
  }
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ListColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: rgba(25, 25, 25, 0.5);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 16px;
`;

const ListHeader = styled.div`
  font-size: 16px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--text-primary);
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ListCard = styled.div`
  position: relative;
  height: 90px;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  align-items: center;
  cursor: pointer;
  background: var(--bg-primary);
  transition: transform 0.2s, box-shadow 0.2s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.5);
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background-image: url(${p => p.bg});
    background-size: cover;
    background-position: center;
    opacity: 0.15;
    z-index: 0;
  }
`;

const ListCardContent = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  width: 100%;
  height: 100%;
  padding: 8px;
  gap: 12px;
`;

const ListCardThumb = styled.img`
  width: 54px;
  height: 100%;
  object-fit: cover;
  border-radius: 6px;
`;

const ListCardInfo = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  flex: 1;
  min-width: 0;
`;

const ListCardTitle = styled.div`
  font-size: 15px;
  font-weight: 700;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
  
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ListCardMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 11px;
  color: #777;
  font-weight: 500;
  
  span {
    display: flex;
    align-items: center;
    gap: 4px;
    
    svg {
      color: #555;
    }
  }
  
  .format {
    font-weight: 800;
    color: #999;
  }
`;

const ViewMoreBtn = styled.button`
  background: rgba(255, 255, 255, 0.03);
  border: none;
  border-radius: 6px;
  padding: 10px;
  color: var(--text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: 0.2s;
  margin-top: 4px;
  
  &:hover {
    background: rgba(255, 255, 255, 0.08);
    color: var(--text-primary);
  }
`;

const ScheduleContainer = styled.div`
  background: transparent;
  display: flex;
  flex-direction: column;
`;

const ScheduleHeader = styled.div`
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 2px;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 600;
`;

const ScheduleTitle = styled.div`
  font-size: 24px;
  font-weight: 900;
  color: var(--text-primary);
  margin-bottom: 16px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const ScheduleDays = styled.div`
  display: flex;
  align-items: baseline;
  gap: 12px;
  margin-bottom: 8px;
  color: var(--text-muted);
  font-size: 24px;
  font-weight: 900;
  text-transform: uppercase;
  
  .active {
    color: var(--text-primary);
    font-size: 36px;
  }

  @media (max-width: 480px) {
    font-size: 18px;
    gap: 8px;
    .active { font-size: 26px; }
  }
`;

const ScheduleDate = styled.div`
  font-size: 15px;
  font-weight: 600;
  color: var(--text-secondary);
  letter-spacing: 0.5px;
  margin-bottom: 16px;
  text-transform: uppercase;
`;

const ScheduleList = styled.div`
  display: flex;
  flex-direction: column;
  background: rgba(20, 20, 20, 0.8);
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--border-color);
`;

const ScheduleItem = styled.div`
  display: flex;
  align-items: center;
  padding: 12px 14px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.03);
  border-left: ${p => p.active ? '2px solid #a881e6' : '2px solid transparent'};
  cursor: pointer;
  transition: 0.2s;
  
  &:last-child {
    border-bottom: none;
  }
  
  &:hover {
    background: rgba(255, 255, 255, 0.05);
  }
`;

const STime = styled.div`
  font-size: 11px;
  color: var(--text-secondary);
  width: 40px;
`;

const SName = styled.div`
  flex: 1;
  font-size: 12px;
  font-weight: 600;
  color: #ddd;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin: 0 10px;
`;

const SEp = styled.div`
  font-size: 10px;
  font-weight: 700;
  background: rgba(255, 255, 255, 0.05);
  padding: 4px 6px;
  border-radius: 4px;
  color: var(--text-secondary);
`;

const Home = () => {
  const navigate = useNavigate();
  const genresRef = useRef(null);
  const historyRef = useRef(null);
  const [spotlight, setSpotlight] = useState([]);
  const [trending, setTrending] = useState([]);
  const [popular, setPopular] = useState([]);
  const [activeTab, setActiveTab] = useState('NEWEST');
  const [tabPage, setTabPage] = useState(1);
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  
  const [watchHistory, setWatchHistory] = useState([]);

  useEffect(() => {
    // 1. Load real watch history from localStorage
    const savedHistory = JSON.parse(localStorage.getItem('watchHistory') || '[]');
    
    const formattedHistory = savedHistory.map(entry => {
      // Calculate progress percentage
      let progressPct = 0;
      if (entry.duration > 0 && entry.currentTime > 0) {
        progressPct = Math.round((entry.currentTime / entry.duration) * 100);
      }
      
      // Format time (e.g. 14:32)
      const formatTime = (secs) => {
        if (!secs || isNaN(secs)) return "00:00";
        const m = Math.floor(secs / 60);
        const s = Math.floor(secs % 60);
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
      };

      return {
        id: entry.animeId, // Used for URL routing
        episodeId: entry.episodeId, // Used for precise resuming and prefetching
        title: entry.title,
        ep: entry.episodeNumber,
        time: formatTime(entry.currentTime),
        total: formatTime(entry.duration),
        rawTime: entry.currentTime, // Needed for URL parameter
        progress: progressPct,
        img: entry.image || 'https://via.placeholder.com/400x225?text=No+Image'
      };
    });
    
    setWatchHistory(formattedHistory);

    // 2. Pre-fetch the first 3 items in the Continue Watching list!
    // This tells the backend proxy to cache these streams instantly.
    formattedHistory.slice(0, 3).forEach(item => {
      if (item.episodeId) {
        axios.get(`${API_BASE}/watch/${item.episodeId}`).catch(() => {});
      }
    });

  }, []);

  const handleRemoveHistory = (e, id) => {
    e.stopPropagation();
    setWatchHistory(prev => prev.filter(item => item.id !== id));
  };

  const scrollHistory = (direction) => {
    if (historyRef.current) {
      const scrollAmount = historyRef.current.offsetWidth;
      historyRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  const scrollGenres = (direction) => {
    if (genresRef.current) {
      const scrollAmount = 300;
      genresRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  const [bannerIndex, setBannerIndex] = useState(0);
  const bannerData = [
    { platform: 'Reddit', title: 'Love the Site?', subtitle: 'Join our Subreddit', icon: 'https://www.redditstatic.com/desktop2x/img/favicon/apple-icon-57x57.png' },
    { platform: 'Discord', title: 'Want to Chat?', subtitle: 'Join our Discord', icon: 'https://assets-global.website-files.com/6257adef93867e50d84d30e2/636e0a6a49cf127bf92de1e2_icon_clyde_blurple_RGB.png' },
    { platform: 'TikTok', title: 'Watch Edits?', subtitle: 'Follow our TikTok', icon: 'https://cdn-icons-png.flaticon.com/512/3046/3046121.png' }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setBannerIndex(prev => (prev + 1) % bannerData.length);
    }, 4001);
    return () => clearInterval(interval);
  }, []);

  const genres = ['Action', 'Adventure', 'Comedy', 'Drama', 'Ecchi', 'Fantasy', 'Horror', 'Isekai', 'Mahou Shoujo', 'Magic', 'Mecha', 'Music', 'Mystery', 'Psychological', 'Romance', 'Sci-Fi', 'Seinen', 'Shounen', 'Slice of Life', 'Sports', 'Supernatural', 'Thriller'];

  useEffect(() => {
    document.title = 'Home - Shuyora';
    const fetchData = async () => {
      try {
        const cachedHome = localStorage.getItem('homeCache_anilist');
        if (cachedHome) {
          const parsed = JSON.parse(cachedHome);
          if (parsed.spotlight) setSpotlight(parsed.spotlight);
          if (parsed.trending) setTrending(parsed.trending);
          if (parsed.popular) setPopular(parsed.popular);
        }

        const API_BASE = import.meta.env.VITE_API_BASE || `http://${window.location.hostname}:4001`;
        const response = await axios.get(`${API_BASE}/api/home`);
        const data = response.data?.data; // axios.data then graphql.data

        if (!data) return;

        const mapAnime = (a) => ({
          id: a.id,
          title: { 
            english: a.title.english || a.title.romaji || a.title.native,
            romaji: a.title.romaji || a.title.english
          },
          coverImage: { 
            extraLarge: a.coverImage?.extraLarge,
            large: a.coverImage?.large || a.coverImage?.extraLarge
          },
          bannerImage: a.bannerImage || a.coverImage?.extraLarge,
          description: a.description || 'No description available.',
          episodes: a.episodes || '?',
          duration: a.duration ? `${a.duration}` : '?',
          format: a.format || 'TV',
          averageScore: a.averageScore,
          startDate: { year: a.seasonYear },
          genres: a.genres || []
        });

        const freshSpotlight = data.spotlight.media.map(mapAnime);
        const freshTrending = data.trending.media.map(mapAnime);
        const freshPopular = data.popular.media.map(mapAnime);

        setSpotlight(freshSpotlight);
        setTrending(freshTrending);
        setPopular(freshPopular);

        localStorage.setItem('homeCache_anilist', JSON.stringify({
          spotlight: freshSpotlight,
          trending: freshTrending,
          popular: freshPopular
        }));
      } catch (err) {
        console.error("Error fetching homepage data:", err);
      }
    };
    fetchData();
  }, []);

  const heroAnime = spotlight[currentHeroIndex];
  
  const handlePrevHero = () => {
    if (spotlight.length === 0) return;
    setCurrentHeroIndex(prev => (prev === 0 ? spotlight.length - 1 : prev - 1));
  };

  const handleNextHero = () => {
    if (spotlight.length === 0) return;
    setCurrentHeroIndex(prev => (prev === spotlight.length - 1 ? 0 : prev + 1));
  };
  
  // Derived lists for new layout
  const justFinished = popular.slice(0, 5);
  const topMovies = popular.filter(a => a.format === 'MOVIE').slice(0, 5);
  if (topMovies.length < 5) {
    topMovies.push(...trending.slice(0, 5 - topMovies.length));
  }
  
  // --- Dynamic Schedule ---
  const DAY_NAMES = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const MONTH_NAMES = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];

  const today = new Date();
  const todayIdx = today.getDay(); // 0=Sun, 1=Mon, ...

  const scheduleDay0 = new Date(today);
  const scheduleDay1 = new Date(today); scheduleDay1.setDate(today.getDate() + 1);
  const scheduleDay2 = new Date(today); scheduleDay2.setDate(today.getDate() + 2);

  const [activeScheduleDay, setActiveScheduleDay] = React.useState(0); // 0 = today, 1 = tomorrow, 2 = day after

  const scheduleDayLabel = (offset) => DAY_NAMES[(todayIdx + offset) % 7];
  const scheduleDateLabel = (d) => `${MONTH_NAMES[d.getMonth()]} ${d.getDate()}`;

  // Schedule data keyed by day-of-week (0=Sun..6=Sat)
  const scheduleByDay = {
    0: [ // Sunday
      { time: '03:45', name: "Little Shark's Day Out Season 2", ep: 14 },
      { time: '04:00', name: "Shou 3 Ashibe QQ Goma-chan", ep: 14 },
      { time: '04:15', name: "Plannosaurus Gachi Koseibutsu-bu", ep: 1 },
      { time: '04:30', name: "Kumarba Season 3", ep: 14 },
      { time: '04:45', name: "Koupen-chan", ep: 67 },
      { time: '05:15', name: "Star Detective Precure!", ep: 24 },
      { time: '05:45', name: "DIGIMON BEATBREAK", ep: 38 },
      { time: '06:15', name: "Onegai AiPri", ep: 15 },
      { time: '07:45', name: "Dou Po Cangqiong: Nian Fan 4", ep: 50 },
      { time: '08:15', name: "Wushen Zhuzai: Da Wei Pian", ep: 397 },
    ],
    1: [ // Monday
      { time: '05:00', name: "One Piece", ep: 1122 },
      { time: '06:00', name: "Black Clover Season 5", ep: 2 },
      { time: '07:30', name: "Fairy Tail: 100 Years Quest", ep: 38 },
      { time: '09:00', name: "Wind Breaker Season 2", ep: 14 },
      { time: '10:30', name: "My Hero Academia Season 8", ep: 6 },
      { time: '12:00', name: "Bleach: TYBW Cour 4", ep: 7 },
      { time: '14:00', name: "Kaiju No. 8 Season 2", ep: 5 },
      { time: '16:30', name: "Attack on Titan Final Chapters", ep: 3 },
    ],
    2: [ // Tuesday
      { time: '04:30', name: "Sword Art Online: Alicization", ep: 48 },
      { time: '06:00', name: "Re:Zero Season 3", ep: 21 },
      { time: '08:00', name: "Overlord Season 5", ep: 9 },
      { time: '10:00', name: "Mushoku Tensei Season 3", ep: 13 },
      { time: '12:30', name: "That Time I Got Reincarnated as a Slime S4", ep: 11 },
      { time: '15:00', name: "Demon Slayer: Infinity Castle", ep: 2 },
      { time: '17:30', name: "Blue Lock Season 2", ep: 20 },
    ],
    3: [ // Wednesday
      { time: '05:00', name: "Naruto: The New Era", ep: 9 },
      { time: '07:00', name: "Dragon Ball DAIMA", ep: 25 },
      { time: '09:30', name: "Hunter x Hunter 2024", ep: 4 },
      { time: '11:00', name: "Vinland Saga Season 3", ep: 7 },
      { time: '13:30', name: "Jujutsu Kaisen Season 3", ep: 18 },
      { time: '15:00', name: "Chainsaw Man Season 2", ep: 12 },
      { time: '18:00', name: "The Eminence in Shadow S3", ep: 6 },
    ],
    4: [ // Thursday
      { time: '06:00', name: "Solo Leveling Season 2", ep: 15 },
      { time: '08:30', name: "Frieren: Beyond Journey's End S2", ep: 7 },
      { time: '10:00', name: "Dungeon Meshi Season 2", ep: 3 },
      { time: '12:00', name: "Spy x Family Season 3", ep: 9 },
      { time: '14:30', name: "Dandadan Season 2", ep: 5 },
      { time: '17:00', name: "Delicious in Dungeon SP", ep: 1 },
    ],
    5: [ // Friday
      { time: '05:30', name: "Tokyo Revengers Final Arc", ep: 4 },
      { time: '07:00', name: "Fullmetal Alchemist: New Generation", ep: 2 },
      { time: '09:00', name: "Berserk 2024", ep: 8 },
      { time: '11:30', name: "Oshi no Ko Season 3", ep: 6 },
      { time: '13:00', name: "Bocchi the Rock! Season 2", ep: 3 },
      { time: '15:30', name: "The Apothecary Diaries Season 3", ep: 11 },
      { time: '18:00', name: "Zom 100: Bucket List of the Dead", ep: 9 },
    ],
    6: [ // Saturday
      { time: '04:00', name: "Haikyuu!! Final Movie Pt.2", ep: 1 },
      { time: '06:30', name: "Kuroko's Basketball Extra Game", ep: 2 },
      { time: '09:00', name: "Ao Ashi Season 2", ep: 12 },
      { time: '11:00', name: "Captain Tsubasa Season 3", ep: 7 },
      { time: '14:00', name: "Slam Dunk New Season", ep: 4 },
      { time: '16:30', name: "Yuri on Ice: New Chapter", ep: 5 },
      { time: '19:00', name: "Blue Period Season 2", ep: 8 },
    ],
  };

  // Auto-mark the currently airing show based on real time
  const nowMins = today.getHours() * 60 + today.getMinutes();
  const getScheduleItems = (offset) => {
    const dayIdx = (todayIdx + offset) % 7;
    const items = scheduleByDay[dayIdx] || [];
    if (offset !== 0) return items.map(i => ({ ...i, active: false }));
    // For today, mark the item closest to now
    let activeSet = false;
    return items.map((item, idx) => {
      const [h, m] = item.time.split(':').map(Number);
      const itemMins = h * 60 + m;
      const nextItem = items[idx + 1];
      const nextMins = nextItem ? (() => { const [nh,nm]=nextItem.time.split(':').map(Number); return nh*60+nm; })() : 9999;
      const isActive = !activeSet && nowMins >= itemMins && nowMins < nextMins;
      if (isActive) activeSet = true;
      return { ...item, active: isActive };
    });
  };

  const visibleSchedule = getScheduleItems(activeScheduleDay);
  const activeDate = [scheduleDay0, scheduleDay1, scheduleDay2][activeScheduleDay];

  const displayList = activeTab === 'NEWEST' ? spotlight 
                    : activeTab === 'TOP RATED' ? [...popular].sort((a, b) => (b.averageScore || 0) - (a.averageScore || 0))
                    : popular;

  return (
    <MainWrapper>
      <NavBar />

      <ContentContainer>
        {heroAnime ? (
          <HeroWrapper>
            <HeroBg bg={heroAnime.bannerImage || heroAnime.coverImage?.extraLarge} />
            <HeroTopNav>
              <AiringBadge><FaClock size={12}/> EP 3 Airing Now</AiringBadge>
              <PaginationControls>
                <PageArrow onClick={handlePrevHero}><FaChevronLeft size={12}/></PageArrow>
                <PageCount>{spotlight.length > 0 ? currentHeroIndex + 1 : 0} / {spotlight.length}</PageCount>
                <PageArrow onClick={handleNextHero}><FaChevronRight size={12}/></PageArrow>
              </PaginationControls>
            </HeroTopNav>
            <HeroBottom>
              <HeroInfo>
                <MetaRow>
                  <SmallPill>{heroAnime.format || 'TV'}</SmallPill>
                  <SmallPill><FaStar color="#fff" size={10}/> {heroAnime.averageScore}</SmallPill>
                  <SmallPill><FaClock color="#fff" size={10}/> {heroAnime.duration} mins</SmallPill>
                </MetaRow>
                <HeroTitle>{heroAnime.title?.english || heroAnime.title?.romaji}</HeroTitle>
                <TagsRow>
                  {heroAnime.genres?.slice(0, 2).map((g, i) => <Tag key={i}>{g}</Tag>)}
                  <Tag>Science SARU</Tag>
                </TagsRow>
                <HeroDesc dangerouslySetInnerHTML={{ __html: heroAnime.description }} />
              </HeroInfo>
              <HeroActions>
                <ActionBtn onClick={() => navigate(`/anime/${heroAnime.id}`)}>
                  <FaInfoCircle size={16}/> DETAILS
                </ActionBtn>
                <ActionBtn primary onClick={() => navigate(`/watch/${heroAnime.id}`)}>
                  <FaPlayCircle size={16}/> WATCH NOW
                </ActionBtn>
              </HeroActions>
            </HeroBottom>
          </HeroWrapper>
        ) : (
          <HeroWrapper style={{display:'flex', alignItems:'center', justifyContent:'center'}}>Loading...</HeroWrapper>
        )}

        <GenresContainer>
          <ArrowBtn className="genre-arrow" style={{width: 28, height: 28}} onClick={() => scrollGenres('left')}><FaChevronLeft size={10}/></ArrowBtn>
          <div ref={genresRef} style={{display:'flex', gap: 10, overflowX: 'auto', flex: 1, scrollbarWidth: 'none', msOverflowStyle: 'none'}}>
            {genres.map(g => (
              <GenreBtn key={g} onClick={() => navigate('/search', { state: { genre: g } })}>{g}</GenreBtn>
            ))}
          </div>
          <ArrowBtn className="genre-arrow" style={{width: 28, height: 28}} onClick={() => scrollGenres('right')}><FaChevronRight size={10}/></ArrowBtn>
        </GenresContainer>

        {watchHistory.length > 0 && (
          <SectionHeader>
            <div>
              <Subtitle>Your Watchlist</Subtitle>
              <Title>Watch History</Title>
            </div>
          </SectionHeader>
        )}

        <HistorySliderWrapper>
          <ArrowBtn onClick={() => scrollHistory('left')}><FaChevronLeft size={16}/></ArrowBtn>
          <HistoryGrid ref={historyRef}>
            {watchHistory.map((item) => (
              <HistoryCard key={item.id} onClick={() => navigate(`/watch/${item.id}?ep=${item.episodeId || ''}&t=${item.rawTime || 0}`)}>
                <ThumbWrapper>
                  <ThumbImg src={item.img} alt={item.title} />
                  <CloseIcon onClick={(e) => handleRemoveHistory(e, item.id)}><FaTimes size={12}/></CloseIcon>
                  <EpBadge>EP {item.ep}</EpBadge>
                  <TimeBadge>{item.time} / {item.total}</TimeBadge>
                  <ProgressBar progress={item.progress}>
                    <div />
                  </ProgressBar>
                </ThumbWrapper>
                <AnimeTitle>{item.title}</AnimeTitle>
              </HistoryCard>
            ))}
          </HistoryGrid>
          <ArrowBtn onClick={() => scrollHistory('right')}><FaChevronRight size={16}/></ArrowBtn>
        </HistorySliderWrapper>
        
        {/* --- NEW COMMUNITY BANNER --- */}
        <Banner>
          <BannerLeft>
            <BannerIcon src={bannerData[bannerIndex].icon} alt={bannerData[bannerIndex].platform} />
            <BannerText>
              <h3 style={{transition: '0.3s'}}>{bannerData[bannerIndex].title}</h3>
              <p style={{transition: '0.3s'}}>{bannerData[bannerIndex].subtitle}</p>
            </BannerText>
          </BannerLeft>
          <BannerSocials>
            <SocialIcon color="#ff4500" onClick={() => window.open('https://www.reddit.com/user/Spirited_Warthog4415/', '_blank')}><FaReddit size={20}/></SocialIcon>
            <SocialIcon color="#5865F2" onClick={() => window.open('https://discord.gg/qYcKYggFQa', '_blank')}><FaDiscord size={20}/></SocialIcon>
            <SocialIcon color="#000" style={{background: '#fff', borderRadius: '50%', padding: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center'}} onClick={() => window.open('https://www.tiktok.com/@shuyora7', '_blank')}><FaTiktok size={14}/></SocialIcon>
            <SocialIcon color="#fff"><FaTimes size={20}/></SocialIcon>
          </BannerSocials>
        </Banner>

        {/* --- NEW MIDDLE LAYOUT --- */}
        <MiddleLayout>
          
          <ListColumn>
            <ListHeader><FaChevronRight size={10} color="#fff"/> JUST FINISHED</ListHeader>
            {justFinished.map(anime => (
              <ListCard key={anime.id} bg={anime.bannerImage || anime.coverImage?.extraLarge} onClick={() => navigate(`/watch/${anime.id}`)}>
                <ListCardContent>
                  <ListCardThumb loading="lazy" src={anime.coverImage?.large} />
                  <ListCardInfo>
                    <ListCardTitle><StatusDot color="#0ea5e9"/> {anime.title?.english || anime.title?.romaji}</ListCardTitle>
                    <ListCardMeta>
                      <span className="format">{anime.format || 'TV'}</span>
                      <span><FaCalendarAlt /> {anime.startDate?.year || 2026}</span>
                      <span><FaClosedCaptioning /> {anime.episodes || '12'}</span>
                      <span><FaStar /> {anime.averageScore || 'N/A'}</span>
                    </ListCardMeta>
                  </ListCardInfo>
                </ListCardContent>
              </ListCard>
            ))}
            <ViewMoreBtn><FaChevronDown size={12} /></ViewMoreBtn>
          </ListColumn>

          <ListColumn>
            <ListHeader><FaChevronRight size={10} color="#fff"/> TOP MOVIES</ListHeader>
            {topMovies.map(anime => (
              <ListCard key={anime.id} bg={anime.bannerImage || anime.coverImage?.extraLarge} onClick={() => navigate(`/watch/${anime.id}`)}>
                <ListCardContent>
                  <ListCardThumb loading="lazy" src={anime.coverImage?.large} />
                  <ListCardInfo>
                    <ListCardTitle><StatusDot color="#0ea5e9"/> {anime.title?.english || anime.title?.romaji}</ListCardTitle>
                    <ListCardMeta>
                      <span className="format">MOVIE</span>
                      <span><FaCalendarAlt /> {anime.startDate?.year || 2026}</span>
                      <span><FaClosedCaptioning /> 1</span>
                      <span><FaStar /> {anime.averageScore || 'N/A'}</span>
                    </ListCardMeta>
                  </ListCardInfo>
                </ListCardContent>
              </ListCard>
            ))}
            <ViewMoreBtn><FaChevronDown size={12} /></ViewMoreBtn>
          </ListColumn>

          <ScheduleContainer>
            <ScheduleHeader>Estimated</ScheduleHeader>
            <ScheduleTitle>Airing Schedule</ScheduleTitle>
            
            <ScheduleDays>
              <span className={activeScheduleDay === 0 ? 'active' : ''} onClick={() => setActiveScheduleDay(0)} style={{cursor:'pointer'}}>{scheduleDayLabel(0)}</span> /
              <span className={activeScheduleDay === 1 ? 'active' : ''} onClick={() => setActiveScheduleDay(1)} style={{cursor:'pointer'}}>{scheduleDayLabel(1)}</span> /
              <span className={activeScheduleDay === 2 ? 'active' : ''} onClick={() => setActiveScheduleDay(2)} style={{cursor:'pointer'}}>{scheduleDayLabel(2)}</span> /
            </ScheduleDays>
            <ScheduleDate>{scheduleDateLabel(activeDate)}</ScheduleDate>
            
            <ScheduleList>
              {visibleSchedule.map((item, i) => (
                <ScheduleItem key={i} active={item.active}>
                  <STime>{item.time}</STime>
                  <SName>{item.name}</SName>
                  <SEp>EP {item.ep}</SEp>
                </ScheduleItem>
              ))}
              <ViewMoreBtn style={{margin: 0, borderRadius: 0}}>View More</ViewMoreBtn>
            </ScheduleList>
          </ScheduleContainer>

        </MiddleLayout>

        {/* --- LOWER LAYOUT SPLIT --- */}
        <LowerLayout>
          {/* Main Grid (Left) */}
          <MainColumn>
            <TabsRow>
              <TabsGroup>
                <Tab active={activeTab === 'NEWEST'} onClick={() => { setActiveTab('NEWEST'); setTabPage(1); }}>NEWEST</Tab>
                <Tab active={activeTab === 'POPULAR'} onClick={() => { setActiveTab('POPULAR'); setTabPage(1); }}>POPULAR</Tab>
                <Tab active={activeTab === 'TOP RATED'} onClick={() => { setActiveTab('TOP RATED'); setTabPage(1); }}>TOP RATED</Tab>
              </TabsGroup>
              <PaginationControls>
                <PageArrow 
                  onClick={() => setTabPage(p => Math.max(1, p - 1))} 
                  style={{ opacity: tabPage === 1 ? 0.5 : 1, cursor: tabPage === 1 ? 'not-allowed' : 'pointer' }}
                >
                  <FaChevronLeft size={10}/>
                </PageArrow>
                <span style={{fontSize: 13, fontWeight: 700}}>{tabPage}</span>
                <PageArrow 
                  onClick={() => {
                    const maxPage = Math.ceil(displayList.length / 10) || 1;
                    setTabPage(p => Math.min(maxPage, p + 1));
                  }} 
                  style={{ 
                    opacity: tabPage >= (Math.ceil(displayList.length / 10) || 1) ? 0.5 : 1, 
                    cursor: tabPage >= (Math.ceil(displayList.length / 10) || 1) ? 'not-allowed' : 'pointer' 
                  }}
                >
                  <FaChevronRight size={10}/>
                </PageArrow>
              </PaginationControls>
            </TabsRow>
            
            <PosterGrid>
              {displayList.slice((tabPage - 1) * 12, tabPage * 12).map(anime => (
                <PosterCard key={anime.id} onClick={() => navigate(`/watch/${anime.id}`)}>
                  <PosterImgWrapper>
                    <PosterImg className="poster-img" loading="lazy" src={anime.coverImage?.large} alt={anime.title?.english} />
                    <HoverOverlay className="hover-overlay">
                      <PlayNowBtn><FaPlay size={10}/> Play Now</PlayNowBtn>
                      <DetailsBtn onClick={(e) => { e.stopPropagation(); navigate(`/anime/${anime.id}`); }}>Details</DetailsBtn>
                    </HoverOverlay>
                  </PosterImgWrapper>
                  <PosterTitle>
                    <StatusDot color={anime.status === 'RELEASING' ? '#4ade80' : '#f59e0b'} /> 
                    {anime.title?.english || anime.title?.romaji}
                  </PosterTitle>
                  <PosterMeta>
                    <MetaBadge>{anime.format || 'TV'}</MetaBadge>
                    <MetaBadge>{anime.startDate?.year || 2026}</MetaBadge>
                    <MetaBadge><FaClosedCaptioning size={10}/> {anime.episodes || '?'}</MetaBadge>
                    <MetaBadge><FaStar size={10} color="#f59e0b" style={{marginRight: -2}}/> {anime.averageScore || '?'}</MetaBadge>
                  </PosterMeta>
                </PosterCard>
              ))}
            </PosterGrid>
          </MainColumn>
          
          {/* Sidebar (Right) */}
          <SidebarColumn>
            <SidebarSection>
              <SidebarTitle><FaChevronRight size={10}/> TOP AIRING</SidebarTitle>
              {trending.slice(0, 5).map(anime => (
                <SmallCard key={anime.id} onClick={() => navigate(`/watch/${anime.id}`)}>
                  <SmallThumb loading="lazy" src={anime.coverImage?.large} />
                  <SmallInfo>
                    <SmallTitle>
                      <StatusDot color="#4ade80" /> 
                      {anime.title?.english || anime.title?.romaji}
                    </SmallTitle>
                    <SmallMeta>
                      <span>{anime.format || 'TV'}</span>
                      <span>📅 {anime.startDate?.year || 2026}</span>
                      <span>📺 13 / 24</span>
                      <span>⭐ {anime.averageScore}</span>
                    </SmallMeta>
                  </SmallInfo>
                </SmallCard>
              ))}
            </SidebarSection>

            <SidebarSection>
              <SidebarTitle>🔥 UPCOMING</SidebarTitle>
              {trending.slice(5, 10).map(anime => (
                <SmallCard key={anime.id} onClick={() => navigate(`/watch/${anime.id}`)}>
                  <SmallThumb loading="lazy" src={anime.coverImage?.large} />
                  <SmallInfo>
                    <SmallTitle>
                      <StatusDot color="#f59e0b" /> 
                      {anime.title?.english || anime.title?.romaji}
                    </SmallTitle>
                    <SmallMeta>
                      <span>{anime.format || 'TV'}</span>
                      <span>📅 {anime.startDate?.year || 2026}</span>
                      <span>📺 0 / 12</span>
                    </SmallMeta>
                  </SmallInfo>
                </SmallCard>
              ))}
            </SidebarSection>
          </SidebarColumn>
        </LowerLayout>

      </ContentContainer>
    </MainWrapper>
  );
};

export default Home;



