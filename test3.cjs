const THREE = require('three');

// Let's look at the math for calculating the camera position:
// The MapLibre transform.scale is NOT the world size, but typically 2^zoom.
// However, in MapLibre, the world size is often map.transform.worldSize, which is 512 * map.transform.scale.
// In the current code:
// const scale = tr.scale;
// const dist = tr.cameraToCenterDistance / scale;
// If tr.scale is 2^zoom, this divides by 65536. But wait, maplibre's world size is 512 * 2^zoom.
// So `cameraToCenterDistance` (in pixels) should be divided by `tr.worldSize` or `512 * tr.scale` to get mercator coordinates (which range from 0 to 1).
// This is definitely a bug if tr.scale is not the full worldSize in pixels.
console.log('Math test done.');

// Also regarding orientation:
// The code says:
// const camQuat = new THREE.Quaternion().setFromEuler(new THREE.Euler(pitch, 0, -bearing, 'ZYX'));
// In Mercator:
// X = East, Y = South, Z = Up.
// A camera looking North (bearing = 0), tilted down by `pitch`, should be pointing -Y and -Z.
// If pitch is 0, it looks straight down (-Z).
// With pitch, it rotates around X-axis. So rotation around X by `pitch`.
// Bearing is rotation around Z-axis. Positive bearing = looking East.
// To look East (bearing = +90 degrees = +PI/2), the camera rotates around Z by -bearing (counter-clockwise).
// Wait, an Euler 'ZYX' applies Z, then Y, then X.
// So Z = -bearing, X = pitch.
// Let's test this:
const pitch = 60 * Math.PI / 180;
const bearing = 90 * Math.PI / 180; // looking East
const euler = new THREE.Euler(pitch, 0, -bearing, 'ZYX');
const quat = new THREE.Quaternion().setFromEuler(euler);
const lookDir = new THREE.Vector3(0, 0, -1).applyQuaternion(quat); // original look dir is down?
// Maplibre camera initially points at -Z (straight down).
// Wait, if pitch = 0, lookDir should be (0, 0, -1).
// With pitch = 60, it should look slightly forward.
console.log('Look Dir:', lookDir);
// If it looks East (bearing 90), Look Dir should be (+X, 0, -Z).
// The lookDir currently printed:
// Look Dir: Vector3 { x: 0.866, y: -0, z: -0.5 }
// That's pointing +X and -Z. That's perfectly East!
// So the Quaternion math is mostly correct for the camera's rotation in Mercator space.
// BUT... we are not rendering a camera, we are rendering a Mesh representing the remote user.
// The Mesh should be placed at the camera's position, and oriented to point in the direction the camera is looking.
// The Mesh geometry is `new THREE.ConeGeometry( 10, 30, 8 )`
// `coneGeo.rotateX(Math.PI / 2)` points the cone along the +Z axis.
// Wait! If the cone points along the +Z axis, and the camera looks along the -Z axis (before pitch/bearing),
// then the cone will point backwards!
// We should probably rotate the cone to point along the -Z axis, or adjust the quaternion.
// Let's check:
const coneLookDir = new THREE.Vector3(0, 0, 1).applyQuaternion(quat);
console.log('Cone Dir:', coneLookDir);
// Cone Dir points at -X and +Z... exactly the opposite!
