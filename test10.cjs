const THREE = require('three');
const l = new THREE.Matrix4()
  .scale(new THREE.Vector3(1, -1, 1))
  .multiply(new THREE.Matrix4().makeRotationX(Math.PI / 2));

const localX = new THREE.Vector3(1, 0, 0).applyMatrix4(l);
const localY = new THREE.Vector3(0, 1, 0).applyMatrix4(l);
const localZ = new THREE.Vector3(0, 0, 1).applyMatrix4(l);

console.log("Local X -> Mercator:", localX); // (1, 0, 0)
console.log("Local Y -> Mercator:", localY); // (0, 0, 1)  (Up)
console.log("Local Z -> Mercator:", localZ); // (0, 1, 0)  (South)

// Ah!
// Local X -> Mercator X (East)
// Local Y -> Mercator Z (Up)
// Local Z -> Mercator Y (South)

// This means Local Z is SOUTH!
// Wait! `index.html` says: "keeping in mind that in Mercator +Y is South and +X is East."
// So Local Z is Mercator Y, which is South.
// So Local -Z is North.

// Since Local Y -> Mercator Z, there is NO REFLECTION in this mapping!
// Wait, cross product of (1,0,0) and (0,1,0) in Local is (0,0,1).
// Let's check the cross product of their mapped vectors in Mercator:
// X_merc x Y_merc = (1,0,0) x (0,0,1) = (0,-1,0).
// But mapped Local Z is (0,1,0).
// Wait! X x Y in Mercator is -Y. But Local Z mapped is +Y.
// So there IS a reflection.
// Yes, `scale(1, -1, 1)` means determinant is negative.
// So `lInv` has a reflection.

// Because of the reflection, decompose will ALWAYS yield incorrect rotation for right-handed to right-handed conversion.
// BUT since we just want to orient a cone, we don't need to perfectly convert quaternions.
// We just want the cone to point in the `mercatorLookDir`.
// The camera is at `mercatorPos`, pointing towards `mercatorLookDir`.
// In Local space, we want the cone to be at `localPos`, pointing towards `localLookDir`.
// `mercatorLookDir` = `new THREE.Vector3(0, 0, -1).applyQuaternion(mercatorRot)`
// `localLookDir` = `mercatorLookDir.clone().applyMatrix4(lInv)`.
// We can just use `lookAt`!
// `mesh.position.copy(localPos)`
// `mesh.lookAt(mesh.position.clone().add(localLookDir))`
// Simple, mathematically sound, handles reflection automatically!

// Wait, we need the cone's "Up" vector to be correct too (roll), so it's not upside down or sideways.
// `mercatorUp` = `new THREE.Vector3(0, 1, 0).applyQuaternion(mercatorRot)`
// `localUp` = `mercatorUp.clone().applyMatrix4(lInv)`
// `mesh.up.copy(localUp)`
// `mesh.lookAt(mesh.position.clone().add(localLookDir))`

console.log("Using lookAt and Up is mathematically perfect and avoids quaternion decomposition of reflection matrices!");

// Let's test it:
const pitch = 60 * Math.PI / 180;
const bearing = 0 * Math.PI / 180; // North
const mercatorRot = new THREE.Quaternion().setFromEuler(new THREE.Euler(pitch, 0, -bearing, 'ZYX'));

const mScale = 1e-7;
const lMatrix = new THREE.Matrix4()
  .scale(new THREE.Vector3(mScale, -mScale, mScale))
  .multiply(new THREE.Matrix4().makeRotationX(Math.PI / 2));
const lInv = new THREE.Matrix4().copy(lMatrix).invert();

// A vector applies transformation without translation
const lInvNoTransl = new THREE.Matrix4().copy(lInv);
lInvNoTransl.setPosition(0,0,0);

const mercatorLookDir = new THREE.Vector3(0, 0, -1).applyQuaternion(mercatorRot);
const mercatorUpDir = new THREE.Vector3(0, 1, 0).applyQuaternion(mercatorRot);

const localLookDir = mercatorLookDir.clone().applyMatrix4(lInvNoTransl).normalize();
const localUpDir = mercatorUpDir.clone().applyMatrix4(lInvNoTransl).normalize();

console.log("Mercator Look:", mercatorLookDir); // North, Down
console.log("Local Look:", localLookDir); // Should point North (-Z) and Down (-Y)

console.log("Mercator Up:", mercatorUpDir); //
console.log("Local Up:", localUpDir);
