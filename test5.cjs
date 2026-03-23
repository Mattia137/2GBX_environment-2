const THREE = require('three');

// So what is the fix?
// 1. `const scale = tr.scale;`
//    `const worldSize = 512 * scale;`
//    `const dist = tr.cameraToCenterDistance / worldSize;`
//    This correctly computes the normalized distance.
// 2. The cone's initial rotation should probably point -Z (the same way the camera points):
//    `coneGeo.rotateX(-Math.PI / 2);`
// 3. The cone needs to be much, much smaller.
//    `new THREE.ConeGeometry( 10, 30, 8 )` -> In normalized mercator space, this is massive!
//    Wait! The local matrix (`lInv`) is applied to the scene to render the geometry.
//    In the scene, what is the scale of `lInv`?
//    `l = new THREE.Matrix4().scale(new THREE.Vector3(mScale, -mScale, mScale))`
//    So local geometries have scale `mScale` compared to mercator units!
//    Wait, the local matrix `l` converts from "Local" to "Mercator".
//    So `lInv` converts from "Mercator" to "Local".
//    The geometries are defined in "Local" space.
//    What is `mScale`? `mScale` = `mc.meterInMercatorCoordinateUnits()`.
//    This means Local space is scaled in **Meters**.
//    So `ConeGeometry(10, 30, 8)` is a cone that is 20 meters wide and 30 meters long!
//    That scale is perfectly fine, maybe a bit large, but visible.
// 4. Why are the meshes not rendering correctly then?
//    `mesh.userData.mercatorTargetPos` is passed as a raw mercator coordinate.
//    Then we do: `const localTargetPos = mesh.userData.mercatorTargetPos.clone().applyMatrix4(lInv);`
//    This translates the mercator coordinate to local coordinates (Meters offset from the origin GLB_ORIGIN).
//    Then we do: `const localTargetRot = lInvRot.clone().multiply(mesh.userData.mercatorTargetRot);`
//    Wait! `lInv` scales by (1/mScale, -1/mScale, 1/mScale).
//    It is a non-uniform scale matrix containing a reflection (`-Y`).
//    Extracting a quaternion (`lInvRot`) from a matrix with reflection is undefined or weird!
//    In Three.js, `decompose` on a matrix with negative determinant will just pick a quaternion, but it WILL BE WRONG for orientation!
//    If `lInv` reflects Y, then standard rotation logic fails. A mesh in Three.js MUST use negative scale `y = -1` to match the reflection.
//    Right now, the script ONLY applies the position and quaternion to the mesh:
//    ```
//      mesh.position.copy(localTargetPos);
//      mesh.quaternion.copy(localTargetRot);
//    ```
//    It completely ignores the scale from `lInv`!
//    The scale of `lInv` is `(1/mScale, -1/mScale, 1/mScale)`.
//    If it ignores the negative Y scale, the mesh is inside-out AND facing the wrong direction!
//    Even worse, the `mercatorTargetRot` is computed based on Mercator space (where +Y is South).
//    Local space has +Y as UP (wait, `makeRotationX(Math.PI / 2)` means Z is UP in Local space).
//    Let's check the local matrix `l`:
//    `makeTranslation(mc.x, mc.y, mc.z)`
//    `scale(mScale, -mScale, mScale)`
//    `makeRotationX(Math.PI / 2)`
//    So Local +Z = Mercator -Y (North).
//    Local +Y = Mercator +Z (Up).
//    Local +X = Mercator +X (East).
//    If Local +Z is North, then the reflection `scale(..., -mScale, ...)` is making the Y axis correctly map to Z.
//    But since `lInv` contains a reflection, `decompose` returns garbage rotation for `lInvRot`.
//    The CORRECT way to handle this is:
//    Don't apply `lInvRot` via `quaternion.copy()`.
//    Instead, let's keep the remote meshes in Mercator space OR correctly transform the quaternion using the known local-to-mercator relationship!
//    Or even simpler:
//    The local group (`remotePlayersGroup`) could just be added to a scene that already has the Mercator-to-Local conversion.
//    Wait, `glbCustomLayer.remotePlayersGroup` is added to `glbCustomLayer.scene`.
//    The camera renders `glbCustomLayer.scene`.
//    The camera's projection matrix is `m.multiply(l)`.
//    This means anything in `glbCustomLayer.scene` MUST be in Local space (meters, origin at GLB_ORIGIN).
//    If we want to place a mesh at a Mercator coordinate, we should either:
//    1. Convert the mercator position/rotation to local position/rotation perfectly.
//    2. Create a separate Group that has its `matrixAutoUpdate = false`, and set its `matrix` to `lInv`. Then put the meshes inside it!
