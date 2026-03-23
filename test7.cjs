// Let's verify the new strategy to position the other remote players:
// The original `index.html` calculates:
// this.currentCamPos = { x, y, z };
// this.currentCamRot = { x, y, z, w };
// where they are MERCATOR coordinates.
// Instead of creating meshes in Local space and converting with `lInv` manually:
// 1. `this.remotePlayersGroup` is a THREE.Group() added to `this.scene`.
// 2. We apply `lInv` directly to `remotePlayersGroup` (either matrix or position/quaternion/scale).
// Wait! `lInv` converts Mercator TO Local space.
// `remotePlayersGroup` is IN Local space.
// If a mesh inside `remotePlayersGroup` is at Mercator coordinates (e.g. `x = 0.3`), and `remotePlayersGroup.matrix = lInv`,
// Then `localCoord = lInv * mercatorCoord`. This is exactly what we want!
// We can just say:
// `this.remotePlayersGroup.matrixAutoUpdate = false;`
// `this.remotePlayersGroup.matrix.copy(lInv);`
// Then, inside the `remotePlayersGroup`, we set the mesh position/rotation to the raw `mercatorTargetPos` / `mercatorTargetRot`!
// The lerp/slerp will happen perfectly in Mercator space!

// And regarding scale:
// The cones are created with `new THREE.ConeGeometry( 10, 30, 8 )`.
// In Mercator space, 1 unit is the entire earth (40,000,000 meters).
// If a cone has height 30 in Mercator space, it's 30 times larger than the Earth!
// But wait, the `lInv` matrix scales DOWN from Mercator to Local?
// Let's check:
// Local is Meters. Mercator is Earths.
// `l` scales Local TO Mercator by `mScale` (which is roughly 1/40,000,000).
// So `lInv` scales Mercator TO Local by `1/mScale` (which is roughly 40,000,000).
// Wait, if `remotePlayersGroup` has matrix `lInv`, its children will be scaled by 40,000,000.
// If a cone has radius 10 and height 30, and it gets scaled by 40,000,000, it becomes 1,200,000,000 meters tall!
// This is exactly why `lInv` decomposes weirdly: it scales positions AND sizes massively!

// So we shouldn't use `lInv` on the group unless we scale down the geometries by `mScale`.
// BUT, what if we keep the cones in Local space, and manually map position and quaternion?
// Let's refine the manual mapping strategy without decompose:

// 1. Position:
// localPos = mercatorPos.clone().applyMatrix4(lInv); // Works perfectly!

// 2. Rotation:
// The problem is extracting `lInvRot`.
// Wait, does MapLibre's camera rotate based on `lInv`? NO!
// MapLibre's camera projection is `m.multiply(l)`.
// `l` converts from Local to Mercator. `m` projects Mercator to Screen.
// Our `camQuat` is computed as:
// `new THREE.Quaternion().setFromEuler(new THREE.Euler(pitch, 0, -bearing, 'ZYX'));`
// This is IN MERCATOR space.
// We broadcast it.
// The receiving client has its own `lInv`.
// How to convert a Mercator rotation to a Local rotation?
// We only need the rotation part of `lInv`, IGNORING the negative scale and translation.
// What does `l` do rotation-wise?
// `l` = `translation * scale * rotateX(Math.PI / 2)`.
// The rotation part of `l` is purely `rotateX(Math.PI / 2)`.
// So the rotation part of `lInv` is `rotateX(-Math.PI / 2)`.
// Is there a reflection? Yes, `scale` has `-mScale` on Y.
// A reflection on Y flips the Y axis.
// Let's just create the exact rotation we need manually!
console.log('Math logic tested');
