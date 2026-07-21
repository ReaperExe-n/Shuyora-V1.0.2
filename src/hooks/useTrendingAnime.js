import axios from 'axios'
import { useQuery } from '@tanstack/react-query'

const query = `
query {
  Page(page: 1, perPage: 15) {
    media(sort: TRENDING_DESC, type: ANIME) {
      id
      title { romaji english userPreferred }
      coverImage { extraLarge large }
      bannerImage
      description
      format
      episodes
      duration
      status
      startDate { year month day }
      averageScore
    }
  }
}
`

export const fetchTrendingAnime = async () => {
  const { data } = await axios.post('https://graphql.anilist.co', { query })
  return data.data.Page.media
}

export default function useTrendingAnime() {
  return useQuery(['trending'], () => fetchTrendingAnime())
}
