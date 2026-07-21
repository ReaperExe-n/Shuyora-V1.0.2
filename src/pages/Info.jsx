import DOMPurify from 'dompurify';
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import styled from 'styled-components';
import { FaPlayCircle, FaArrowLeft, FaStar, FaCalendar, FaClock } from 'react-icons/fa';
import AuthModal from '../components/AuthModal';

// --- STYLED COMPONENTS --- //

const Container = styled.div`
  min-height: 100vh;
  background: var(--bg-color); /* #111115 */
  color: var(--text-primary);
  font-family: 'Outfit', sans-serif;
  overflow-x: hidden;
  padding-bottom: 60px;
`;

const NavBarContainer = styled.nav`
  position: absolute;
  top: 0;
  width: 100%;
  padding: 20px 40px;
  background: transparent;
  z-index: 1000;
  display: flex;
  align-items: center;
`;

const BackButton = styled.button`
  background: rgba(17, 17, 21, 0.6);
  border: 1px solid rgba(255,255,255,0.1);
  color: #fff;
  border-radius: 8px;
  width: 44px;
  height: 44px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
  transition: 0.2s;
  &:hover {
    background: rgba(255,255,255,0.1);
    transform: scale(1.05);
  }
`;

const HeroBanner = styled.div`
  width: 100%;
  height: 450px;
  background-image: url(${p => p.bg});
  background-size: cover;
  background-position: center 20%;
  position: relative;
  
  @media (max-width: 768px) {
    height: 250px;
  }
  
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(to top, var(--bg-color) 0%, rgba(17,17,21,0.7) 40%, transparent 100%);
  }
`;

const ContentWrapper = styled.div`
  max-width: 1400px;
  margin: -150px auto 0;
  padding: 0 40px;
  position: relative;
  z-index: 10;
  display: flex;
  gap: 40px;
  
  @media (max-width: 900px) {
    flex-direction: column;
    padding: 0 20px;
    margin-top: -80px;
  }
`;

const Sidebar = styled.div`
  width: 260px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 20px;

  @media (max-width: 900px) {
    width: 100%;
    align-items: center;
    
    img {
      max-width: 260px;
    }
  }
`;

const Poster = styled.img`
  width: 100%;
  height: 380px;
  object-fit: cover;
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.6);
`;

const WatchNowBtn = styled.button`
  width: 100%;
  background: var(--primary-color);
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 14px;
  font-size: 15px;
  font-weight: 700;
  font-family: 'Outfit', sans-serif;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  cursor: pointer;
  transition: 0.2s;
  
  &:hover {
    filter: brightness(1.1);
    transform: translateY(-2px);
  }
`;

const InfoBox = styled.div`
  background: var(--bg-secondary);
  border: 1px solid rgba(255,255,255,0.05);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const InfoItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  
  .label {
    font-size: 12px;
    font-weight: 700;
    color: var(--text-secondary);
    text-transform: uppercase;
  }
  
  .value {
    font-size: 13px;
    font-weight: 500;
    color: #fff;
  }
`;

const MainContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const TitleArea = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 40px;
  
  @media (max-width: 900px) {
    margin-top: 0;
  }
`;

const Title = styled.h1`
  font-size: 36px;
  font-weight: 800;
  color: #fff;
  margin: 0;
  line-height: 1.1;
`;

const TagRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`;

const Tag = styled.span`
  background: ${p => p.primary ? 'var(--primary-color)' : 'rgba(255,255,255,0.1)'};
  color: ${p => p.primary ? '#fff' : '#ccc'};
  padding: 4px 12px;
  border-radius: 100px;
  font-size: 13px;
  font-weight: 600;
`;

const TabsContainer = styled.div`
  display: flex;
  background: var(--bg-secondary);
  border: 1px solid rgba(255,255,255,0.05);
  border-radius: 8px;
  overflow: hidden;
`;

const Tab = styled.button`
  flex: 1;
  background: ${p => p.active ? 'rgba(255,255,255,0.08)' : 'transparent'};
  color: ${p => p.active ? 'var(--primary-color)' : 'var(--text-secondary)'};
  border: none;
  border-right: 1px solid rgba(255,255,255,0.05);
  padding: 14px 20px;
  font-size: 14px;
  font-weight: 600;
  font-family: 'Outfit', sans-serif;
  cursor: pointer;
  transition: 0.2s;
  
  &:last-child {
    border-right: none;
  }
  
  &:hover {
    background: rgba(255,255,255,0.08);
    color: #fff;
  }
`;

const Description = styled.div`
  font-size: 14px;
  line-height: 1.7;
  color: #aaa;
  
  b, strong {
    color: #fff;
  }
`;

const SectionHeader = styled.h3`
  font-size: 18px;
  font-weight: 800;
  color: #fff;
  margin: 30px 0 15px 0;
  display: flex;
  align-items: center;
  
  &::before {
    content: '>';
    color: var(--primary-color);
    margin-right: 8px;
    font-weight: 900;
  }
`;

const TrailerWrapper = styled.div`
  width: 100%;
  aspect-ratio: 16/9;
  border-radius: 12px;
  overflow: hidden;
  margin-top: 20px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
  
  iframe {
    width: 100%;
    height: 100%;
    border: none;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 16px;
`;

const Card = styled(Link)`
  display: block;
  text-decoration: none;
  background: var(--bg-secondary);
  border-radius: 8px;
  overflow: hidden;
  transition: 0.2s;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0,0,0,0.3);
  }
`;

const CardImg = styled.img`
  width: 100%;
  height: 220px;
  object-fit: cover;
`;

const CardTitle = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: #fff;
  padding: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const CharGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const CharCard = styled.div`
  display: flex;
  background: var(--bg-secondary);
  border-radius: 8px;
  overflow: hidden;
  height: 90px;
`;

const CharHalf = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  ${p => p.right ? 'flex-direction: row-reverse; text-align: right;' : ''}
`;

const CharImg = styled.img`
  width: 60px;
  height: 100%;
  object-fit: cover;
`;

const CharInfo = styled.div`
  padding: 0 12px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  overflow: hidden;
  
  .name {
    font-size: 13px;
    font-weight: 700;
    color: #fff;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .role {
    font-size: 11px;
    font-weight: 500;
    color: var(--text-secondary);
    margin-top: 4px;
  }
`;

const LoadingOverlay = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  color: var(--primary-color);
  background: var(--bg-color);
  font-size: 24px;
  font-weight: 800;
`;

// --- GRAPHQL QUERY --- //
const ANIME_QUERY = `
query ($id: Int) {
  Media (id: $id, type: ANIME) {
    id
    title { romaji english native }
    description(asHtml: true)
    coverImage { extraLarge large color }
    bannerImage
    format
    status
    episodes
    duration
    season
    seasonYear
    averageScore
    startDate { year month day }
    endDate { year month day }
    countryOfOrigin
    isAdult
    updatedAt
    trailer { id site thumbnail }
    studios(isMain: true) { nodes { name } }
    characters(sort: ROLE, perPage: 12) {
      edges {
        role
        node { id name { full } image { large } }
        voiceActors(language: JAPANESE) { id name { full } image { large } }
      }
    }
    recommendations(perPage: 12, sort: RATING_DESC) {
      nodes {
        mediaRecommendation {
          id
          title { romaji english }
          coverImage { extraLarge }
          format
        }
      }
    }
    relations {
      edges {
        relationType
        node {
          id
          title { romaji english }
          coverImage { extraLarge }
          format
          type
        }
      }
    }
}
  }
`;

const ReviewContainer = styled.div`
  margin-top: 20px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 24px;
`;

const ReviewHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 12px;
  
  h3 {
    margin: 0;
    font-size: 1.2rem;
    font-weight: 600;
  }
`;

const StarInputContainer = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  
  svg {
    cursor: pointer;
    transition: transform 0.2s, color 0.2s;
    &:hover {
      transform: scale(1.2);
    }
  }
`;

const ReviewTextarea = styled.textarea`
  width: 100%;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 12px;
  color: #fff;
  font-family: inherit;
  resize: vertical;
  min-height: 100px;
  margin-bottom: 16px;
  
  &:focus {
    outline: none;
    border-color: var(--accent-color);
  }
`;

const SubmitBtn = styled.button`
  background: var(--accent-color);
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 8px 20px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
  
  &:hover {
    opacity: 0.9;
  }
`;

const ReviewList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 32px;
`;

const ReviewItem = styled.div`
  background: rgba(0, 0, 0, 0.3);
  padding: 16px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  
  .header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
    
    .author {
      font-weight: 600;
      color: #ccc;
    }
    .date {
      font-size: 0.8rem;
      color: #666;
    }
  }
  
  .stars {
    margin-bottom: 8px;
  }
  
  .text {
    color: #eee;
    line-height: 1.5;
    font-size: 0.95rem;
  }
`;

const Info = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(location.state?.tab || 'Overview');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const user = localStorage.getItem('user');
  
  const [reviews, setReviews] = useState([]);
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [userReviewText, setUserReviewText] = useState('');
  
  // Load reviews from PostgreSQL Database
  useEffect(() => {
    const fetchReviews = async () => {
      if (id) {
        try {
          // Temporarily mock if backend isn't up, but try API first
          const res = await axios.get(`http://${window.location.hostname}:4000/api/reviews/${id}`);
          setReviews(res.data);
        } catch (err) {
          console.log('Database not connected yet, falling back to local for now.');
          const allReviews = JSON.parse(localStorage.getItem('shuyora_reviews') || '{}');
          setReviews(allReviews[id] || []);
        }
      }
    };
    fetchReviews();
  }, [id]);

  const handleSubmitReview = async () => {
    if (userRating === 0 || userReviewText.trim() === '') return;
    
    try {
      const res = await axios.post('http://localhost:4000/api/reviews', {
        animeId: id,
        author: 'You (Local)',
        rating: userRating,
        text: userReviewText.trim()
      });
      setReviews([res.data, ...reviews]);
      setUserRating(0);
      setUserReviewText('');
    } catch (err) {
      console.log('Backend DB not running, falling back to local save.');
      const newReview = {
        id: Date.now(),
        author: 'You (Local)',
        rating: userRating,
        text: userReviewText.trim(),
        date: new Date().toLocaleDateString()
      };
      
      const allReviews = JSON.parse(localStorage.getItem('shuyora_reviews') || '{}');
      const updatedAnimeReviews = [newReview, ...(allReviews[id] || [])];
      
      allReviews[id] = updatedAnimeReviews;
      localStorage.setItem('shuyora_reviews', JSON.stringify(allReviews));
      
      setReviews(updatedAnimeReviews);
      setUserRating(0);
      setUserReviewText('');
    }
  };

  useEffect(() => {
    const fetchInfo = async () => {
      setLoading(true);
      try {
        const response = await axios.post('https://graphql.anilist.co', {
          query: ANIME_QUERY,
          variables: { id: parseInt(id) }
        });
        setData(response.data.data.Media);
      } catch (err) {
        console.error("Error fetching anime info:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchInfo();
  }, [id]);

  if (loading) return <LoadingOverlay>Loading Details...</LoadingOverlay>;
  if (!data) return <LoadingOverlay>Failed to load data.</LoadingOverlay>;

  const title = data.title.english || data.title.romaji || data.title.native;
  const bannerBg = data.bannerImage || data.coverImage?.extraLarge;
  
  const formatDate = (dateObj) => {
    if (!dateObj || !dateObj.year) return 'Unknown';
    return `${dateObj.year}-${String(dateObj.month || 1).padStart(2, '0')}-${String(dateObj.day || 1).padStart(2, '0')}`;
  };

  const relatedMedia = data.relations?.edges?.filter(e => e.node.type === 'ANIME').map(e => e.node) || [];
  const recs = data.recommendations?.nodes?.map(n => n.mediaRecommendation).filter(Boolean) || [];

  return (
    <>
    <Container>
      <NavBarContainer>
        <BackButton onClick={() => navigate(-1)}><FaArrowLeft /></BackButton>
      </NavBarContainer>
      
      <HeroBanner bg={bannerBg} />
      
      <ContentWrapper>
        <Sidebar>
          <Poster src={data.coverImage?.extraLarge} alt={title} />
          
          <WatchNowBtn onClick={() => navigate(`/watch/${id}`)}>
            <FaPlayCircle size={20} /> WATCH NOW
          </WatchNowBtn>
          
          <InfoBox>
            <InfoItem>
              <span className="label">Episodes</span>
              <span className="value">{data.episodes || '?'}</span>
            </InfoItem>
            <InfoItem>
              <span className="label">Start Date</span>
              <span className="value">{formatDate(data.startDate)}</span>
            </InfoItem>
            <InfoItem>
              <span className="label">End Date</span>
              <span className="value">{formatDate(data.endDate)}</span>
            </InfoItem>
            <InfoItem>
              <span className="label">Country</span>
              <span className="value">{data.countryOfOrigin || 'JP'}</span>
            </InfoItem>
            <InfoItem>
              <span className="label">Adult</span>
              <span className="value">{data.isAdult ? 'Yes' : 'No'}</span>
            </InfoItem>
            <InfoItem>
              <span className="label">Studios</span>
              <span className="value">{data.studios?.nodes?.map(s => s.name).join(', ') || 'Unknown'}</span>
            </InfoItem>
          </InfoBox>
        </Sidebar>
        
        <MainContent>
          <TitleArea>
            <Title>{title}</Title>
            <TagRow>
              {data.format && <Tag primary>{data.format}</Tag>}
              {data.seasonYear && <Tag>{data.seasonYear}</Tag>}
              {data.status && <Tag>{data.status.replace(/_/g, ' ')}</Tag>}
              {data.averageScore && <Tag><FaStar size={11} style={{marginRight: 4, marginBottom: -1}}/>{data.averageScore}%</Tag>}
              {data.season && <Tag>{data.season}</Tag>}
            </TagRow>
          </TitleArea>
          
          <TabsContainer>
            {['Overview', 'Characters', 'Reviews'].map(tab => (
              <Tab 
                key={tab} 
                active={activeTab === tab}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </Tab>
            ))}
          </TabsContainer>
          
          {activeTab === 'Overview' && (
            <div>
              <Description dangerouslySetInnerHTML={{ __html: data.description || 'No description available.' }} />
              
              {data.trailer?.site === 'youtube' && (
                <TrailerWrapper>
                  <iframe 
                    src={`https://www.youtube.com/embed/${data.trailer.id}`} 
                    title="Trailer" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                  />
                </TrailerWrapper>
              )}
              
              {relatedMedia.length > 0 && (
                <>
                  <SectionHeader>RELATED</SectionHeader>
                  <Grid>
                    {relatedMedia.slice(0, 6).map(anime => (
                      <Card key={anime.id} to={`/anime/${anime.id}`}>
                        <CardImg src={anime.coverImage?.extraLarge} alt={anime.title?.english || anime.title?.romaji} />
                        <CardTitle>{anime.title?.english || anime.title?.romaji}</CardTitle>
                      </Card>
                    ))}
                  </Grid>
                </>
              )}
              
              {recs.length > 0 && (
                <>
                  <SectionHeader>RECOMMENDATIONS</SectionHeader>
                  <Grid>
                    {recs.slice(0, 6).map(anime => (
                      <Card key={anime.id} to={`/anime/${anime.id}`}>
                        <CardImg src={anime.coverImage?.extraLarge} alt={anime.title?.english || anime.title?.romaji} />
                        <CardTitle>{anime.title?.english || anime.title?.romaji}</CardTitle>
                      </Card>
                    ))}
                  </Grid>
                </>
              )}
            </div>
          )}
          
          {activeTab === 'Characters' && (
            <CharGrid>
              {data.characters?.edges?.map((edge, i) => (
                <CharCard key={i}>
                  <CharHalf>
                    <CharImg src={edge.node.image?.large} alt={edge.node.name?.full} />
                    <CharInfo>
                      <span className="name">{edge.node.name?.full}</span>
                      <span className="role">{edge.role}</span>
                    </CharInfo>
                  </CharHalf>
                  
                  {edge.voiceActors && edge.voiceActors[0] && (
                    <CharHalf right>
                      <CharInfo>
                        <span className="name">{edge.voiceActors[0].name?.full}</span>
                        <span className="role">Japanese</span>
                      </CharInfo>
                      <CharImg src={edge.voiceActors[0].image?.large} alt={edge.voiceActors[0].name?.full} />
                    </CharHalf>
                  )}
                </CharCard>
              ))}
              
              {(!data.characters?.edges || data.characters.edges.length === 0) && (
                <Description>No character data available.</Description>
              )}
            </CharGrid>
          )}

          {activeTab === 'Reviews' && (
            <ReviewContainer>
              <ReviewHeader>
                <h3>Community Reviews</h3>
                <div style={{color: '#aaa', fontSize: '0.9rem'}}>
                  {reviews.length} {reviews.length === 1 ? 'Review' : 'Reviews'}
                  {reviews.length > 0 && ` • Avg: ${(reviews.reduce((a,b)=>a+b.rating,0)/reviews.length).toFixed(1)} ★`}
                </div>
              </ReviewHeader>
              
              <div style={{marginBottom: 32}}>
                <div style={{marginBottom: 12, fontWeight: 600}}>Write a Review</div>
                {user ? (
                  <>
                    <StarInputContainer>
                      {[1,2,3,4,5].map(star => (
                        <FaStar 
                          key={star} 
                          size={24} 
                          color={(hoverRating || userRating) >= star ? '#ffd700' : '#444'} 
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => setUserRating(star)}
                        />
                      ))}
                    </StarInputContainer>
                    <ReviewTextarea 
                      placeholder="What did you think of this anime?" 
                      value={userReviewText}
                      onChange={(e) => setUserReviewText(e.target.value)}
                    />
                    <SubmitBtn onClick={handleSubmitReview}>Submit Review</SubmitBtn>
                  </>
                ) : (
                  <div style={{ background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
                    <p style={{ color: '#aaa', marginBottom: '16px' }}>You must be logged in to write a review.</p>
                    <SubmitBtn onClick={() => setShowAuthModal(true)} style={{ display: 'inline-block', width: 'auto' }}>Login / Register</SubmitBtn>
                  </div>
                )}
              </div>
              
              <ReviewList>
                {reviews.length === 0 ? (
                  <div style={{color: '#888', textAlign: 'center', padding: '20px 0'}}>No reviews yet. Be the first to review!</div>
                ) : (
                  reviews.map(r => (
                    <ReviewItem key={r.id}>
                      <div className="header">
                        <span className="author">{r.author}</span>
                        <span className="date">{r.date}</span>
                      </div>
                      <div className="stars">
                        {[1,2,3,4,5].map(star => (
                          <FaStar key={star} size={14} color={r.rating >= star ? '#ffd700' : '#444'} />
                        ))}
                      </div>
                      <div className="text">{r.text}</div>
                    </ReviewItem>
                  ))
                )}
              </ReviewList>
            </ReviewContainer>
          )}
          
        </MainContent>
      </ContentWrapper>
    </Container>
    <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  );
};

export default Info;
