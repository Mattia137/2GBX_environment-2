const THREE = require('three');

// Let's refine the quaternion orientation purely using math.
// 1. The local user computes Mercator:
const pitchTest = 60 * Math.PI / 180;
const bearingTest = 0 * Math.PI / 180; // North

const camQuat = new THREE.Quaternion().setFromEuler(new THREE.Euler(pitchTest, 0, -bearingTest, 'ZYX'));

// 2. We convert Mercator to Local Rotation.
// Mercator: X=East, Y=South, Z=Up.
// Local: X=East, Y=Up, Z=South (wait, `scale(1, -1, 1)` flips Y).
// Let's check `lInv` again.
const mc = { x: 0, y: 0, z: 0 };
const mScale = 1; // Simplify to 1 to test purely rotation/reflection
const l = new THREE.Matrix4()
  .makeTranslation(mc.x, mc.y, mc.z)
  .scale(new THREE.Vector3(mScale, -mScale, mScale))
  .multiply(new THREE.Matrix4().makeRotationX(Math.PI / 2));

// `l` maps Local to Mercator.
// Let's see what `l` does to axes:
const localX = new THREE.Vector3(1, 0, 0).applyMatrix4(l).sub(new THREE.Vector3(0,0,0).applyMatrix4(l)).normalize();
const localY = new THREE.Vector3(0, 1, 0).applyMatrix4(l).sub(new THREE.Vector3(0,0,0).applyMatrix4(l)).normalize();
const localZ = new THREE.Vector3(0, 0, 1).applyMatrix4(l).sub(new THREE.Vector3(0,0,0).applyMatrix4(l)).normalize();

console.log("Local X -> Mercator:", localX); // X -> X (East)
console.log("Local Y -> Mercator:", localY); // Y -> -Z (Down??) Wait, rotateX(PI/2) maps Y->Z. But negative scale flips it?
console.log("Local Z -> Mercator:", localZ); // Z -> -Y (North)

// Let's re-examine `l`:
// 1. `makeRotationX(Math.PI / 2)`:
//    X -> X
//    Y -> Z
//    Z -> -Y
// 2. `scale(1, -1, 1)`:
//    X -> X
//    Y -> -Y (which was Z, so now -Z? Wait, scale applies to the Y component *after* rotation? No, scale is applied *before* rotation in matrix multiplication?
//    Wait! `scale().multiply(rotation)` means rotation happens FIRST, then scale.
//    So:
//    (X,Y,Z) -> Rotation -> (X, -Z, Y) -> Scale -> (X, Z, Y) ?
//    Let's check the output!
