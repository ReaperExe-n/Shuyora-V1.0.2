import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import NavBar from '../components/NavBar';
import Sidebar from '../components/Sidebar';
import axios from 'axios';
import { FaFilter, FaSync, FaChevronDown, FaTimes, FaPlay } from 'react-icons/fa';

const PageContainer = styled.div`
  background: var(--bg-color);
  min-height: 100vh;
  color: #fff;
  font-family: 'Outfit', sans-serif;
`;

const ContentContainer = styled.div`
  padding: 80px 24px 24px 24px;
  display: flex;
`;

const MainContent = styled.div`
  flex: 1;
`;

const FilterBar = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 40px;
  width: 100%;
`;

const FilterSection = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 12px;
  flex-wrap: wrap;
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  text-align: left;
`;

const FilterLabel = styled.label`
  font-size: 14.5px;
  font-weight: 800;
  color: #fff;
  letter-spacing: 0.2px;
  text-align: left;
  padding-left: 2px;
  font-family: 'Outfit', sans-serif;
`;

const SelectWrapper = styled.div`
  position: relative;
  width: 200px;
  
  select {
    appearance: none;
    width: 100%;
    background: #111115;
    border: 1px solid #2a2a32;
    border-radius: 8px;
    padding: 12px 32px 12px 16px;
    color: #e5e7eb;
    font-size: 14.5px;
    font-weight: 600;
    outline: none;
    cursor: pointer;
    transition: all 0.2s ease;
    
    &:hover, &:focus {
      border-color: #4a4a5a;
    }
  }
  
  .arrow-icon {
    position: absolute;
    right: 14px;
    top: 50%;
    transform: translateY(-50%);
    pointer-events: none;
    color: #a1a1aa;
    font-size: 12px;
  }

  .clear-icon {
    position: absolute;
    right: 36px;
    top: 50%;
    transform: translateY(-50%);
    color: #a1a1aa;
    font-size: 12px;
    cursor: pointer;
    padding: 2px;
    transition: 0.2s;
    &:hover { color: #fff; }
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
`;

const ActionBtn = styled.button`
  background: #111115;
  border: 1px solid #2a2a32;
  color: #e5e7eb;
  border-radius: 8px;
  height: 44px;
  width: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
  
  &:hover {
    background: #2a2a32;
    color: #fff;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 20px;

  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
    gap: 12px;
  }
`;

const PosterCard = styled.div`
  display: block;
  cursor: pointer;
  background: var(--bg-secondary);
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  transition: transform 0.2s, box-shadow 0.2s;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0,0,0,0.3);
  }
`;

const PosterImage = styled.img`
  width: 100%;
  height: 260px;
  object-fit: cover;
  display: block;
`;

const HoverOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 260px;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(2px);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 12px;
  opacity: 0;
  transition: opacity 0.2s ease-in-out;
  
  ${PosterCard}:hover & {
    opacity: 1;
  }
`;

const PlayBtn = styled.div`
  background: var(--btn-hover);
  color: #fff;
  padding: 10px 24px;
  border-radius: 24px;
  font-weight: 700;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
  
  &:hover {
    background: #fff;
    color: #000;
  }
`;

const DetailsBtn = styled.div`
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 8px 20px;
  border-radius: 24px;
  font-weight: 600;
  font-size: 12px;
  transition: all 0.2s;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`;

const CardContent = styled.div`
  padding: 12px;
`;

const AnimeTitle = styled.h3`
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 8px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Badges = styled.div`
  display: flex;
  gap: 8px;
  font-size: 11px;
  font-weight: bold;
`;

const Badge = styled.span`
  padding: 2px 6px;
  border-radius: 4px;
  background: ${p => p.type === 'sub' ? '#E3B2E6' : p.type === 'dub' ? '#B2E6E3' : '#333'};
  color: ${p => p.type === 'sub' || p.type === 'dub' ? '#000' : '#fff'};
`;

const Loading = styled.div`
  text-align: center;
  padding: 40px;
  font-size: 18px;
  color: var(--text-muted);
`;

const API_BASE = import.meta.env.VITE_API_BASE || `http://${window.location.hostname}:4000`;

const Search = () => {
  const { query } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter Options State
  const [availableGenres, setAvailableGenres] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  
  // Selected Filters State
  const [genre, setGenre] = useState(location.state?.genre || '');
  const [tag, setTag] = useState('');
  const [year, setYear] = useState('');
  const [status, setStatus] = useState('');
  const [format, setFormat] = useState('');

  // Fetch Filters on Mount
  useEffect(() => {
    document.title = query ? `Search: ${query} - Shuyora` : 'Search - Shuyora';
    const fetchFilters = async () => {
      try {
        const query = `
          query {
            GenreCollection
            MediaTagCollection { name }
          }
        `;
        const res = await axios.post('https://graphql.anilist.co', { query });
        setAvailableGenres(res.data.data.GenreCollection || []);
        setAvailableTags(res.data.data.MediaTagCollection?.map(t => t.name) || []);
      } catch (err) {
        console.error("Failed to fetch filters", err);
      }
    };
    fetchFilters();
  }, []);

  const fetchResults = async () => {
    setLoading(true);
    try {
      const queryGql = `
        query ($search: String, $genre: String, $tag: String, $year: Int, $status: MediaStatus, $format: MediaFormat) {
          Page(page: 1, perPage: 24) {
            media(
              type: ANIME, 
              search: $search, 
              genre: $genre, 
              tag: $tag, 
              seasonYear: $year, 
              status: $status, 
              format: $format,
              sort: [POPULARITY_DESC]
            ) {
              id title { romaji english native } coverImage { extraLarge } episodes format status averageScore
            }
          }
        }
      `;
      
      const variables = {};
      if (query && query !== 'all') variables.search = query;
      if (genre) variables.genre = genre;
      if (tag) variables.tag = tag;
      if (year) variables.year = parseInt(year);
      if (status) variables.status = status;
      if (format) variables.format = format;

      const res = await axios.post('https://graphql.anilist.co', { query: queryGql, variables });
      const anilistResults = res.data.data.Page.media.map(a => ({
        id: a.id,
        title: a.title.english || a.title.romaji || a.title.native,
        image: a.coverImage?.extraLarge,
        episodes: a.episodes || '?',
        sub: a.episodes || '?',
        format: a.format || 'TV'
      }));
      setResults(anilistResults);
    } catch (err) {
      console.error("Failed to fetch search results", err);
      setResults([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchResults();
  }, [query]);

  const handleApply = () => {
    fetchResults();
  };

  const handleReset = () => {
    setGenre('');
    setTag('');
    setYear('');
    setStatus('');
    setFormat('');
    // Wait for state to update, then fetch
    setTimeout(() => {
      fetchResults();
    }, 0);
  };

  // Generate Year Options
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 50 }, (_, i) => currentYear - i);

  return (
    <PageContainer>
      <NavBar />
      <ContentContainer>
        <MainContent>
          <FilterBar>
            <FilterSection>
              <FilterGroup>
                <FilterLabel>Genres</FilterLabel>
                <SelectWrapper>
                  <select value={genre} onChange={(e) => setGenre(e.target.value)}>
                    <option value="">Select Genres</option>
                    {availableGenres.map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                  {genre && <FaTimes className="clear-icon" onClick={() => setGenre('')} />}
                  <FaChevronDown className="arrow-icon" />
                </SelectWrapper>
              </FilterGroup>

              <FilterGroup>
                <FilterLabel>Tags</FilterLabel>
                <SelectWrapper>
                  <select value={tag} onChange={(e) => setTag(e.target.value)}>
                    <option value="">Select Tags</option>
                    {availableTags.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                  {tag && <FaTimes className="clear-icon" onClick={() => setTag('')} />}
                  <FaChevronDown className="arrow-icon" />
                </SelectWrapper>
              </FilterGroup>

              <FilterGroup>
                <FilterLabel>Year</FilterLabel>
                <SelectWrapper>
                  <select value={year} onChange={(e) => setYear(e.target.value)}>
                    <option value="">Any year</option>
                    {years.map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                  {year && <FaTimes className="clear-icon" onClick={() => setYear('')} />}
                  <FaChevronDown className="arrow-icon" />
                </SelectWrapper>
              </FilterGroup>

              <FilterGroup>
                <FilterLabel>Status</FilterLabel>
                <SelectWrapper>
                  <select value={status} onChange={(e) => setStatus(e.target.value)}>
                    <option value="">Any Status</option>
                    <option value="FINISHED">Finished</option>
                    <option value="RELEASING">Releasing</option>
                    <option value="NOT_YET_RELEASED">Not Yet Released</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                  {status && <FaTimes className="clear-icon" onClick={() => setStatus('')} />}
                  <FaChevronDown className="arrow-icon" />
                </SelectWrapper>
              </FilterGroup>

              <FilterGroup>
                <FilterLabel>Format</FilterLabel>
                <SelectWrapper>
                  <select value={format} onChange={(e) => setFormat(e.target.value)}>
                    <option value="">Any Format</option>
                    <option value="TV">TV</option>
                    <option value="TV_SHORT">TV Short</option>
                    <option value="MOVIE">Movie</option>
                    <option value="SPECIAL">Special</option>
                    <option value="OVA">OVA</option>
                    <option value="ONA">ONA</option>
                  </select>
                  {format && <FaTimes className="clear-icon" onClick={() => setFormat('')} />}
                  <FaChevronDown className="arrow-icon" />
                </SelectWrapper>
              </FilterGroup>
            </FilterSection>

            <FilterSection>
              <FilterGroup>
                <FilterLabel>Apply</FilterLabel>
                <ActionBtn onClick={handleApply} title="Apply Filters">
                  <FaFilter />
                </ActionBtn>
              </FilterGroup>

              <FilterGroup>
                <FilterLabel>Reset</FilterLabel>
                <ActionBtn onClick={handleReset} title="Reset Filters">
                  <FaSync />
                </ActionBtn>
              </FilterGroup>

              <FilterGroup>
                <FilterLabel>Expand</FilterLabel>
                <ActionBtn title="Expand Options">
                  <FaChevronDown />
                </ActionBtn>
              </FilterGroup>
            </FilterSection>
          </FilterBar>
          
          {loading ? (
            <Loading>Loading results...</Loading>
          ) : results.length > 0 ? (
            <Grid>
              {results.map((anime) => (
                <PosterCard key={anime.id} onClick={() => navigate(`/watch/${anime.id}`)}>
                  <PosterImage 
                    src={anime.coverImage?.extraLarge || anime.coverImage?.large || anime.image || anime.image} 
                    alt={anime.title} 
                  />
                  <HoverOverlay>
                    <PlayBtn onClick={(e) => { e.stopPropagation(); navigate(`/watch/${anime.id}`); }}>
                      <FaPlay size={12} /> Play Now
                    </PlayBtn>
                    <DetailsBtn onClick={(e) => { e.stopPropagation(); navigate(`/anime/${anime.id}`); }}>
                      Details
                    </DetailsBtn>
                  </HoverOverlay>
                  <CardContent>
                    <AnimeTitle>{anime.title}</AnimeTitle>
                    <Badges>
                      {anime.status && <Badge>{anime.status}</Badge>}
                      {anime.format && <Badge>{anime.format}</Badge>}
                      <Badge type="sub">SUB</Badge>
                    </Badges>
                  </CardContent>
                </PosterCard>
              ))}
            </Grid>
          ) : (
            <Loading>No results found.</Loading>
          )}
        </MainContent>
      </ContentContainer>
    </PageContainer>
  );
};

export default Search;
