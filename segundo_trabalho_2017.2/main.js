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

//
// Global variables
//
var L = 20; // Set the distance to close the polygon
var meshArray = []; // Array of polygons
var lineMaterial, meshMaterial; // Materials and settings to create mesh and lines
var selected; // Object that was picked
var drawing = false; // True if the polygon is opened
var currentMouse, oldMouse; // Mouse coordinates
var line, shape, geometry, oldgeometry, newgeometry, extrudeGeometry;
var intersect; // Array with intersected polygons

//
// My functions
//
function distance(a, b) { 
	// Returns the distance between currentMouses a and b
	return Math.sqrt((a.x-b.x)**2 + (a.y-b.y)**2);
}


function mousePick() {
	// Returns the array of the meshes picked by mouse
	var checkSum = 0;
	var intersect = [];
	var currentMouse = new THREE.Vector3(mouseX, mouseY, 0);

	for (i = 0; i < meshArray.length; i++) {
		var polygon = meshArray[i];
		var vertices = polygon.geometry.vertices;

		for (j = 0; j < vertices.length; j++){
			var vec1 = new THREE.Vector3();
			var vec2 = new THREE.Vector3();

			vec1.copy(vertices[j]);
			if (j == vertices.length -1){ vec2.copy(vertices[0]); }
			else{ vec2.copy(vertices[j+1]); }

			vec1.applyMatrix4(polygon.matrixWorld); 
			vec2.applyMatrix4(polygon.matrixWorld); 

			vec1.sub(currentMouse);
			vec2.sub(currentMouse);

			var orientation = new THREE.Vector3().crossVectors(vec1, vec2);
			var aux = Math.sign(-orientation.z);

			checkSum += vec1.angleTo(vec2)*aux;
		}

		if ((checkSum > 6.1) && (checkSum < 6,3)){
			intersect.push(meshArray[i]);
		}

		checkSum = 0;
	}

	return intersect;
}


function addNail() {
	// Add a nail to the scene
	var geometry = new THREE.CircleGeometry(5, 32);
	var material = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
	var nail = new THREE.Mesh(geometry, material);
	
	if (intersect[intersect.length-2] != undefined){
		var pPolygon = intersect[intersect.length-2];
	}
	
	else {
		var pPolygon = scene;		
	}
	
	var cPolygon = intersect[intersect.length-1];
	var m = new THREE.Matrix4();
	m.getInverse(pPolygon.matrixWorld);
	nail.applyMatrix(m);

	pPolygon.add(nail);  // Set the back polygon as the parent of the nail
	nail.add(cPolygon); // Set the front polygon as the nail's child
	nail.translateX(mouseX);
	nail.translateY(mouseY);
	nail.translateZ(1);
	nail.updateMatrixWorld();
	cPolygon.applyMatrix(new THREE.Matrix4().getInverse(nail.matrixWorld));	
}


function removeNail() {
	// Remove the nail of the picked polygon
	var cPolygon = intersect[intersect.length-1];
	var nail = cPolygon.parent;
	var pPolygon = nail.parent;

	nail.remove(cPolygon);
	scene.add(cPolygon);
	pPolygon.remove(nail);

	cPolygon.applyMatrix(nail.matrixWorld);
}


function translateMesh(mesh) {
	// Translate a mesh according to the mouse position
	currentMouse = new THREE.Vector3 (mouseX, mouseY, 0);
	oldMouse = new THREE.Vector3 (pmouseX, pmouseY, 0);
	var translate = new THREE.Vector3();
	
	translate.subVectors(currentMouse, oldMouse);
	
	var m = new THREE.Matrix4();
	m.set(	1, 0, 0, translate.x,
			0, 1, 0, translate.y,
			0, 0, 1, 0,
			0, 0, 0, 1	);
	
	mesh.applyMatrix(m);
}


function rotateMesh(mesh) { 
	// Rotate the mesh around the nail
	var nailPos = new THREE.Vector3().setFromMatrixPosition(mesh.parent.matrixWorld);

	var vi = new THREE.Vector3(pmouseX - nailPos.x, pmouseY - nailPos.y , 0);
	var vf = new THREE.Vector3(mouseX - nailPos.x , mouseY - nailPos.y , 0);

	var aux = new THREE.Vector3().crossVectors(vf, vi); // Correct signal of angleTo
	aux = Math.sign(aux.z);

	var angle = vi.angleTo(vf)*aux;

	var rotate = new THREE.Matrix4().set(
		Math.cos(angle), Math.sin(angle), 0, 0,
		-Math.sin(angle), Math.cos(angle), 0, 0,
		0, 0, 1, 0,
		0, 0, 0, 1
		);

	mesh.applyMatrix(rotate);
}


//
// Setup
//
function setup () {
	lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, depthWrite: false });
}


//
// Mouse functions
//
function mousePressed() {
	intersect = mousePick();

	if (intersect.length > 0) { // If picking a mesh
		oldMouse = new THREE.Vector3(pmouseX, pmouseY, 0);
	}
	
	else { // If not picking a mesh
		
		if (!drawing) { // If mouse was pressed and is the first vertex of a polygon
			currentMouse = new THREE.Vector3 (mouseX, mouseY, 0);
			geometry = new THREE.Geometry();
			geometry.vertices.push (currentMouse);
			geometry.vertices.push (currentMouse);
			line = new THREE.Line (geometry, lineMaterial);
			scene.add (line);
			drawing = true;
		}
		
		else { // If mouse was pressed and is not the first vertex of the polygon
			currentMouse = new THREE.Vector3 (mouseX, mouseY, 0);
			oldgeometry = line.geometry;
			newgeometry = new THREE.Geometry();
			newgeometry.vertices = oldgeometry.vertices;
			
			if ((distance(currentMouse, oldgeometry.vertices[0]) < L) && (distance(newgeometry.vertices[newgeometry.vertices.length-2], currentMouse) > L)) { // If close the polygon
				drawing = false;
				newgeometry.vertices[newgeometry.vertices.length-1] = newgeometry.vertices[0];
				shape = new THREE.Shape(newgeometry.vertices);
				var geometry = new THREE.ShapeGeometry(shape);
				meshMaterial = new THREE.MeshBasicMaterial({ color: Math.random() * 0xffffff, side: THREE.DoubleSide });
				var mesh = new THREE.Mesh(geometry, meshMaterial);
				meshArray.push(mesh);
				scene.add(mesh);
				scene.remove (line);
			}
			
			else { // If mouse was pressed and is not the first vertex neither the last one of the polygon
				newgeometry.vertices.push(currentMouse);
			}
			
			line.geometry = newgeometry;
		}
	}
}


function mouseMoved(){
	if (drawing) {
		currentMouse = new THREE.Vector3 (mouseX, mouseY, 0);
		var oldgeometry = line.geometry;
		var newgeometry = new THREE.Geometry();
		newgeometry.vertices = oldgeometry.vertices;
		newgeometry.vertices[newgeometry.vertices.length-1] = currentMouse; // Updates the second line currentMouse to the mouse coordinates
		line.geometry = newgeometry;
	}
}


function mouseDragged() {
	if (intersect.length > 0) {
		if (intersect[intersect.length-1].parent.isMesh) { // If picked polygon has a nail as parent
			rotateMesh(intersect[intersect.length-1]); // Then rotate the picked polygon
		}
		else { // If picked polygon doesn't have a nail as parent
			translateMesh(intersect[intersect.length-1]); // Then rotate the picked polygon
		}
	}
}


function dblClick() {
	intersect = mousePick();
	if (intersect.length >= 1) {
		if (intersect[intersect.length-1].parent != scene) {
			console.log("Nail removed");
			removeNail();
		}
		else if (!intersect[intersect.length-1].parent.isMesh) {
			console.log("Nail added");
			addNail();
		}
	}
}


init();