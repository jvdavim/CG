// Global variables
var knife;
var camera, scene, renderer;
var mouseIsPressed, mouseX, mouseY, pMouseX, pmouseY;
var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;
var slider, sliderOutput, circles;
var keyFrame = [];
var play;
var playing = false;
var animation;


// Function call
init();
animate();


// Functions
function init()
{

	// Scene
	scene = new THREE.Scene();
	var ambientLight = new THREE.AmbientLight(0xcccccc, 0.4);
	scene.add(ambientLight);


	// Perspective camera for 3D drawing
	camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 2000);
	camera.lookAt(new THREE.Vector3(0, 0, 0));
	var pointLight = new THREE.PointLight(0xffffff, 0.8);
	camera.add(pointLight);


	// Renderer will use a canvas taking the whole window
	renderer = new THREE.WebGLRenderer({antialias: true});
	renderer.sortObjects = false;
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);


	// Append camera to the page
	document.body.appendChild(renderer.domElement);
	scene.add(camera);


	// Set resize (reshape) callback
	window.addEventListener('resize', onWindowResize, false);


	// Texture
	var manager = new THREE.LoadingManager();
	var textureLoader = new THREE.TextureLoader(manager);
	var texture = textureLoader.load('textures/UV_Grid_Sm.jpg');


	// Model
	var loader = new THREE.OBJLoader(manager);
	loader.load('obj/knife/knife.obj', function (object)
	{
		object.traverse(function (child)
		{
			if (child instanceof THREE.Mesh)
			{
				child.material.map = texture;
			}
		});
		object.rotateX(1.5708);
		object.position.z = -30;
		knife = object;
		scene.add(object);
	 });


	// Mouse Event Listener
	mouseIsPressed = false;
	mouseX = 0;
	mouseY = 0;
	pmouseX = 0;
	pmouseY = 0;

	var setMouse = function ()
	{
		mouseX = event.clientX;
		mouseY = event.clientY;
	}

	renderer.domElement.addEventListener('wheel', mouseWheel, false); // Don't work on Firefox

	renderer.domElement.addEventListener ('mousedown', function ()
	{
		setMouse();
		mouseIsPressed = true;
		if (typeof mousePressed !== 'undefined') mousePressed();
	});

	renderer.domElement.addEventListener ('mousemove', function ()
	{ 
		pmouseX = mouseX;
		pmouseY = mouseY;
		setMouse();
		if (mouseIsPressed)
		{
			if (typeof mouseDragged !== 'undefined') mouseDragged(); 
		}
		if (typeof mouseMoved !== 'undefined') mouseMoved();
	});

	renderer.domElement.addEventListener ('mouseup', function ()
	{ 
		mouseIsPressed = false; 
		if (typeof mouseReleased !== 'undefined') mouseReleased(); 
	});


	//Play Button
	play = document.getElementById("play");


	//Frame Circles
	circles = document.getElementById("circlescontainer");
	for (i=0; i<100; i++)
	{
		var span = document.createElement('span');
		span.className = "dot";
		span.addEventListener('click', onKeyFrame, false);
		span.id = i;
		circles.appendChild(span);
	}

	//Key Frames
	for (i=0; i<100; i++)
	{
		keyFrame.push(0);
	}
}

// 
// Reshape callback
//
function onWindowResize()
{
	camera.right = window.innerWidth;
	camera.bottom = window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth,window.innerHeight);
	render();
}

function distance(a, b)
{
	return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2) + Math.pow(a.z - b.z, 2));
}

function animate()
{
	requestAnimationFrame(animate);
	render();
}

function render()
{
	renderer.render(scene, camera);
}

function toScreenPosition(obj, camera)
{
    var vector = new THREE.Vector3();

    var widthHalf = 0.5*renderer.context.canvas.width;
    var heightHalf = 0.5*renderer.context.canvas.height;

    obj.updateMatrixWorld();
    vector.setFromMatrixPosition(obj.matrixWorld);
    vector.project(camera);

    vector.x = ( vector.x * widthHalf );
    vector.y = - ( vector.y * heightHalf );
    vector.z = 0;

    return vector;
}

function translate() 
{
	var delta = new THREE.Vector3();
	var mouse = new THREE.Vector3(mouseX, mouseY, 0);
	var pmouse = new THREE.Vector3(pmouseX, pmouseY, 0);

	delta.subVectors(mouse, pmouse);

	knife.position.x += delta.x;
	knife.position.y += -delta.y;
}

function getArcBallVec(x, y, object)
{
	var mouse = new THREE.Vector3(x - windowHalfX, y - windowHalfY, 0);
	var obj = toScreenPosition(object, camera);
	var p = new THREE.Vector3();

	p.subVectors(mouse, obj);
	p.y = -p.y;

	var OPSquared = p.x * p.x + p.y * p.y;

	if (OPSquared <= 200*200)
	{
		p.z = Math.sqrt(200*200 - OPSquared);  // Pythagore
	}

	else
	{
		p.normalize();  // nearest point
	} 

	return p;
}

function rotate(object)
{
	var vec1 = getArcBallVec(pmouseX, pmouseY, knife);
	var vec2 = getArcBallVec(mouseX, mouseY, knife);
	var angle = vec1.angleTo(vec2);
	var vec3 = new THREE.Vector3();
	var quaternion = new THREE.Quaternion();

	vec3.crossVectors(vec1, vec2);
	vec3.normalize();

	quaternion.setFromAxisAngle(vec3, angle);
	object.applyQuaternion(quaternion);
}


// Mouse functions
function mouseDragged()
{
	if (document.getElementById("translate").checked)
	{
		translate();
	}

	else
	{
		rotate(knife);
	}
}

function mouseWheel()
{
	var e = window.event || e;
	var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));

	knife.position.z += delta*1 ; // Adjust zoom sensibility here
	
	return false;
}


function onKeyFrame(event)
{
	var circle = event.srcElement.id;
	var color = document.getElementById(circle).style.backgroundColor;
	if (color != 'green')
	{
		document.getElementById(circle).style.backgroundColor = 'green';
		var q = new THREE.Quaternion(knife.quaternion.x, knife.quaternion.y, knife.quaternion.z, knife.quaternion.w);
		var p = new THREE.Vector3(knife.position.x, knife.position.y, knife.position.z);
		keyFrame[circle] = [q, p];
	}
	else
	{
		document.getElementById(circle).style.backgroundColor = '#bbb';
		keyFrame[circle] = 0;
	}
}

function onPlay()
{
	if (!playing) 
	{ 
		playing = true;
		var pkeyFrame, nkeyFrame, pIndex, nIndex;
		var t = 0;
		var alpha;
		animation = setInterval(function ()
		{
			t += 1;

			if (t >= 99)
			{
				t = 0;
			}

			for (i=99; i<=0; i--) //caso nao tenha key frame anterior, o anterior é o último
			{
				if (keyFrame[i] != 0)
				{
					pkeyFrame = keyFrame[i];
					pIndex = i;
					break;
				}
			}

			for (i=0; i<t; i++) //achar keyframe anterior
			{
				if (keyFrame[i] != 0)
				{
					pkeyFrame = keyFrame[i];
					pIndex = i;
				}
				
			}	

			for (i=t; i<100; i++) //achar próximo keyframe
			{
				if (keyFrame[i] != 0)
				{
					nkeyFrame = keyFrame[i];
					nIndex = i;
					break;
				}
			}

			if (nkeyFrame === undefined) //caso nao tenha próximo keyframe, o próximo é o primeiro
			{
				for (i=0; i<100; i++)
				{
					if (keyFrame[i] != 0)
					{
						nkeyFrame = keyFrame[i];
						nIndex = i;
						break;
					}
				}
			}

			if (pIndex<t && t<nIndex)
			{
				alpha = (t-pIndex) / (nIndex-pIndex);
			}
			if (pIndex<t && nIndex<t)
			{
				alpha = (t-nIndex) / (99-nIndex+pIndex);
			}
			if (pIndex>t && nIndex>t)
			{
				alpha = (99-nIndex+t) / (pIndex-t);
			}
			knife.position.lerpVectors(pkeyFrame[1], nkeyFrame[1], alpha);
			THREE.Quaternion.slerp(pkeyFrame[0], nkeyFrame[0], knife.quaternion, alpha);
		}, 20)

	
	}
	else
	{
		playing = false;
		clearInterval(animation);
	}
}