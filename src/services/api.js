import axios from 'axios';
axios.defaults.withCredentials = true;

const API_BASE = import.meta.env.VITE_API_BASE || `http://${window.location.hostname}:4000`;

export const fetchAnimeInfo = async (animeId) => {
  const res = await axios.get(`${API_BASE}/info/${animeId}`);
  return res.data;
};

export const fetchAnimeEpisodes = async (animeId) => {
  const res = await axios.get(`${API_BASE}/episodes/${animeId}`);
  return res.data;
};

export const fetchEpisodeStream = async (epId) => {
  const cleanedEpId = epId.startsWith("watch/") ? epId.replace("watch/", "") : epId;
  const res = await axios.get(`${API_BASE}/watch/${cleanedEpId}`);
  return res.data;
};

export const fetchSearchResults = async (query) => {
  const res = await axios.get(`${API_BASE}/search/${query}`);
  return res.data;
};

export const fetchSkipTimes = async (malId, epNumber) => {
  const res = await fetch(`https://api.aniskip.com/v2/skip-times/${malId}/${epNumber}?types[]=ed&types[]=op&episodeLength=0`);
  return await res.json();
};

export const fetchJisho = async (query) => {
  const res = await fetch(`/jisho/api/v1/search/words?keyword=${encodeURIComponent(query)}`);
  return await res.json();
};

export const pingStream = async (url, referer) => {
  const pingUrl = `/api/proxy?url=${encodeURIComponent(url)}&referer=${encodeURIComponent(referer || 'https://allmanga.to/')}`;
  return await fetch(pingUrl);
};
