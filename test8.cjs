const THREE = require('three');

// Let's refine the quaternion orientation purely using math.
// 1. The local user computes Mercator:
const pitch = 60 * Math.PI / 180;
const bearing = 45 * Math.PI / 180;
// In Mercator: Z is Up, X is East, Y is South.
// To aim camera:
// Camera points at -Z.
// Pitch rotates around X (tilt up).
// Bearing rotates around Z (yaw).
// The original `index.html` used:
const camQuat = new THREE.Quaternion().setFromEuler(new THREE.Euler(pitch, 0, -bearing, 'ZYX'));

// The remote user receives `camQuat`.
// They must orient a cone in Local Space.
// Local Space:
// Y is Up.
// X is East.
// Z is North.
// Wait! `l` has `rotateX(Math.PI / 2)`.
// So Local Y -> Mercator Z (Up).
// Local Z -> Mercator -Y (North).
// Local X -> Mercator X (East).

// Let's build a rotation matrix from `camQuat`:
const m = new THREE.Matrix4().makeRotationFromQuaternion(camQuat);

// Now apply the coordinate transformation from Mercator to Local.
// The transformation from Mercator to Local is the inverse of Local to Mercator.
// Local to Mercator rotation matrix `R`:
// `(X, Y, Z)_mercator = (X, Z, -Y)_local`
// So `R` maps:
// Local X -> Mercator X
// Local Y -> Mercator Z
// Local Z -> Mercator -Y
// This means `R_inv` (Mercator to Local) maps:
// Mercator X -> Local X
// Mercator Y -> Local -Z
// Mercator Z -> Local Y

// So `lInvRot` is just this rotation matrix `R_inv`!
const rInv = new THREE.Matrix4().set(
  1,  0,  0,  0,
  0,  0,  1,  0,
  0, -1,  0,  0,
  0,  0,  0,  1
);

// We extract `lInvQuat` from `rInv`:
const lInvQuat = new THREE.Quaternion().setFromRotationMatrix(rInv);

// Then `localTargetRot = lInvQuat.clone().multiply(camQuat);`
// Wait, the order of matrix multiplication is `rInv * M * ...`
// So the quaternion order should be `lInvQuat * camQuat`.

// Let's test this:
const localQuat = lInvQuat.clone().multiply(camQuat);
const localConeLookDir = new THREE.Vector3(0, 0, -1).applyQuaternion(localQuat);

console.log("Cone should look North and Down (Pitch 60, Bearing 0)");
const pitchTest = 60 * Math.PI / 180;
const bearingTest = 0 * Math.PI / 180; // North
const quatTest = new THREE.Quaternion().setFromEuler(new THREE.Euler(pitchTest, 0, -bearingTest, 'ZYX'));
const localQuatTest = lInvQuat.clone().multiply(quatTest);
const dirTest = new THREE.Vector3(0, 0, -1).applyQuaternion(localQuatTest);
console.log("Local look dir for bearing=0, pitch=60:", dirTest);
// North is Z in local space? No! Z is North in Local space (Wait: Z -> -Y_merc, so Z is North).
// So it should point towards positive Z (North) and negative Y (Down).
