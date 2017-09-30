var pointSize = 3; // Change according to the size of the point.
var vertices = [];
var edges = [];
var xAxis = [];
var yAxis = [];
var zAxis = [];
var isoMatrix = [
	[0.7071, 0, 0.7071, 0], 
	[0.4082, 0.8166, -0.4082, 0], 
	[0, 0, 0, 0],
	[0, 0, 0, 1]
];
var xzPlane;
function vec4(x, y, z, w) {
	this.x = x;
	this.y = y;
	this.z = z;
	this.w = w === undefined ? 1 : w;
	this.getMat4 = function() {
		return[
			[this.x],
			[this.y],
			[this.z],
			[this.w]
		]	
	}
	this.translate = function(x, y, z) {
		this.x += x;
		this.y += y;
		this.z += z;
		return this
	}
	this.copyArray = function(array) {
		this.x = array[0][0];
		this.y = array[1][0];
		this.z = array[2][0];
		this.w = array[3][0] === undefined ? 1 : array[3][0];
		return this;
	}
	this.scale = function(vec) {
		this.x *= vec.x;
		this.y *= vec.y;
		this.z *= vec.z;
		return this;
	}
}
function matmult(a, b) {
	var resultingArray = new Array();
	for (var i = 0; i < a.length; i++) {
		resultingArray[i] = new Array();
        for (var j = 0; j < b[i].length; j++) {
            resultingArray[i][j] = 0;
            for (var k = 0; k < a[i].length; k++) {
                resultingArray[i][j] += a[i][k] * b[k][j];
            }
        }
    }
    return resultingArray;
}
function tick() {
	requestAnimFrame(tick);
	drawScene();
}
function drawScene() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	drawPlane();
	drawAxis();	
	for (var i = 0; i < edges.length; ++i) {
		drawEdge(edges[i]);
	}
	for (var i = 0; i < vertices.length; ++i) {
		drawCoordinates(isometric2D(vertices[i]), i);
	}
	ctx.font = "30px Arial";
	var rect = canvas.getBoundingClientRect();
    var x = rect.left; // x == the location of the click in the document - the location (relative to the left) of the canvas in the document
    var y = rect.top; // y == the location of the click in the document - the location (relative to the top) of the canvas in the document
	//ctx.fillText("(" + x + ", " + y + ")" ,canvas.width - 100, canvas.height - 10);
}
function startCanvas() {
	canvas = document.getElementById("myCanvas");
	var planeScale = new vec4(200, 200, 200);
	var divVertices = document.getElementById("divVertices");
	xzPlane = [
		normalize(isometric2D((new vec4(-1, 0, -1)).scale(planeScale))),
		normalize(isometric2D((new vec4(1, 0, -1)).scale(planeScale))),
		normalize(isometric2D((new vec4(1, 0, 1)).scale(planeScale))),
		normalize(isometric2D((new vec4(-1, 0, 1)).scale(planeScale))),
	];
	var vert = [new vec4(0, 100, 0), new vec4(0, 0, 0), new vec4(100, 0, 0), new vec4(100, 0, 100), new vec4(0, 0, 100), new vec4(0, 100, 100), new vec4(100, 100, 100), new vec4(100, 100, 0)];
	var ed = [[ 0, 7], [ 1, 4], [ 6, 7], [ 3, 4], [ 0, 5], [ 6, 5], [ 4, 5], [ 0, 1], [ 6, 3], [1, 2], [3, 2], [7, 2]];
	for (var i = 0; i < vert.length; ++i) {
		addVertice(vert[i]);
	}
	for (var i = 0; i < ed.length; ++i) {
		addEdge(ed[i][0], ed[i][1]);
	}
	xAxis = [
		normalize(isometric2D(new vec4(-canvas.width / 2, 0, 0))),
		normalize(isometric2D(new vec4(canvas.width / 2, 0, 0)))		
	];
	yAxis = [
		normalize(isometric2D(new vec4(0, -canvas.width / 2, 0))),
		normalize(isometric2D(new vec4(0, canvas.width / 2, 0)))
	];
	zAxis = [
		normalize(isometric2D(new vec4(0, 0, -canvas.width / 2))),
		normalize(isometric2D(new vec4(0, 0, canvas.width / 2)))
	];
	canvas.addEventListener("mousedown", getPosition, false);
	ctx = canvas.getContext("2d");
	canvasWidth = canvas.width;
	canvasHeight = canvas.height;
	canvasData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
	tick();
}
function addVertice(vec4, norm) {
	var vertice = vec4;
	if (norm == true)
		vertice = worldCoordinates(vertice);
	var verticeStatus = validateVertice(vertice);
	if (verticeStatus == 1) {
		vertices.push(vertice);
		divVertices.innerHTML += (vertices.length - 1) + ": ( " + vertice.x + ", " + vertice.y + ", " + vertice.z + ")" + "<input type=\"button\" value=\"Delete\" onclick=\"deletePoint(" + (vertices.length - 1) + ")\"/><br>";
	} else {
		if (verticeStatus == 0) {
			alert("This vertice already exists!");
		} else {
			alert("Invalid input!");	
		}
	}
	document.getElementById("x").select();
}
function validadeEdges(edge) {
	if (isNaN(edge[0]) || isNaN(edge[1]) || edge[0] == edge[1] || vertices[edge[0]] == undefined ||  vertices[edge[1]] == undefined) {
		return -1;
	}
	for (var i = 0; i < edges.length; i++) {
		if (edges[i][0] == edge[0] && edges[i][1] == edge[1] || edges[i][1] == edge[0] && edges[i][0] == edge[1]){
			return 0;
		}
	}
	return 1;
}
function addEdge(vA, vB) {
	var edge = [vA, vB];
	var edgeStatus = validadeEdges(edge);
	if (edgeStatus == 1) {
		edges.push(edge);		
		divEdges.innerHTML += (edges.length - 1) + ": (" + edge[0] + ", " + edge[1] + ")" + "<input type=\"button\" value=\"Delete\" onclick=\"deleteEdge(" + (edges.length - 1) + ")\"/><br>";
	} else {
		if (edgeStatus == 0) {
			alert("This edge already exists!");
		} else {
			alert("Invalid input!");	
		}
	}
	document.getElementById("vA").select();
}
function deleteEdge(index) {
	edges.splice(index, 1);
	divEdges.innerHTML = "";
	for (var i = 0; i < edges.length; ++i) {
		divEdges.innerHTML += (i) + ": (" + edges[i][0] + ", " + edges[i][1] + ")" + "<input type=\"button\" value=\"Delete\" onclick=\"deleteEdge(" + (edges.length - 1) + ")\"/><br>";
	}
}
function deleteAllEdges() {
	edges = [];
	divEdges.innerHTML = "";
}
function deletePoint(index) {
	vertices.splice(index, 1);
	divVertices.innerHTML = "";
	for (var i = 0; i < vertices.length; ++i) {
		divVertices.innerHTML += i + ": ( " + vertices[i].x + ", " + vertices[i].y + ", " + vertices[i].z + ")" + "<input type=\"button\" value=\"Delete\" onclick=\"deletePoint(" + i + ")\"/><br>";
	}
}
function deleteAllVertices() {
	vertices = [];
	divVertices.innerHTML = "";
	deleteAllEdges();
}
function validateVertice(vertice) {
	if (isNaN(vertice.x) || isNaN(vertice.y) || isNaN(vertice.z)) {
		return -1;
	}
	for (var i = 0; i < vertices.length; i++) {
		if (Math.abs(vertice.x - vertices[i].x) <= 3 && Math.abs(vertice.y - vertices[i].y) <= 3 && Math.abs(vertice.z - vertices[i].z) <= 3 ){
			return 0;
		}
	}
	return 1;
}
function getPosition(event){
    var rect = canvas.getBoundingClientRect();
    var x = event.clientX - rect.left; // x == the location of the click in the document - the location (relative to the left) of the canvas in the document
    var y = event.clientY - rect.top; // y == the location of the click in the document - the location (relative to the top) of the canvas in the document
    addVertice(new vec4(x, y, 0), true);
}
function drawCoordinates(vertice, i){    
    ctx.fillStyle = "#000000"; 
    ctx.beginPath(); 
	var pixelVertice = normalize(vertice);
    ctx.arc(pixelVertice.x, pixelVertice.y, pointSize, 0, Math.PI * 2, true); 
	ctx.font = "10px Arial";
	ctx.fillText(i, pixelVertice.x + 10, pixelVertice.y);
    ctx.fill(); 
	ctx.closePath(); 
}
function normalize(worldCoordinates) {
	return new vec4(worldCoordinates.x + canvas.width / 2,  canvas.height / 2 - worldCoordinates.y, pointSize, 0);
}
function worldCoordinates(vertice) {
	return new vec4(vertice.x - canvas.width / 2, canvas.height / 2 - vertice.y, 0);
}
function drawLine(a, b, dash, color) {
	ctx.beginPath();
	ctx.strokeStyle = color;
	ctx.setLineDash(dash);
	ctx.moveTo(a.x, a.y);
	ctx.lineTo(b.x, b.y);
	ctx.stroke();
	ctx.closePath();
}
function drawPlane() {
	ctx.fillStyle = "#d3d3d3";
	ctx.beginPath();
	ctx.moveTo(xzPlane[0].x, xzPlane[0].y);
	ctx.lineTo(xzPlane[1].x, xzPlane[1].y);
	ctx.lineTo(xzPlane[2].x, xzPlane[2].y);
	ctx.lineTo(xzPlane[3].x, xzPlane[3].y);
	ctx.closePath();
	ctx.fill();
}
function drawEdge(edge) {
	var vertA = normalize(isometric2D(vertices[edge[0]]));
	var vertB = normalize(isometric2D(vertices[edge[1]]));
	drawLine(vertA, vertB, [], "#000000");
}
function drawAxis() {
	drawLine(xAxis[0], xAxis[1], [5, 3], "#0000ff");
	drawLine(yAxis[0], yAxis[1], [5, 3], "#00ff00");
	drawLine(zAxis[0], zAxis[1], [5, 3], "#ff0000");		
}
function toRadians (angle) {
	return angle * (Math.PI / 180);
}
function isometric2D(vertice) {
	return (new vec4()).copyArray(matmult(isoMatrix, vertice.getMat4()));
}
window.requestAnimFrame = (function() {
  return window.requestAnimationFrame ||
         window.webkitRequestAnimationFrame ||
         window.mozRequestAnimationFrame ||
         window.oRequestAnimationFrame ||
         window.msRequestAnimationFrame ||
         function(/* function FrameRequestCallback */ callback, /* DOMElement Element */ element) {
           window.setTimeout(callback, 1000/60);
         };
})();