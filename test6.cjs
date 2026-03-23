const THREE = require('three');
const mc = { x: 0.3, y: 0.3, z: 0 };
const mScale = 1e-7;
const l = new THREE.Matrix4()
  .makeTranslation(mc.x, mc.y, mc.z)
  .scale(new THREE.Vector3(mScale, -mScale, mScale))
  .multiply(new THREE.Matrix4().makeRotationX(Math.PI / 2));

const lInv = new THREE.Matrix4().copy(l).invert();

const group = new THREE.Group();
group.matrixAutoUpdate = false;
group.matrix.copy(lInv);

// Can a mesh inside this group just use the raw mercator position and rotation?
// Yes! Because the group's matrix applies the Mercator -> Local transformation perfectly, including the negative scale.
// Wait, if we use negative scale, Three.js might cull the mesh (inside-out) unless we use DoubleSide material,
// OR we just set the material.depthTest/wireframe correctly.
// The current cone material is wireframe, so backface culling doesn't matter much.
console.log("Using a Mercator Group is brilliant. It applies lInv matrix automatically to all children!");

// BUT wait... What about the camera position logic?
// 1. MapLibre scale:
// const scale = tr.scale;
// The actual world size is `512 * tr.scale`.
// Let's print out what typical values are.
const tr_scale = Math.pow(2, 16); // zoom 16
const worldSize = 512 * tr_scale;
const pitch = 60 * Math.PI / 180;
const z0 = 0;
const cameraToCenterDistance = 1000; // typical canvas height / tan(fov)

const distBuggy = cameraToCenterDistance / tr_scale;
const camZBuggy = distBuggy * Math.cos(pitch) + z0;

const distCorrect = cameraToCenterDistance / worldSize;
const camZCorrect = distCorrect * Math.cos(pitch) + z0;

console.log("Buggy Z:", camZBuggy, "->", camZBuggy * mScale, "meters"); // meters is nonsense here because Z is mercator.
// 1 mercator unit = earth circumference (~40,000,000 meters).
console.log("Buggy Z in meters:", camZBuggy * 40000000); // 300,000 meters high! (Outer space)
console.log("Correct Z in meters:", camZCorrect * 40000000); // 596 meters high. (Makes perfect sense for a map zoom 16)
