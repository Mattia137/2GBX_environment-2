import urllib.request
import json
import os

QUERY = """
[out:json][timeout:90];
(
  way["power"="line"](40.60, -74.05, 40.85, -73.85);
  node["power"="generator"](40.60, -74.05, 40.85, -73.85);
  node["power"="plant"](40.60, -74.05, 40.85, -73.85);
  way["power"="substation"](40.60, -74.05, 40.85, -73.85);
  way["power"="generator"](40.60, -74.05, 40.85, -73.85);
  way["power"="plant"](40.60, -74.05, 40.85, -73.85);
);
out geom;
"""

print("Fetching data from OSM Overpass API for NYC...")
url = "https://overpass-api.de/api/interpreter"
data = urllib.parse.urlencode({'data': QUERY}).encode('utf-8')
req = urllib.request.Request(url, data=data)

features = []

try:
    with urllib.request.urlopen(req) as response:
        osm_data = json.loads(response.read().decode('utf-8'))
        print(f"Downloaded {len(osm_data.get('elements', []))} elements.")

        for el in osm_data.get("elements", []):
            tags = el.get("tags", {})
            props = {
                "id": el["id"],
                "type": el["type"],
                "power": tags.get("power", "unknown"),
                "name": tags.get("name", "Unknown"),
                "source": tags.get("generator:source", tags.get("plant:source", "unknown")),
                "voltage": tags.get("voltage", "unknown"),
                "output": tags.get("generator:output:electricity", "unknown")
            }

            if el["type"] == "node":
                features.append({
                    "type": "Feature",
                    "geometry": {
                        "type": "Point",
                        "coordinates": [el["lon"], el["lat"]]
                    },
                    "properties": props
                })
            elif el["type"] == "way":
                if "geometry" in el:
                    # Construct LineString or Polygon
                    coords = [[pt["lon"], pt["lat"]] for pt in el["geometry"]]
                    geom_type = "LineString"
                    
                    # If it's a closed way, it's often a polygon (like a substation)
                    if tags.get("power") in ["substation", "generator", "plant"] and len(coords) > 2 and coords[0] == coords[-1]:
                        geom_type = "Polygon"
                        coords = [coords]

                    features.append({
                        "type": "Feature",
                        "geometry": {
                            "type": geom_type,
                            "coordinates": coords
                        },
                        "properties": props
                    })

    geojson = {
        "type": "FeatureCollection",
        "features": features
    }

    output_path = os.path.join(os.path.dirname(__file__), "nyc_power_grid.geojson")
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(geojson, f)
    
    print(f"Successfully generated {output_path} with {len(features)} features.")
except Exception as e:
    print("Error:", e)
