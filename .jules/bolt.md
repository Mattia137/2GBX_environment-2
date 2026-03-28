
## 2026-03-27 - Throttle traffic simulation calculations
**Learning:** Running spatial hashing (`shBuild`) and A* pathfinding loop retries (e.g., 20-30 iterations) inside the per-frame `tickCars()` loop for thousands of cars severely blocks the main thread, dropping FPS to near zero when cars get clustered.
**Action:** Interleave heavy calculations across frames using the car's ID and a frame counter (e.g., `(tFrame + c.id) % 6 === 0`). Radically reduce loop retries in fallback navigation methods (e.g., limit A* to 3 retries in `newGoal`) and rely on basic fallback behavior to keep traffic moving rather than computing a perfect path.

## 2024-05-28 - Extracting Local Camera State in Mapbox/Three.js Integration
**Learning:** Inverting a perspective projection matrix (`camera.projectionMatrix.invert()`) to extract position and rotation is mathematically invalid in 3D graphics and yields garbage data.
**Action:** When extracting the Mapbox camera state for a local Three.js scene, use `map.getFreeCameraOptions()` to get accurate Mercator world coordinates. Then, apply the inverse of the local model transformation matrix (`lInv`, the inverse of the matrix used to position the Three.js scene on the map) to convert those Mercator coordinates into the local 3D scene space before broadcasting or using them.
