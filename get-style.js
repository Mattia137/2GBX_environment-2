export default async function handler(req, res) {
  // Set CORS headers so GitHub Pages (or any origin) can call this endpoint
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const MAPTILER_KEY = process.env.MAPTILER_KEY;

  if (!MAPTILER_KEY) {
    return res.status(500).json({ error: 'MAPTILER_KEY environment variable is not set' });
  }

  try {
    // Fetch the MapTiler style JSON — using the "streets" style as default
    // Change this URL to any MapTiler style you prefer:
    //   streets-v2, basic-v2, outdoor-v2, topo-v2, bright-v2, dataviz, etc.
    const styleUrl = `https://api.maptiler.com/maps/streets-v2/style.json?key=${MAPTILER_KEY}`;

    const response = await fetch(styleUrl);

    if (!response.ok) {
      return res.status(response.status).json({
        error: `MapTiler API returned ${response.status}: ${response.statusText}`
      });
    }

    const styleJson = await response.json();

    // Return the style JSON to the client
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
    return res.status(200).json(styleJson);
  } catch (err) {
    console.error('Error fetching MapTiler style:', err);
    return res.status(500).json({ error: 'Failed to fetch map style from MapTiler' });
  }
}
