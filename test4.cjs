const THREE = require('three');

// Let's investigate the coordinate system of maplibre 3.6.2 and tr.scale.
// According to Mapbox GL JS / MapLibre GL JS source code:
// map.transform.scale is basically Math.pow(2, map.transform.zoom).
// map.transform.worldSize is 512 * map.transform.scale.
// map.transform.cameraToCenterDistance is in pixels, relative to the canvas size or screen size (varies based on pitch/FOV).
// To get the distance in mercator coordinates (which are normalized [0, 1]), we MUST divide by map.transform.worldSize.
// The index.html code does:
// const scale = tr.scale;
// const dist = tr.cameraToCenterDistance / scale;
// This means the dist calculated is 512 times too big!

// Next issue: `glbCustomLayer` does this:
/*
      // The map center in mercator coordinates
      const mcCenter = maplibregl.MercatorCoordinate.fromLngLat(map.getCenter(), tr.cameraElevation || 0);

      // Distance from the center point to the camera in mercator units
      const z0 = tr.cameraElevation || 0;
      const dist = tr.cameraToCenterDistance / scale;

      // 1. Camera height above ground
      const camZ = dist * Math.cos(pitch) + z0;

      // 2. Camera ground distance to center
      const xyDist = dist * Math.sin(pitch);
*/
// The result of 512x too big `dist` means `camZ` and `xyDist` are massive.
// So the cameras are computed to be somewhere in outer space, way outside the bounds of the map.
// This perfectly explains why the user says "They may just be off screen, but i can't see any."
// The cameras are literally rendering at a Z coordinate of ~10 (which is 10 times the earth's circumference away!)
// Normal mercator coordinates range from 0 to 1.
// A typical camZ would be ~0.0001 to 0.001.

console.log("Hypothesis confirmed. dist is incorrect by a factor of 512.");

// Furthermore, let's fix the rotation matrix.
// The code uses `new THREE.ConeGeometry( 10, 30, 8 )` and `coneGeo.rotateX(Math.PI / 2);`
// In Three.js, a camera points in the -Z direction.
// So we should make the cone point in the -Z direction. `coneGeo.rotateX(-Math.PI / 2);`
// Wait, a ConeGeometry by default points in the +Y direction.
// So `coneGeo.rotateX(-Math.PI / 2)` rotates it so it points in the +Z direction.
// Let's check:
const cone = new THREE.ConeGeometry(1,1,3);
cone.computeBoundingBox();
console.log("Original Box:", cone.boundingBox); // max.y = 0.5, min.y = -0.5

const q = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1,0,0), Math.PI/2);
const yAxis = new THREE.Vector3(0,1,0).applyQuaternion(q);
console.log("Original Pointy Y Axis after rotateX(PI/2):", yAxis); // (0, 0, 1) --> points +Z!
// To point in the -Z direction, we must rotate by -Math.PI / 2:
const yAxis2 = new THREE.Vector3(0,1,0).applyQuaternion(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1,0,0), -Math.PI/2));
console.log("Original Pointy Y Axis after rotateX(-PI/2):", yAxis2); // (0, 0, -1) --> points -Z!
