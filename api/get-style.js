export default async function handler(req, res) {
  const origin = req.headers.origin;
  const allowedOrigins = [
    'https://2gbxenvironment-2.vercel.app',
    'http://localhost:8080'
  ];

  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else if (origin) {
    // If there is an origin but it's not allowed, return 403 Forbidden
    return res.status(403).json({ error: 'Forbidden' });
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Your Vercel env var is named MAP_TILER
  const KEY = process.env.MAP_TILER || process.env.MAPTILER_KEY;

  if (!KEY) {
    return res.status(500).json({ error: 'MAP_TILER environment variable is not set' });
  }

  try {
    // Using streets-v2 — good balance of detail for 3D building extrusions
    const styleUrl = `https://api.maptiler.com/maps/streets-v2/style.json?key=${KEY}`;
    const response = await fetch(styleUrl);

    if (!response.ok) {
      return res.status(response.status).json({
        error: `MapTiler API returned ${response.status}: ${response.statusText}`
      });
    }

    const styleJson = await response.json();

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
    return res.status(200).json(styleJson);
  } catch (err) {
    console.error('Error fetching MapTiler style:', err);
    return res.status(500).json({ error: 'Failed to fetch map style from MapTiler' });
  }
}
