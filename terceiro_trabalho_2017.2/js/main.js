// Global variables
var knife;
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
	camera.position.z = 10;


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
	loader.load( 'obj/knife/knife.obj', function ( object ) {
		object.traverse( function ( child ) {
			if ( child instanceof THREE.Mesh ) {
				child.material.map = texture;
			}
		} );
		object.rotateX( 1.5708 );
		knife = object;
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

function distance( a, b ) {
	return Math.sqrt( Math.pow( a.x - b.x, 2 ) + Math.pow( a.y - b.y, 2 ) + Math.pow( a.z - b.z, 2 ) );
}

function onMouseWheel() {
	var e = window.event || e;
	var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
	knife.position.z += delta*10 ; // Adjust zoom sensibility here
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
	knife.position.x += delta.x;
	knife.position.y += -delta.y;
}

function getArcBallVec( x, y, object ) {
	var mousePos = new THREE.Vector3(  x / window.innerWidth  * 2 - 1, y / window.innerHeight  * 2 + 1, 0 );
	mousePos.unproject( camera );
	var dir = mousePos.sub( camera.position ).normalize();
	var distance = - camera.position.z / dir.z;
	var pos = camera.position.clone().add( dir.multiplyScalar( distance ) );
	var objPos = new THREE.Vector3( object.position.x, object.position.y, 0 );
	var p = new THREE.Vector3( pos.x + objPos.x, pos.y + objPos.y, 0 );
	// p.subVectors( mousePos, objPos );
	console.log("mouse:");
	console.log(mousePos);
	console.log("obj:");
	console.log(objPos);
	console.log("subtracao:");
	console.log(p);
	p.y = -p.y;
	var OPSquared = p.x * p.x + p.y * p.y;
	if (OPSquared <= 200*200){
		p.z = Math.sqrt(200*200 - OPSquared);  // Pythagore
	}
	else{
		p.normalize();  // nearest point
	} 
	return p;
}

function rotate( object ) {
	var vec1 = getArcBallVec( pmouseX, pmouseY, knife );
	var vec2 = getArcBallVec( mouseX, mouseY, knife );
	var angle = vec1.angleTo( vec2 );
	var vec3 = new THREE.Vector3();
	vec3.crossVectors( vec1, vec2 );
	vec3.normalize();
	var quaternion = new THREE.Quaternion();
	quaternion.setFromAxisAngle( vec3, angle );
	object.applyQuaternion( quaternion );
}


// Mouse functions
function mouseDragged() {
	if ( document.getElementById("translate").checked ) {
		translate();
	}
	else {
		rotate( knife );
	}
}