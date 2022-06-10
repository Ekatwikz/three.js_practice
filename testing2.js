// draw a triangle, adapted from lines tutorial in manuals

import * as THREE from 'three';
import WebGL from 'WebGL';

function stuff() {
	// make 3D renderer and add it to page
	const renderer = new THREE.WebGLRenderer();
	renderer.setSize( window.innerWidth, window.innerHeight );
	document.body.appendChild( renderer.domElement );


	// make scene
	const scene = new THREE.Scene();

	// create camera, position it and point it in the right direction
	const camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 500 );
	camera.position.set( 0, 0, 100 );
	camera.lookAt( 0, 20, 0 );


	// make a bunch of point to make a triangle
	const points = [];
	const lineLength = 30;
	points.push( new THREE.Vector3( -lineLength, 0, 0 ) );
	points.push( new THREE.Vector3( 0, lineLength, 0 ) );
	points.push( new THREE.Vector3( lineLength, 0, 0 ) );
	points.push( new THREE.Vector3( -lineLength, 0, 0 ) );

	// make the line "geometry" (it's a triangle lul) with the given points
	const geometry = new THREE.BufferGeometry().setFromPoints( points );

	// create the line with that triangle geometry
	const material = new THREE.LineDashedMaterial( { color: 0x0000ff } );
	const line = new THREE.Line( geometry, material );

	// add the geometry to the scene and render it
	scene.add( line );
	renderer.render( scene, camera );
}

// don'd do nothin if we don't got no WebGL lul
if ( WebGL.isWebGLAvailable() ) {
	stuff();
} else {
	const warning = WebGL.getWebGLErrorMessage();
	document.getElementById( 'container' ).appendChild( warning );
}
