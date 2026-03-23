const THREE = require('three');

// Simulate Mercator space to local space conversion
// Let's create a local space matrix with translation, scale and rotation
const mc = { x: 0.3, y: 0.3, z: 0 };
const mScale = 1e-7;
const l = new THREE.Matrix4()
  .makeTranslation(mc.x, mc.y, mc.z)
  .scale(new THREE.Vector3(mScale, -mScale, mScale))
  .multiply(new THREE.Matrix4().makeRotationX(Math.PI / 2));

const lInv = new THREE.Matrix4().copy(l).invert();

// In index.html, lInv is decomposed into position, rotation, and scale.
// But setFromRotationMatrix can handle negative scales via decompose? Let's see:
const lInvRot = new THREE.Quaternion();
lInv.decompose(new THREE.Vector3(), lInvRot, new THREE.Vector3());

// If we apply lInv to a position, it will negate Y.
// If we apply lInvRot to a quaternion, how does it handle the negative Y scale?
// Decompose of a matrix with reflection (scale y = -1) usually produces incorrect or weird rotations because reflection cannot be represented by a quaternion!
console.log('lInvRot:', lInvRot);

// Test transformation directly using matrix vs decompose
const testPoint = new THREE.Vector3(0.3, 0.3 + 1e-7, 0); // 1 meter south in mercator (+Y)
const localPointMatrix = testPoint.clone().applyMatrix4(lInv);
console.log('Local Point Matrix (South = +Y in Merc):', localPointMatrix);

// Test quaternion from Matrix4 decompose when scale is negative
const testDirMatrix = new THREE.Vector3(0, 1, 0).applyMatrix4(lInv).sub(new THREE.Vector3(0,0,0).applyMatrix4(lInv)).normalize();
console.log('Local Dir Matrix (Mercator +Y):', testDirMatrix);

const testDirQuat = new THREE.Vector3(0, 1, 0).applyQuaternion(lInvRot);
console.log('Local Dir Quat (Mercator +Y):', testDirQuat);
