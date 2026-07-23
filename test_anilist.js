import axios from 'axios';

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
  }
}
`;

try {
  const response = await axios.post('https://graphql.anilist.co', {
    query: ANIME_QUERY,
    variables: { id: 177699 }
  });
  console.log('SUCCESS:', JSON.stringify(response.data.data.Media.title));
} catch (err) {
  console.log('ERROR:', err.message);
  if (err.response) console.log('Response:', JSON.stringify(err.response.data));
}
