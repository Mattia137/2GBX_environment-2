
## 2024-05-28 - Extracting Local Camera State in Mapbox/Three.js Integration
**Learning:** Inverting a perspective projection matrix (`camera.projectionMatrix.invert()`) to extract position and rotation is mathematically invalid in 3D graphics and yields garbage data.
**Action:** When extracting the Mapbox camera state for a local Three.js scene, use `map.getFreeCameraOptions()` to get accurate Mercator world coordinates. Then, apply the inverse of the local model transformation matrix (`lInv`, the inverse of the matrix used to position the Three.js scene on the map) to convert those Mercator coordinates into the local 3D scene space before broadcasting or using them.
