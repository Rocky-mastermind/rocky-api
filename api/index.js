const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(express.json());

const apiList = [
  {
    category: "Fun",
    name: "Joke",
    method: "GET",
    endpoint: "/api/joke",
    description: "Get a random joke",
    params: []
  },
  {
    category: "Fun",
    name: "Quote",
    method: "GET",
    endpoint: "/api/quote",
    description: "Get a random motivational quote",
    params: []
  },
  {
    category: "Tools",
    name: "Lyrics",
    method: "GET",
    endpoint: "/api/lyrics",
    description: "Get song lyrics",
    params: [
      { name: "song", required: true },
      { name: "artist", required: false }
    ]
  },
  {
    category: "Tools",
    name: "Dictionary",
    method: "GET",
    endpoint: "/api/dictionary",
    description: "Get word meaning",
    params: [{ name: "word", required: true }]
  },
  {
    category: "Image",
    name: "Waifu",
    method: "GET",
    endpoint: "/api/waifu",
    description: "Get random waifu image",
    params: []
  },
  {
    category: "AI",
    name: "GPT",
    method: "GET",
    endpoint: "/api/gpt",
    description: "Ask AI anything",
    params: [{ name: "q", required: true }]
  },
  {
    category: "Search",
    name: "YouTube Search",
    method: "GET",
    endpoint: "/api/ytsearch",
    description: "Search YouTube videos",
    params: [{ name: "query", required: true }]
  },
  {
    category: "Download",
    name: "TikTok Downloader",
    method: "GET",
    endpoint: "/api/tiktok",
    description: "Download TikTok video",
    params: [{ name: "url", required: true }]
  }
];

app.get("/", (req, res) => {
  res.json({
    status: true,
    message: "Welcome to Rocky's REST API",
    operator: "rocky",
    docs: "/docs",
    total_apis: apiList.length
  });
});

app.get("/api/list", (req, res) => {
  const categories = [...new Set(apiList.map(a => a.category))];
  res.json({
    status: true,
    operator: "rocky",
    total: apiList.length,
    categories: categories.length,
    get_endpoints: apiList.filter(a => a.method === "GET").length,
    post_endpoints: apiList.filter(a => a.method === "POST").length,
    apis: apiList
  });
});

app.get("/api/joke", async (req, res) => {
  try {
    const r = await axios.get("https://official-joke-api.appspot.com/random_joke");
    res.json({ status: true, operator: "rocky", setup: r.data.setup, punchline: r.data.punchline, type: r.data.type });
  } catch { res.json({ status: false, message: "Failed to fetch joke" }); }
});

const quotes = [
  { quote: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { quote: "In the middle of difficulty lies opportunity.", author: "Albert Einstein" },
  { quote: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
  { quote: "Life is what happens when you're busy making other plans.", author: "John Lennon" },
  { quote: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
  { quote: "It is during our darkest moments that we must focus to see the light.", author: "Aristotle" },
  { quote: "Spread love everywhere you go.", author: "Mother Teresa" },
  { quote: "Don't judge each day by the harvest you reap but by the seeds that you plant.", author: "Robert Louis Stevenson" },
  { quote: "You are never too old to set another goal or to dream a new dream.", author: "C.S. Lewis" }
];

app.get("/api/quote", (req, res) => {
  const r = quotes[Math.floor(Math.random() * quotes.length)];
  res.json({ status: true, operator: "rocky", ...r });
});

app.get("/api/dictionary", async (req, res) => {
  const { word } = req.query;
  if (!word) return res.json({ status: false, message: "Provide ?word=yourword" });
  try {
    const r = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
    const d = r.data[0];
    res.json({
      status: true, operator: "rocky",
      word: d.word, phonetic: d.phonetic || "N/A",
      meanings: d.meanings.slice(0, 3).map(m => ({
        partOfSpeech: m.partOfSpeech,
        definitions: m.definitions.slice(0, 2).map(x => x.definition)
      }))
    });
  } catch { res.json({ status: false, message: "Word not found" }); }
});

app.get("/api/waifu", async (req, res) => {
  try {
    const r = await axios.get("https://api.waifu.pics/sfw/waifu");
    res.json({ status: true, operator: "rocky", url: r.data.url });
  } catch { res.json({ status: false, message: "Failed to fetch" }); }
});

app.get("/api/gpt", async (req, res) => {
  const { q } = req.query;
  if (!q) return res.json({ status: false, message: "Provide ?q=your question" });
  try {
    const r = await axios.get(`https://api.simsimi.vn/v1/simtalk?text=${encodeURIComponent(q)}&lc=en`);
    res.json({ status: true, operator: "rocky", question: q, answer: r.data.success || "I'm not sure!" });
  } catch { res.json({ status: true, operator: "rocky", question: q, answer: "Sorry, try again later!" }); }
});

app.get("/api/lyrics", async (req, res) => {
  const { song, artist } = req.query;
  if (!song) return res.json({ status: false, message: "Provide ?song=name" });
  try {
    const url = artist
      ? `https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(song)}`
      : `https://api.lyrics.ovh/suggest/${encodeURIComponent(song)}`;
    const r = await axios.get(url);
    if (artist) {
      res.json({ status: true, operator: "rocky", song, artist, lyrics: r.data.lyrics?.substring(0, 2000) });
    } else {
      res.json({ status: true, operator: "rocky", results: r.data.data?.slice(0, 5).map(s => ({ title: s.title, artist: s.artist.name })) });
    }
  } catch { res.json({ status: false, message: "Lyrics not found" }); }
});

app.get("/api/ytsearch", async (req, res) => {
  const { query } = req.query;
  if (!query) return res.json({ status: false, message: "Provide ?query=video name" });
  res.json({ status: false, message: "Add your YouTube API key to enable this." });
});

app.get("/api/tiktok", async (req, res) => {
  const { url } = req.query;
  if (!url) return res.json({ status: false, message: "Provide ?url=tiktok_url" });
  try {
    const r = await axios.get(`https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`);
    const d = r.data.data;
    res.json({
      status: true, operator: "rocky",
      title: d.title, author: d.author?.nickname,
      video_no_watermark: d.play, video_watermark: d.wmplay,
      thumbnail: d.cover, duration: d.duration + "s",
      views: d.play_count, likes: d.digg_count
    });
  } catch { res.json({ status: false, message: "TikTok download failed" }); }
});

app.use((req, res) => {
  res.status(404).json({ status: false, operator: "rocky", message: "Endpoint not found. Visit /api/list" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Rocky API running on port ${PORT}`));
module.exports = app;
