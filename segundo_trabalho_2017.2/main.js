//
// Global variables
//
var scene, width, height, camera, renderer;
var mouseIsPressed, mouseX, mouseY, pmouseX, pmouseY;

//
// Initialization of global objects and set up callbacks for mouse and resize
//
function init() {

	// Scene object
	scene = new THREE.Scene();

	// Will use the whole window for the webgl canvas
	width = window.innerWidth - 4;
	height = window.innerHeight - 4;

	// Orthogonal camera for 2D drawing
	camera = new THREE.OrthographicCamera(0, width, 0, height, -height, height);
	camera.lookAt (new THREE.Vector3(0, 0, 0));

	// Renderer will use a canvas taking the whole window
	renderer = new THREE.WebGLRenderer({antialias: true});
	renderer.sortObjects = false;
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(width, height);

	// Append camera to the page
	document.body.appendChild(renderer.domElement);

	// Set resize (reshape) callback
	window.addEventListener('resize', resize);

	// Set up mouse callbacks. 
	// Call mousePressed, mouseDragged and mouseReleased functions if defined.
	// Arrange for global mouse variables to be set before calling user callbacks.
	mouseIsPressed = false;
	mouseX = 0;
	mouseY = 0;
	pmouseX = 0;
	pmouseY = 0;
	var setMouse = function () {
		mouseX = event.clientX;
		mouseY = event.clientY;
	}
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

	// If a setup function is defined, call it
	if (typeof setup !== 'undefined') setup();

	// First render
	render();
}

// 
// Reshape callback
//
function resize() {
	width = window.innerWidth - 4;
	height = window.innerHeight - 4;
	camera.right = width;
	camera.bottom = height;
	camera.updateProjectionMatrix();
	renderer.setSize(width,height);
	render();
}

//
// The render callback
//
function render () {
	requestAnimationFrame(render);
	renderer.render(scene, camera);
};

//------------------------------------------------------------
//
// User code from here on 
//
//------------------------------------------------------------