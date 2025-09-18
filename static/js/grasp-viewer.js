let scene, camera, renderer, controls;
let currentObject = null;

init();

function init() {
  const container = document.getElementById("grasp-viewer");

  // Scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xfafafa);

  // Camera
  camera = new THREE.PerspectiveCamera(
    45,
    container.clientWidth / container.clientHeight,
    0.1,
    1000
  );
  camera.position.set(0, 0, 3); // Start zoomed out

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);

  // Controls
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  // Lighting
  const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.2); // increased from 0.8
  dirLight1.position.set(1, 1, 1);
  scene.add(dirLight1);

  const dirLight2 = new THREE.DirectionalLight(0xffffff, 1.0); // increased from 0.5
  dirLight2.position.set(-1, -1, -1);
  scene.add(dirLight2);

  const ambient = new THREE.AmbientLight(0xffffff, 0.5); // increased from 0.3
  scene.add(ambient);

  animate();

  // Dropdown event
  document.getElementById("mesh-selector").addEventListener("change", (e) => {
    const meshUid = e.target.value;
    if (meshUid) {
      loadGLB(meshUid);
    }
  });
}

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

function clearScene() {
  if (currentObject) {
    scene.remove(currentObject);
    currentObject.traverse((child) => {
      if (child.isMesh) child.geometry.dispose();
    });
    currentObject = null;
  }
}

function loadGLB(meshUid) {
    clearScene();

    const loader = new THREE.GLTFLoader();
    loader.load(
        `./static/glbs/${meshUid}_grasps.glb`,
        (gltf) => {
            const object = gltf.scene;

            // Compute bounding box to normalize to 2x unit sphere
            const box = new THREE.Box3().setFromObject(object);
            const size = new THREE.Vector3();
            box.getSize(size);
            const maxDim = Math.max(size.x, size.y, size.z);
            const scale = 2.0 / maxDim; // 2x unit sphere
            object.scale.setScalar(scale);

            // Center object
            const center = new THREE.Vector3();
            box.getCenter(center);
            object.position.sub(center.multiplyScalar(scale));

            // Add to scene
            scene.add(object);
            currentObject = object;
        },
        undefined,
        (err) => {
            console.error(`Failed to load ${meshUid}_grasps.glb`, err);
        }
    );
}

