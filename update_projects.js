import fs from 'fs';
import path from 'path';

const dirPath = path.join(process.cwd(), 'projects_glbs');
const outputPath = path.join(dirPath, 'projects.json');

// Read all files in the directory
fs.readdir(dirPath, (err, files) => {
  if (err) {
    console.error("Error reading projects_glbs directory:", err);
    process.exit(1);
  }

  // Filter out any non-glb objects or specific exceptions
  const glbFiles = files.filter(f => f.toLowerCase().endsWith('.glb') && f.toLowerCase() !== 'nyc_power_grid.geojson');

  // Build the array payload
  const projectFiles = glbFiles.map(file => {
    // Generate a readable name from the filename
    const readableName = file.replace(/\.glb$/i, '').toUpperCase();
    
    return {
      name: readableName,
      file: `projects_glbs/${file}`,
      desc: `Placeholder description for ${readableName}. Structural metadata and environmental constraints will be populated here.`,
      link: '#'
    };
  });

  // Write it to JSON
  fs.writeFile(outputPath, JSON.stringify(projectFiles, null, 2), (writeErr) => {
    if (writeErr) {
      console.error("Failed to write projects.json:", writeErr);
      process.exit(1);
    }
    console.log(`Successfully indexed ${glbFiles.length} project GLB files into projects_glbs/projects.json!`);
  });
});
