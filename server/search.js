import { Meilisearch } from 'meilisearch';
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const client = new Meilisearch({
  host: process.env.MEILI_HOST || 'http://localhost:7700',
  apiKey: process.env.MEILI_MASTER_KEY || 'shuyora_master_key',
});

// Function to fetch popular anime from AniList and dump it into Meilisearch
export const syncMeilisearch = async () => {
  try {
    const index = client.index('anime');
    
    // Configure searchable attributes
    await index.updateSettings({
      searchableAttributes: ['title_english', 'title_romaji', 'title_native', 'synonyms'],
      filterableAttributes: ['genres', 'format', 'status', 'seasonYear'],
      sortableAttributes: ['popularity', 'averageScore']
    });

    console.log('[MEILISEARCH] Fetching top 500 anime from AniList to build search index...');
    
    let allAnime = [];
    for (let page = 1; page <= 10; page++) {
      const query = `
        query {
          Page(page: ${page}, perPage: 50) {
            media(type: ANIME, sort: POPULARITY_DESC) {
              id title { romaji english native } synonyms
              coverImage { extraLarge large }
              format episodes duration status seasonYear averageScore genres popularity
            }
          }
        }
      `;
      
      const response = await axios.post('https://graphql.anilist.co', { query });
      const data = response.data.data.Page.media;
      
      const formatted = data.map(a => ({
        id: a.id,
        title_english: a.title.english || '',
        title_romaji: a.title.romaji || '',
        title_native: a.title.native || '',
        synonyms: a.synonyms || [],
        coverImage: a.coverImage?.extraLarge || a.coverImage?.large,
        format: a.format,
        episodes: a.episodes,
        status: a.status,
        seasonYear: a.seasonYear,
        averageScore: a.averageScore,
        popularity: a.popularity,
        genres: a.genres
      }));
      
      allAnime = [...allAnime, ...formatted];
    }

    const response = await index.addDocuments(allAnime);
    console.log(`[MEILISEARCH] Successfully queued ${allAnime.length} anime for indexing! (Task ID: ${response.taskUid})`);
  } catch (error) {
    console.error('[MEILISEARCH] Failed to sync data:', error.message);
  }
};

export const searchAnime = async (query) => {
  try {
    const index = client.index('anime');
    const search = await index.search(query, { limit: 10 });
    return search.hits;
  } catch (err) {
    console.error('[MEILISEARCH] Search error, falling back to AniList:', err.message);
    try {
      const graphqlQuery = `
        query ($search: String) {
          Page(page: 1, perPage: 10) {
            media(search: $search, type: ANIME, sort: SEARCH_MATCH) {
              id title { romaji english }
              coverImage { large }
              format episodes seasonYear averageScore
            }
          }
        }
      `;
      const response = await axios.post('https://graphql.anilist.co', { 
        query: graphqlQuery, 
        variables: { search: query } 
      });
      const data = response.data.data.Page.media;
      return data.map(a => ({
        id: a.id,
        title_english: a.title.english || '',
        title_romaji: a.title.romaji || '',
        coverImage: a.coverImage?.large,
        format: a.format,
        episodes: a.episodes,
        seasonYear: a.seasonYear,
        averageScore: a.averageScore
      }));
    } catch (fallbackErr) {
      console.error('[MEILISEARCH] Fallback also failed:', fallbackErr.message);
      return [];
    }
  }
};
