//VARIABLES//
var lines = [];  //My array of lines
var selection = {index: null, side: 'start'};
//var line1 = {x0:10,y0:10,x1:100,y1:100}
//var line2 = {x0:20,y0:10,x1:200,y1:100}


//SETUP SETTINGS//
function setup() {
	createCanvas(1300,630);  //Create a workspace
	background(200);  //Color the backgroud
}

function draw() {
	background(200);  //Color the background each refresh
	for (i=0; i<lines.length; i++){  //Draw the lines stored in the array lines[]
		line(lines[i].x0,lines[i].y0,lines[i].x1,lines[i].y1);
	}
	markIntesection();
	// line(line1.x0,line1.y0,line1.x1,line1.y1);
	// line(line2.x0,line2.y0,line2.x1,line2.y1);
}


//MOUSE INTERACT//
function distance(a,b) {
	//Recive 2 dicts with keys x and y and return the distance between the points//
	return Math.sqrt((a.x-b.x)**2 + (a.y-b.y)**2);
}

function mousePressed() {
	for (i=0; i<lines.length; i++) {
		if (distance({x:mouseX,y:mouseY}, {x:lines[i].x0,y:lines[i].y0}) < 5) {  //If disance < 5 drag the line
			selection.index = i;
			selection.side = 'start';
		}
		else if(distance({x:mouseX,y:mouseY}, {x:lines[i].x1,y:lines[i].y1})<5) {  //If disance < 5 drag the line
			selection.index = i;
			selection.side = 'end';
		}
	}

	if (selection.index === null) {
		lines.push({x0:mouseX, y0:mouseY, x1:mouseX, y1:mouseY});  //Add a new line to the array of lines
		selection.index = lines.length - 1;
		selection.side = 'end';
	}
}

function mouseDragged() {
	if(selection.index !== null) {
		if(selection.side === 'start') {
			lines[selection.index].x0 = mouseX;  //Modify the first mouse position in the selected line
			lines[selection.index].y0 = mouseY;
		}
		else if(selection.side === 'end') {
			lines[selection.index].x1 = mouseX;  //Modify the last mouse position in the selected line
			lines[selection.index].y1 = mouseY;
		}
	}
}

function mouseReleased() {
	selection.index = null;  //Reset lines index after release the mouse
}

//INTERSECT//
function onSegment(p, q, r) {
	//Recive 3 dicts with keys x and y and return true if the 3 points are colinear//
	if (q.x <= Math.max(p.x, r.x) && q.x >= Math.min(p.x, r.x) && q.y <= Math.max(p.y, r.y) && q.y >= Math.min(p.y, r.y)) {
	   return true;
	}
	return false;
}

function orientation(p1, p2, p3){
	//Recive 3 dicts with keys x and y and return 0 if they are colinear, 1 if clock wise and 2 if counterclock wise//
	var val = (p2.y - p1.y) * (p3.x - p2.x) - (p2.x - p1.x) * (p3.y - p2.y);
 
	if (val == 0){
		return 0;  // colinear	
	}
	else if (val > 0){
		return 1;  // clock wise
	}
	else{
		return 2;  // counterclock wise
	}
}

function doIntersect(p1, q1, p2, q2) {
	//Recive 4 dicts with keys x and y and return true if the lines (p1,q1) and (p2,q2) else return false//
	// Find the four orientations needed for general and special cases
	var o1 = orientation(p1, q1, p2);
	var o2 = orientation(p1, q1, q2);
	var o3 = orientation(p2, q2, p1);
	var o4 = orientation(p2, q2, q1);
 
	// General case
	if (o1 != o2 && o3 != o4) return true;
 
	// Special Cases
	// p1, q1 and p2 are colinear and p2 lies on segment p1q1
	if (o1 == 0 && onSegment(p1, p2, q1)) return true;

	// p1, q1 and p2 are colinear and q2 lies on segment p1q1
	if (o2 == 0 && onSegment(p1, q2, q1)) return true;
 
	// p2, q2 and p1 are colinear and p1 lies on segment p2q2
	if (o3 == 0 && onSegment(p2, p1, q2)) return true;
 
	 // p2, q2 and q1 are colinear and q1 lies on segment p2q2
	if (o4 == 0 && onSegment(p2, q1, q2)) return true;
 
	return false; // Doesn't fall in any of the above cases
}

function markIntesection() {
	for (i=0; i<lines.length; i++) {
		for (j=i+1; j<lines.length; j++) {
			var x1 = lines[i].x0;
			var x2 = lines[i].x1;
			var x3 = lines[j].x0;
			var x4 = lines[j].x1;
			var y1 = lines[i].y0;
			var y2 = lines[i].y1;
			var y3 = lines[j].y0;
			var y4 = lines[j].y1;
			if ( doIntersect({x:x1,y:y1},{x:x2,y:y2},{x:x3,y:y3},{x:x4,y:y4}) ) {
				var x = ((x1*y2 - y1*x2)*(x3 - x4) - (x1 - x2)*(x3*y4 - y3*x4))/((x1 - x2)*(y3 - y4) - (y1 - y2)*(x3 - x4));
				var y = ((x1*y2 - y1*x2)*(y3 - y4) - (y1 - y2)*(x3*y4 - y3*x4))/((x1 - x2)*(y3 - y4) - (y1 - y2)*(x3 - x4));
				ellipse(x,y,7,7);
			}
		}
	}
}