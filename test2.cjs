const THREE = require('three');

// Let's analyze how to get the exact rotation and position that maplibregl/three.js expects for a remote camera mesh.

// Instead of broadcasting Mercator coordinates and quaternions,
// What if we convert the camera's local transform directly, OR simply map Mercator -> LngLat -> Local?
// The instructions in AGENTS.md explicitly state:
// "In the MapLibre/Three.js custom layer, do not invert camera.projectionMatrix to extract camera state. Since MapLibre GL JS 3.x removed map.getFreeCameraOptions(), calculate the camera's raw Mercator coordinates manually using map.transform (center, pitch, bearing, scale), keeping in mind that in Mercator +Y is South and +X is East. Broadcast these calculated coordinates for Liveblocks synchronization. Receiving clients apply the inverse of their local model transformation matrix (lInv) to convert them to local 3D space."

// Let's review the current logic:
// 1. Camera height above ground
// const camZ = dist * Math.cos(pitch) + z0;

// Wait, the dist calculation in the index.html:
// const dist = tr.cameraToCenterDistance / scale;
// BUT what scale is this? MapLibre `tr.scale`?
// The formula for height in Mercator coordinates is actually `cameraToCenterDistance / 512 / Math.pow(2, zoom)`
// Or rather, if tr.scale is 2^zoom, it is `tr.cameraToCenterDistance / (512 * tr.scale)`.
// Let's check maplibre GL JS source code or standard knowledge:
// MapLibre's mercator scale: `worldSize = 512 * map.transform.scale`.
// Distance in Mercator: `dist_mercator = pixels / worldSize`.
// In index.html: `const dist = tr.cameraToCenterDistance / scale;` This seems wrong! It should divide by `512 * tr.scale` if `tr.scale` is 2^zoom, OR if `scale` is worldSize, it should be fine. But maplibre's `tr.scale` usually IS 2^zoom. Wait, map.transform.scale is 2^zoom.

// Let's write a snippet to compute exact Mercator from Pitch and Bearing.
// A simpler way: maplibre 3.6.2 HAS map.getFreeCameraOptions()!
// Wait! The prompt says "Since MapLibre GL JS 3.x removed map.getFreeCameraOptions()..." so we must follow it.
