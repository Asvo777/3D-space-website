import './style.css'
import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';

const STARRANGE = 10000;
const NUMOFSTARS = 500;
const SUN_POSITION = new THREE.Vector3(-1200, 0, 0);
const MARS_ORBIT_RADIUS = 1700;
const MARS_START_ANGLE = 0.48;
const MARS_CAMERA_OFFSET = new THREE.Vector3(-40, 15, 55);
const MARS_VIEW_START = 11696;
const SOLAR_VIEW_START = 16250;
const SYSTEM_VIEW_END = 48000;
const MARS_VIEW_START_CAMERA_POSITION = new THREE.Vector3(
  MARS_VIEW_START * 0.0042,
  (MARS_VIEW_START - 7400) * 0.004 + 0.74,
  10 + MARS_VIEW_START * 0.003,
);

const clamp01 = (value) => Math.min(Math.max(value, 0), 1);
const smoothStep = (value) => {
  const progress = clamp01(value);
  return progress * progress * (3 - 2 * progress);
};

//WEBSITE

//Add show class to elements when they are in the viewport
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    entry.target.classList.toggle("show", entry.isIntersecting);
  });
});

//Select all elements with the class "hide" and observe them
const hiddenElements = document.querySelectorAll(".hide");
hiddenElements.forEach((el) => observer.observe(el));


//ANIMATED 3D BACKGROUND


const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 25000);

const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#bg'),
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.z  = 10;

renderer.render(scene,camera);

const moonTexture = new THREE.TextureLoader().load('https://public-files.gumroad.com/swfpmx3szd2bbajccgfv04lv2e4m');
const material = new THREE.MeshStandardMaterial({map: moonTexture});
const moon = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 32), material);
moon.position.set(30, 0.7, 30);
moon.rotation.y = 30;
scene.add(moon);

const pointLight = new THREE.PointLight(0xffffff);
pointLight.position.copy(SUN_POSITION);

const ambientLight = new THREE.AmbientLight(0xffffff);
scene.add(pointLight, ambientLight);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, 0);
const clock = new THREE.Clock();
let keyboardCameraMode = false;
const pressedKeys = new Set();
const cameraMoveSpeed = 100;
const movementKeys = new Set([
  "KeyW", "KeyA", "KeyS", "KeyD",
  "ArrowUp", "ArrowLeft", "ArrowDown", "ArrowRight",
  "KeyQ", "KeyE",
]);

window.addEventListener("keydown", (event) => {
  if (event.code === "KeyC" && !event.repeat) {
    keyboardCameraMode = !keyboardCameraMode;
    controls.enabled = !keyboardCameraMode;
    pressedKeys.clear();

    if (!keyboardCameraMode) {
      moveCamera();
    }

    event.preventDefault();
    return;
  }

  if (keyboardCameraMode && movementKeys.has(event.code)) {
    pressedKeys.add(event.code);
    event.preventDefault();
  }
});

window.addEventListener("keyup", (event) => {
  pressedKeys.delete(event.code);
});

window.addEventListener("blur", () => {
  pressedKeys.clear();
});

function addStar(){
  const geometry = new THREE.SphereGeometry(0.15, 24 , 24);
  const material = new THREE.MeshStandardMaterial({color: 0xffffff});
  const star = new THREE.Mesh(geometry, material);

  const [x, y, z] = Array(3).fill().map(() => THREE.MathUtils.randFloatSpread(STARRANGE * 2));
  star.position.set(x,y,z);
  scene.add(star);
}

Array(NUMOFSTARS).fill().forEach(addStar);

const spaceTexture = new THREE.TextureLoader().load('https://blenderartists.org/uploads/default/optimized/4X/7/e/2/7e2d7bea4ac21388c4a96e1371f375c4ce00094b_2_1024x576.jpg');
scene.background = spaceTexture;

const earthTexture = new THREE.TextureLoader().load('/public/img/earth.jpg');
const earth = new THREE.Mesh(
  new THREE.SphereGeometry(4, 32, 32),
  new THREE.MeshStandardMaterial({map: earthTexture, roughness: 0.00}),
);


earth.position.set(0,0,0);
earth.rotation.z = 0.2;
earth.rotation.x = 0.15;
scene.add(earth);

const marsTexture = new THREE.TextureLoader().load('/public/img/mars.jpg');
const mars = new THREE.Mesh(
  new THREE.SphereGeometry(10.5, 32, 32),
  new THREE.MeshStandardMaterial({map: marsTexture, roughness: 0.85}),
);


mars.position.set(
  SUN_POSITION.x + Math.cos(MARS_START_ANGLE) * MARS_ORBIT_RADIUS,
  0.7,
  Math.sin(MARS_START_ANGLE) * MARS_ORBIT_RADIUS,
);
mars.rotation.z = 0.2;
mars.rotation.x = 0.15;
scene.add(mars);

const sun = new THREE.Mesh(
  new THREE.SphereGeometry(28, 48, 48),
  new THREE.MeshBasicMaterial({color: 0xffc45c}),
);
sun.position.copy(SUN_POSITION);
scene.add(sun);

function addPlanet(name, radius, color, orbitRadius, angle) {
  const planet = new THREE.Mesh(
    new THREE.SphereGeometry(radius, 32, 32),
    new THREE.MeshStandardMaterial({color, roughness: 0.85}),
  );
  planet.name = name;
  planet.position.set(
    SUN_POSITION.x + Math.cos(angle) * orbitRadius,
    0,
    Math.sin(angle) * orbitRadius,
  );
  scene.add(planet);
  return planet;
}

addPlanet("Mercury", 12, 0x9b9186, 420, -0.6);
addPlanet("Venus", 22, 0xe7b86f, 780, 0.8);
addPlanet("Jupiter", 65, 0xd59a68, 2600, 1.25);
const saturn = addPlanet("Saturn", 55, 0xd9c38b, 3500, -1.6);
addPlanet("Uranus", 40, 0x83d8df, 4500, 2.2);
addPlanet("Neptune", 40, 0x477ae4, 5400, -2.5);

const saturnRings = new THREE.Mesh(
  new THREE.RingGeometry(70, 105, 96),
  new THREE.MeshStandardMaterial({
    color: 0xd9c38b,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.75,
  }),
);
saturnRings.rotation.x = Math.PI / 2;
saturnRings.position.copy(saturn.position);
scene.add(saturnRings);

function addOrbit(radius) {
  const orbit = new THREE.Mesh(
    new THREE.RingGeometry(radius - 1, radius + 1, 128),
    new THREE.MeshBasicMaterial({
      color: 0x9db3d2,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.2,
    }),
  );
  orbit.rotation.x = Math.PI / 2;
  orbit.position.copy(SUN_POSITION);
  scene.add(orbit);
}

[420, 780, 1200, MARS_ORBIT_RADIUS, 2600, 3500, 4500, 5400, 6200].forEach(addOrbit);

function addAsteroidBelt(innerRadius, outerRadius, count, color, verticalSpread) {
  const positions = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = THREE.MathUtils.randFloat(innerRadius, outerRadius);
    positions[i * 3] = SUN_POSITION.x + Math.cos(angle) * radius;
    positions[i * 3 + 1] = THREE.MathUtils.randFloatSpread(verticalSpread);
    positions[i * 3 + 2] = SUN_POSITION.z + Math.sin(angle) * radius;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  scene.add(new THREE.Points(
    geometry,
    new THREE.PointsMaterial({color, size: 2, transparent: true, opacity: 0.8}),
  ));
}

addAsteroidBelt(1850, 2050, 1200, 0xb9a58b, 40);
addAsteroidBelt(5900, 6400, 2000, 0x8192ad, 100);

function addOortCloud(count) {
  const positions = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    const azimuth = Math.random() * Math.PI * 2;
    const vertical = THREE.MathUtils.randFloat(-1, 1);
    const horizontal = Math.sqrt(1 - vertical * vertical);
    const radius = THREE.MathUtils.randFloat(8500, 9500);
    positions[i * 3] = SUN_POSITION.x + Math.cos(azimuth) * horizontal * radius;
    positions[i * 3 + 1] = vertical * radius;
    positions[i * 3 + 2] = SUN_POSITION.z + Math.sin(azimuth) * horizontal * radius;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  scene.add(new THREE.Points(
    geometry,
    new THREE.PointsMaterial({color: 0x9da8bb, size: 2, transparent: true, opacity: 0.55}),
  ));
}

addOortCloud(3000);

let t;
function moveCamera() {
  t = document.body.getBoundingClientRect().top;
  if (keyboardCameraMode) return;

  const scrollDistance = Math.max(0, -t);
  const position = new THREE.Vector3();
  const target = new THREE.Vector3(0, 0, 0);

  if (scrollDistance <= MARS_VIEW_START) {
    position.set(
      scrollDistance * 0.0042,
      scrollDistance <= 7400
        ? scrollDistance * 0.0001
        : (scrollDistance - 7400) * 0.004 + 0.74,
      10 + scrollDistance * 0.003,
    );
  } else if (scrollDistance <= SOLAR_VIEW_START) {
    const progress = smoothStep((scrollDistance - MARS_VIEW_START) / (SOLAR_VIEW_START - MARS_VIEW_START));
    target.copy(mars.position).multiplyScalar(progress);
    position.set(
      THREE.MathUtils.lerp(MARS_VIEW_START_CAMERA_POSITION.x, mars.position.x + MARS_CAMERA_OFFSET.x, progress),
      THREE.MathUtils.lerp(MARS_VIEW_START_CAMERA_POSITION.y, mars.position.y + MARS_CAMERA_OFFSET.y, progress),
      THREE.MathUtils.lerp(MARS_VIEW_START_CAMERA_POSITION.z, mars.position.z + MARS_CAMERA_OFFSET.z, progress),
    );
  } else {
    const progress = smoothStep((scrollDistance - SOLAR_VIEW_START) / (SYSTEM_VIEW_END - SOLAR_VIEW_START));
    target.lerpVectors(mars.position, SUN_POSITION, smoothStep((scrollDistance - SOLAR_VIEW_START) / 8000));
    position.set(
      THREE.MathUtils.lerp(mars.position.x + MARS_CAMERA_OFFSET.x, SUN_POSITION.x, progress),
      THREE.MathUtils.lerp(mars.position.y + MARS_CAMERA_OFFSET.y, 15000, progress),
      THREE.MathUtils.lerp(mars.position.z + MARS_CAMERA_OFFSET.z, SUN_POSITION.z, progress),
    );
  }

  camera.position.copy(position);
  controls.target.copy(target);
  camera.lookAt(target);
}

window.addEventListener("scroll", moveCamera, {passive: true});
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
moveCamera();

let moonOrbitStartTime = 0;
let marsOrbitStartTime = 0;
let marsOrbitActive = false;
function animate() {
  requestAnimationFrame(animate);
  const deltaTime = clock.getDelta();
  const elapsedTime = clock.elapsedTime;
  const scrollDistance = Math.max(0, -t);
  console.log(scrollDistance);

  if (keyboardCameraMode) {
    const forward = new THREE.Vector3();
    camera.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();

    const right = new THREE.Vector3().crossVectors(forward, camera.up).normalize();
    const movement = new THREE.Vector3();

    if (pressedKeys.has("KeyW") || pressedKeys.has("ArrowUp")) movement.add(forward);
    if (pressedKeys.has("KeyS") || pressedKeys.has("ArrowDown")) movement.sub(forward);
    if (pressedKeys.has("KeyD") || pressedKeys.has("ArrowRight")) movement.add(right);
    if (pressedKeys.has("KeyA") || pressedKeys.has("ArrowLeft")) movement.sub(right);
    if (pressedKeys.has("KeyE")) movement.y += 1;
    if (pressedKeys.has("KeyQ")) movement.y -= 1;

    if (movement.lengthSq() > 0) {
      movement.normalize();
      camera.position.addScaledVector(movement, cameraMoveSpeed * deltaTime);
    }
  }

  moon.rotation.y -= 0.0005;

  if (scrollDistance > 7400) {
    const moonOrbitRadius = Math.sqrt(1800);
    const moonOrbitAngle = Math.PI / 4 + (elapsedTime - moonOrbitStartTime) * 0.21;

    moon.position.set(
      Math.cos(moonOrbitAngle) * moonOrbitRadius,
      0.7,
      Math.sin(moonOrbitAngle) * moonOrbitRadius,
    );
  } else {
    moon.position.x = 30;
    moon.position.y = 0.7;
    moon.position.z = 30;
    moonOrbitStartTime = elapsedTime;
  }

  if (scrollDistance > MARS_VIEW_START) {
    if (!marsOrbitActive) {
      marsOrbitStartTime = elapsedTime;
      marsOrbitActive = true;
    }

    const marsOrbitAngle = MARS_START_ANGLE + (elapsedTime - marsOrbitStartTime) * 0.025;
    mars.position.set(
      SUN_POSITION.x + Math.cos(marsOrbitAngle) * MARS_ORBIT_RADIUS,
      0.7,
      Math.sin(marsOrbitAngle) * MARS_ORBIT_RADIUS,
    );
  } else {
    marsOrbitActive = false;
    mars.position.set(
      SUN_POSITION.x + Math.cos(MARS_START_ANGLE) * MARS_ORBIT_RADIUS,
      0.7,
      Math.sin(MARS_START_ANGLE) * MARS_ORBIT_RADIUS,
    );
  }

  if (!keyboardCameraMode) {
    moveCamera();
  }

  earth.rotation.y += 0.005;
  mars.rotation.y += 0.005;
  
  controls.update();
  
  renderer.render(scene, camera);
}





animate();
