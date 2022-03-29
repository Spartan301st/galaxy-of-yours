import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "lil-gui";
import {
  BufferAttribute,
  BufferGeometry,
  Points,
  PointsMaterial,
  Color,
} from "three";

/**
 * Base
 */
// Debug
const gui = new dat.GUI({ width: 360 });

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

/**
 * Test cube
 */
// const cube = new THREE.Mesh(
//     new THREE.BoxGeometry(1, 1, 1),
//     new THREE.MeshBasicMaterial()
// )
// scene.add(cube)

/**
 * GALAXY
 */

// parameters object that would be used in gui panel for users to tweak and create galaxies
const parameters = {};
parameters.count = 100000;
parameters.size = 0.01;

// for establishing the radius of the whole galaxy; how far it spreads
parameters.radius = 5;

// branches(sectors) to divide galaxy into
parameters.branches = 3;

// for spining the particles on the circle; still no randomness
parameters.spin = 1;

// randomness for particle positions on the circle
parameters.randomness = 1;

// randomness power for controlling the scale between 0-1
parameters.randomnessPower = 3;

// for vertices near the center
// some reccomended colors
parameters.insideColor = "#f72585";
// parameters.insideColor = "#6ff726";
parameters.outsideColor = "#4361ee";

// starting with empty values
// necessary to be able to destroy prev values later in generateGalaxy function
let geometry = null;
let points = null;
let material = null;

// function for generating a galaxy
const generateGalaxy = () => {
  /**
   * Destroy old galaxy
   */
  // checking one value out of 3 is enough to determine whether there are values assigned to them
  if (points !== null) {
    // to remove geometry
    geometry.dispose();
    // to remove material
    material.dispose();
    // to remove points from the scene
    scene.remove(points);
  }

  /**
   * Geometry
   */
  // new empty geometry
  geometry = new BufferGeometry();
  // positions array; multiplied by 3 because of x,y,z indicators for each point
  const positions = new Float32Array(parameters.count * 3);
  // for storing colors for each vertex, and *3 for r,g,b
  const colors = new Float32Array(parameters.count * 3);

  // creating color instances for both inside and outside colors
  const colorInside = new Color(parameters.insideColor);
  const colorOutside = new Color(parameters.outsideColor);
  // creating a third color by cloning the colorInside and with the lerp method mix it with the colorOutside
  // note that lerp accepts color and alpha meaning the amount it takes from that color for mixing
  // note that we have to clone the first color in order not to change its value

  // loop through each positions array element and assing random number to each
  for (let i = 0; i < parameters.count; i++) {
    // Positions \\
    const i3 = i * 3;
    // a random value on the radius for placing planets far away
    const radius = Math.random() * parameters.radius;
    // for spinning the points
    const spinAngle = radius * parameters.spin;
    // to determine the angle of the branch where the new planet would be placed
    // first we take the module of i and then we divide it by total # of branches making them range from 0-1 + convert to the radians
    const branchAngle =
      ((i % parameters.branches) / parameters.branches) * Math.PI * 2;
    // calculating randomness for each axis
    // const randomX = (Math.random() - 0.5) * parameters.randomness;
    // const randomY = (Math.random() - 0.5) * parameters.randomness;
    // const randomZ = (Math.random() - 0.5) * parameters.randomness;
    // same as above with the scale control for squizing or expanding the galaxy
    const randomX =
      Math.pow(Math.random(), parameters.randomnessPower) *
      (Math.random() < 0.5 ? 1 : -1);
    const randomY =
      Math.pow(Math.random(), parameters.randomnessPower) *
      (Math.random() < 0.5 ? 1 : -1);
    const randomZ =
      Math.pow(Math.random(), parameters.randomnessPower) *
      (Math.random() < 0.5 ? 1 : -1);
    // positions[i3] = (Math.random() - 0.5) * 3;
    // positions[i3 + 1] = (Math.random() - 0.5) * 3;
    // positions[i3 + 2] = (Math.random() - 0.5) * 3;
    // position along the radius
    // positions[i3] = radius;
    // branchangle to place particle on the corresponding branch
    // spinangle to spin points placed further from the center more
    // * by radius to place points closer and further
    // + randomX, randomY, randomZ to place points for the given branch randomly
    positions[i3] = Math.cos(branchAngle + spinAngle) * radius + randomX;
    positions[i3 + 1] = 0 + randomY;
    positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ;

    // Colors \\

    // new 3rd color \\
    // cloning the base color. We have clone method on many three.js classes
    const mixedColor = colorInside.clone();
    // lerping colors to create new 3rd one
    mixedColor.lerp(colorOutside, radius / parameters.radius);

    colors[i3] = mixedColor.r;
    colors[i3 + 1] = mixedColor.g;
    colors[i3 + 2] = mixedColor.b;
  }
  // setting position attribute for the given geometry
  geometry.setAttribute("position", new BufferAttribute(positions, 3));
  // setting color attribute for the given geometry
  geometry.setAttribute("color", new BufferAttribute(colors, 3));

  /**
   * Material
   */
  material = new PointsMaterial({
    size: parameters.size,
    sizeAttenuation: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    // color: 0xff44aa,
    // necessary for vertex points
    vertexColors: true,
  });

  /**
   * Points
   */
  points = new Points(geometry, material);
  scene.add(points);
};
// immediately calling galaxy function
generateGalaxy();

// adding some tweaks to debug panel
// Note: instead of onChange use onFinishChange so that an effect would take place once change of value is finished, and generateGalaxy
// function would be called
// for number of particles
gui
  .add(parameters, "count")
  .min(100)
  .max(10000)
  .step(100)
  .onFinishChange(generateGalaxy);
// for size of the particles
gui
  .add(parameters, "size")
  .min(0.001)
  .max(0.1)
  .step(0.001)
  .onFinishChange(generateGalaxy);
// for radius of the whole galaxy
gui
  .add(parameters, "radius")
  .min(0.01)
  .max(20)
  .step(0.01)
  .onFinishChange(generateGalaxy);
// for dividing galaxy into equal sectors/branches
gui
  .add(parameters, "branches")
  .min(1)
  .max(36)
  .step(1)
  .onFinishChange(generateGalaxy);
// for turning particles on the circle
gui
  .add(parameters, "spin")
  .min(-5)
  .max(5)
  .step(0.05)
  .onFinishChange(generateGalaxy);
// for randomly placing planets on the circle
gui
  .add(parameters, "randomness")
  .min(0)
  .max(2)
  .step(0.001)
  .onFinishChange(generateGalaxy);
// for tweaking the randomness power to make particles spread more predictably
gui
  .add(parameters, "randomnessPower")
  .min(1)
  .max(10)
  .step(0.01)
  .onFinishChange(generateGalaxy);
// adding inner and outer colors
// note that method isn't add but addColor
gui.addColor(parameters, "insideColor").onFinishChange(generateGalaxy);
gui.addColor(parameters, "outsideColor").onFinishChange(generateGalaxy);

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.x = 3;
camera.position.y = 3;
camera.position.z = 3;
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  points.rotation.y = Math.cos(elapsedTime * 0.1) * Math.PI;

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();

// three.js provides a .dispose() method to get rid of unnecessary geometries, materials
// to get rid of Mesh or Points use scene.remove()
