import os
import json

dirPath = 'projects_glbs'
outputPath = os.path.join(dirPath, 'projects.json')

if not os.path.exists(dirPath):
    print("Error: directory not found")
    exit(1)

files = os.listdir(dirPath)
glbFiles = [f for f in files if f.lower().endswith('.glb') and f.lower() != 'nyc_power_grid.geojson']

projectFiles = []
for f in glbFiles:
    readableName = f[:-4].upper()
    projectFiles.append({
        'name': readableName,
        'file': f"projects_glbs/{f}",
        'desc': f'Placeholder description for {readableName}. Structural metadata and environmental constraints will be populated here.',
        'link': '#'
    })

with open(outputPath, 'w') as f:
    json.dump(projectFiles, f, indent=2)

print(f"Successfully indexed {len(glbFiles)} project GLB files into {outputPath}!")
