// Global variables
var toy;
var container;
var camera, scene, renderer;
var mouseIsPressed, mouseX, mouseY, pMouseX, pmouseY;
var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;


// Function call
init();
animate();


// Functions
function init() {
	container = document.createElement( 'div' );
	document.body.appendChild( container );
	camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 2000 );
	camera.lookAt( new THREE.Vector3( 0, 0, 0 ) );
	camera.position.z = 500;


	// Scene
	scene = new THREE.Scene();
	var ambientLight = new THREE.AmbientLight( 0xcccccc, 0.4 );
	scene.add( ambientLight );
	var pointLight = new THREE.PointLight( 0xffffff, 0.8 );
	camera.add( pointLight );
	scene.add( camera );


	// Texture
	var manager = new THREE.LoadingManager();
	var textureLoader = new THREE.TextureLoader( manager );
	var texture = textureLoader.load( 'textures/UV_Grid_Sm.jpg' );


	// Model
	var loader = new THREE.OBJLoader( manager );
	loader.load( 'obj/male02/male02.obj', function ( object ) {
		object.traverse( function ( child ) {
			if ( child instanceof THREE.Mesh ) {
				child.material.map = texture;
			}
		} );
		toy = object;
		scene.add( object );
	 });


	// Render
	renderer = new THREE.WebGLRenderer();
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	container.appendChild( renderer.domElement );


	// Resize Event Listener
	window.addEventListener( 'resize', onWindowResize, false );

	// Mouse Event Listener
	mouseIsPressed = false;
	mouseX = 0;
	mouseY = 0;
	pmouseX = 0;
	pmouseY = 0;

	var setMouse = function () {
		mouseX = event.clientX;
		mouseY = event.clientY;
	}

	renderer.domElement.addEventListener( 'wheel', onMouseWheel, false ); // Don't work on Firefox

	renderer.domElement.addEventListener ( 'mousedown', function () {
		setMouse();
		mouseIsPressed = true;
		if (typeof mousePressed !== 'undefined') mousePressed();
	} );

	renderer.domElement.addEventListener ( 'mousemove', function () { 
		pmouseX = mouseX;
		pmouseY = mouseY;
		setMouse();
		if (mouseIsPressed) {
			if (typeof mouseDragged !== 'undefined') mouseDragged(); 
		}
		if (typeof mouseMoved !== 'undefined') mouseMoved();
	} );

	renderer.domElement.addEventListener ( 'mouseup', function () { 
		mouseIsPressed = false; 
		if (typeof mouseReleased !== 'undefined') mouseReleased(); 
	} );

}

function onWindowResize() {
	windowHalfX = window.innerWidth / 2;
	windowHalfY = window.innerHeight / 2;
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
}

function onMouseWheel() {
	var e = window.event || e;
	var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
	toy.translateZ(delta*20); // Adjust zoom sensibility here
	return false;
}

function animate() {
	requestAnimationFrame( animate );
	render();
}

function render() {
	renderer.render( scene, camera );
}

function translate() {
	var delta = new THREE.Vector3();
	var mouse = new THREE.Vector3( mouseX, mouseY, 0 );
	delta.subVectors( mouse, new THREE.Vector3( pmouseX, pmouseY, 0 ) );
	toy.translateX( delta.x) ;
	toy.translateY( -delta.y );
}

function rotate() {
	
}


// Mouse functions
function mouseDragged() {
	translate();
}