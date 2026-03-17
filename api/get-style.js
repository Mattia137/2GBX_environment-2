export default async function handler(req, res) {
  // Matches your Vercel screenshot exactly
  const KEY = process.env.MAP_TILER; 
  
  if (!KEY) {
    return res.status(500).json({ 
      error: "Environment Variable 'MAP_TILER' not found. Please check Vercel settings." 
    });
  }

  try {
    const response = await fetch(`https://api.maptiler.com/maps/basic-v2-dark/style.json?key=${KEY}`);
    
    if (!response.ok) {
        return res.status(response.status).json({ error: "MapTiler API returned an error." });
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: "Server error fetching map style" });
  }
}
