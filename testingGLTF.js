import * as THREE from 'three';
import WebGL from 'WebGL';
import { OrbitControls } from 'controls';
import { GLTFLoader } from 'GLTFLoader';

// for compressed models
import { MeshoptDecoder } from 'MeshoptDecoder';

let container = document.getElementById( 'container' );

let camera, scene, renderer;
let clock, delta, interval;
let rocket;

// specific init stuff goes here
function initHook(resourcePath) {
	// hax to avoid issue with manipulating unloaded model
	// probably dumdum, don't do
	rocket = new THREE.Object3D(); 

	// load up a GLB model and add it to le scene
	// rocket1 is ktx2, rocket3 is compressed (?)
	// TODO: fix loading compressed model
	const GLTFpath = resourcePath + '/3Dstuff/models/rocket3.glb';
	const loader = new GLTFLoader().setCrossOrigin('anonymous')
		.setMeshoptDecoder(MeshoptDecoder);

	loader.load(GLTFpath,
		function onLoad(parsedJSON) {
			rocket = parsedJSON.scene;
			rocket.position.y = 5;
			rocket.traverse(descendantObject => {
				descendantObject.castShadow = true;
			});
			scene.add(rocket);
		},
		undefined, // onProgress
		function onFail(error) {
			var message = (error && error.message) ? error.message : 'Failed to load glTF model';
			console.warn(message);
		}
	);

	// add ground plane
	const plane = new THREE.Mesh(
		new THREE.PlaneGeometry(100, 100, 10, 10),
		new THREE.MeshStandardMaterial({
			color: 0xFFFFFF,
		}));
	plane.castShadow = false;
	plane.receiveShadow = true;
	plane.rotation.x = -Math.PI / 2;
	plane.position.set(0, -20, 0);
	scene.add(plane);
}

// time dependent (?) stuff goes in here
function render() {
	rocket.rotation.y += 0.01;
}

// generic init stuff goes here
function init (resourcePath) {
	// init scene
	scene = new THREE.Scene();

	// init camera
	camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight,
		0.1, 1000 ); // fov, aspect ratio, near, far
	camera.position.set(5, 5, 0);

	// init renderer
	renderer = new THREE.WebGLRenderer({
		antialias: true,
	});
	renderer.shadowMap.enabled = true;
	renderer.shadowMapType = THREE.PCFSoftShadowMap;
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize( window.innerWidth, window.innerHeight );

	// add renderer to container
	container.appendChild( renderer.domElement );

	// some high up light for le shadoes, 100% stolen defaults from simondev
	const light = new THREE.DirectionalLight(0xFFFFFF, 1.0);
	light.position.set(20, 100, 2);
	light.target.position.set(0, 0, 0);
	light.castShadow = true;
	light.shadow.bias = -0.001;

	light.shadowMapWidth = 2048;
	light.shadowMapHeight = 2048;

	light.shadow.mapSize.width = 2048;
	light.shadow.mapSize.height = 2048;

	light.shadow.camera.near = 0.1;
	light.shadow.camera.far = 500.0;
	light.shadow.camera.near = 0.5;
	light.shadow.camera.far = 500.0;
	light.shadow.camera.left = 100;
	light.shadow.camera.right = -100;
	light.shadow.camera.top = 100;
	light.shadow.camera.bottom = -100;
	scene.add(light);

	// bit of ambient light
	scene.add(new THREE.AmbientLight(0x505050));

	// set skybox
	const imagePath = resourcePath + '/3Dstuff/FreeCopperCubeSkyboxes/craterlake/craterlake_';
	const loader = new THREE.CubeTextureLoader();
	const texture = loader.load([
		imagePath + 'ft.jpg', // +x
		imagePath + 'bk.jpg', // -x
		imagePath + 'up.jpg', // +y
		imagePath + 'dn.jpg', // -y
		imagePath + 'rt.jpg', // +z
		imagePath + 'lf.jpg', // -z
	]);
	scene.background = texture;

	// do specific init stuff
	initHook(resourcePath);

	// clock to limit frame rate,
	// for consistency and performance
	clock = new THREE.Clock(); // clock that auto-starts when it's used for the first time
	delta = 0; // last measure time difference
	interval = 1 / 60; // time intervals that we wanna render in

	// setup controls
	const controls = new OrbitControls( camera, renderer.domElement);
	controls.target.set(0, 5, 0);
	controls.update();

	// adjust stuff when window is resized
	window.addEventListener( 'resize', onWindowResize );
}

function animate() {
	// kind of mutual recursion, this function tells Window to call itself before next repaint
	// that's how it keeps getting called
	// 	"number of callbacks is usually 60 times per second,
	// 	but will generally match the display refresh rate in
	// 	most web browsers as per W3C recommendation"
	// - from MDN website
	// so I also just manually try to cap it to 60
	requestAnimationFrame( animate );

	// get time that passed since last call of this function, and...
	delta += clock.getDelta();

	// ... if it's >= the intervals we should be animating at,
	if (delta >= interval) {
		delta %= interval; // ... set delta to how late this function was called...

		// ...and we render
		render();
		renderer.render( scene, camera );
	}
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );
}

// only start doing stuff if we have WebGL to start with
if ( WebGL.isWebGLAvailable() ) {
	init('https://spages.mini.pw.edu.pl/~katwikirizee');
	animate();
} else {
	container.appendChild(WebGL.getWebGLErrorMessage());
}

if (false && // tmp
	typeof __THREE_DEVTOOLS__ !== 'undefined') {
	console.log('Debugging scene and renderer');
	__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent('observe', { detail: scene }));
	__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent('observe', { detail: renderer }));
}
