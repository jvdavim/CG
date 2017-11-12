// Global variables
var obj;
var container;
var camera, scene, renderer, mouseIsPressed, mouseX, mouseY, pMouseX, pmouseY;
var cMouseX = 0, cMouseY = 0;
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
	camera.position.z = 250;


	// Scene
	scene = new THREE.Scene();
	var ambientLight = new THREE.AmbientLight( 0xcccccc, 0.4 );
	scene.add( ambientLight );
	var pointLight = new THREE.PointLight( 0xffffff, 0.8 );
	camera.add( pointLight );
	scene.add( camera );


	// Texture
	var manager = new THREE.LoadingManager();
	manager.onProgress = function ( item, loaded, total ) {
		console.log( item, loaded, total );
	};
	var textureLoader = new THREE.TextureLoader( manager );
	var texture = textureLoader.load( 'textures/UV_Grid_Sm.jpg' );


	// Model
	var onProgress = function ( xhr ) {
		if ( xhr.lengthComputable ) {
			var percentComplete = xhr.loaded / xhr.total * 100;
			console.log( Math.round(percentComplete, 2) + '% downloaded' );
		}
	};
	var onError = function ( xhr ) {
	};
	var loader = new THREE.OBJLoader( manager );
	loader.load( 'obj/male02/male02.obj', function ( object ) {
		object.traverse( function ( child ) {
			if ( child instanceof THREE.Mesh ) {
				child.material.map = texture;
			}
		} );
		object.position.y = - 95;
		obj = object;
		scene.add( object );
	}, onProgress, onError );


	// Render
	renderer = new THREE.WebGLRenderer();
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	container.appendChild( renderer.domElement );


	// Event Listener
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

	renderer.domElement.addEventListener('wheel', onMouseWheel, false); // Chrome, IE9, Safari, Opera

	renderer.domElement.addEventListener ('mousedown', function () {
		setMouse();
		mouseIsPressed = true;
		if (typeof mousePressed !== 'undefined') mousePressed();
	});

	renderer.domElement.addEventListener ('mousemove', function () { 
		pmouseX = mouseX;
		pmouseY = mouseY;
		setMouse();
		if (mouseIsPressed) {
			if (typeof mouseDragged !== 'undefined') mouseDragged(); 
		}
		if (typeof mouseMoved !== 'undefined') mouseMoved();
	});

	renderer.domElement.addEventListener ('mouseup', function () { 
		mouseIsPressed = false; 
		if (typeof mouseReleased !== 'undefined') mouseReleased(); 
	});

	renderer.domElement.addEventListener('dblclick', function () {
		setMouse();
		mouseIsPressed = false;
		if (typeof dblClick != 'undefined') dblClick();
	});
}

function onWindowResize() {
	windowHalfX = window.innerWidth / 2;
	windowHalfY = window.innerHeight / 2;
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
}

function onMouseWheel(){
	var e = window.event || e;
	var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
	obj.translateZ(delta*10); // Adjust zoom sensibility here
	return false;
}

function animate() {
	requestAnimationFrame( animate );
	render();
}

function render() {
	camera.position.x += ( cMouseX - camera.position.x ) * .05;
	camera.position.y += ( - cMouseY - camera.position.y ) * .05;
	camera.lookAt( scene.position );
	renderer.render( scene, camera );
}
