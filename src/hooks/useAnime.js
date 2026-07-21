import axios from 'axios'
import { useQuery } from '@tanstack/react-query'

const executeQuery = async (query, variables = {}) => {
  const { data } = await axios.post('https://graphql.anilist.co', {
    query,
    variables
  })
  return data.data.Page.media
}

// We will use this base fragment to get consistent data everywhere
const mediaFragment = `
  id
  title { romaji english userPreferred }
  coverImage { large extraLarge }
  bannerImage
  description
  format
  status
  episodes
  duration
  averageScore
  genres
`

export function usePopular() {
  const query = `
    query {
      Page(page: 1, perPage: 20) {
        media(sort: POPULARITY_DESC, type: ANIME) {
          ${mediaFragment}
        }
      }
    }
  `
  return useQuery(['popular'], () => executeQuery(query))
}

export function useAiring() {
  const query = `
    query {
      Page(page: 1, perPage: 20) {
        media(sort: POPULARITY_DESC, type: ANIME, status: RELEASING) {
          ${mediaFragment}
        }
      }
    }
  `
  return useQuery(['airing'], () => executeQuery(query))
}

export function useMovies() {
  const query = `
    query {
      Page(page: 1, perPage: 20) {
        media(sort: POPULARITY_DESC, type: ANIME, format: MOVIE) {
          ${mediaFragment}
        }
      }
    }
  `
  return useQuery(['movies'], () => executeQuery(query))
}

export function useSeries() {
  const query = `
    query {
      Page(page: 1, perPage: 20) {
        media(sort: POPULARITY_DESC, type: ANIME, format: TV) {
          ${mediaFragment}
        }
      }
    }
  `
  return useQuery(['series'], () => executeQuery(query))
}

export function useGenre({ genre }) {
  const query = `
    query($genre: String) {
      Page(page: 1, perPage: 20) {
        media(sort: POPULARITY_DESC, type: ANIME, genre: $genre) {
          ${mediaFragment}
        }
      }
    }
  `
  // AniList genres are capitalized properly, e.g., "Action", "Romance"
  // The input might be lowercase from URL, so we capitalize first letter
  const formattedGenre = genre.charAt(0).toUpperCase() + genre.slice(1).toLowerCase()
  return useQuery(['genres', genre], () => executeQuery(query, { genre: formattedGenre }))
}

export const useSearchAnime = (filter) => {
  const query = `
    query($search: String) {
      Page(page: 1, perPage: 20) {
        media(search: $search, sort: POPULARITY_DESC, type: ANIME) {
          ${mediaFragment}
        }
      }
    }
  `
  return {
    ...useQuery(['searchAnime', filter], () => {
      if (filter && filter.length > 1) {
        return executeQuery(query, { search: filter })
      }
      return []
    }),
  }
}

// Fallback for LatestEpisode (since AniList doesn't have a direct "recent episodes" endpoint without complex queries, we just use airing)
export function useLatestEpisode() {
  return useAiring()
}
