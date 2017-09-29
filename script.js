var pointSize = 3; // Change according to the size of the point.
var vertices = [];
var xzPlane;
function vec4(x, y, z, w) {
	this.x = x;
	this.y = y;
	this.z = z;
	this.w = w === undefined ? 1 : w;
	this.getMat4 = function() {
		return[
			[this.x, 0, 0, 0],
			[0, this.y, 0, 0],
			[0, 0, this.z, 0],
			[0, 0, 0, this.w]
		]	
	}
	this.translate = function(x, y, z) {
		this.x += x;
		this.y += y;
		this.z += z;
	}
}
function matmult(a, b) {
	var resultingArray = new Array();
	for (var i = 0; i < 4; i++) {
		resultingArray[i] = new Array();
        for (var j = 0; j < 4; j++) {
            resultingArray[i][j] = 0;
            for (var k = 0; k < 4; k++) {
                resultingArray[i][j] += a[i][k] * b[k][j];
            }
        }
    }
    return resultingArray;
}
function tick() {
	requestAnimFrame(tick);
	var divVertices = document.getElementById("divVertices");
	drawScene();
}
function drawScene() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	drawAxis();
	for (var i = 0; i < vertices.length; ++i) {
		drawCoordinates(vertices[i]);
	}
	ctx.font = "30px Arial";
	var rect = canvas.getBoundingClientRect();
    var x = rect.left; // x == the location of the click in the document - the location (relative to the left) of the canvas in the document
    var y = rect.top; // y == the location of the click in the document - the location (relative to the top) of the canvas in the document
	//ctx.fillText("(" + x + ", " + y + ")" ,canvas.width - 100, canvas.height - 10);
}
function startCanvas() {
	canvas = document.getElementById("myCanvas");
	xzPlane = [new vec4(canvas.width / 4, 0, canvas.height / 4), new vec4(canvas.width * 3.0 / 4.0, 0, canvas.height  * 3.0 / 4.0)]; 
	for (var i = 0; i < xzPlane.length; ++i)
		xzPlane[i] = isometric2D(xzPlane[i]);
	canvas.addEventListener("mousedown", getPosition, false);
	ctx = canvas.getContext("2d");
	canvasWidth = canvas.width;
	canvasHeight = canvas.height;
	canvasData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
	tick();
}
function addPoint(x, y, z, norm) {
	var vertice = new vec4(x, y, z);
	if (norm == true)
		normalize(vertice);
	var verticeStatus = validateVertice(vertice);
	if (verticeStatus == 1) {
		vertices.push(vertice);
		drawCoordinates(vertice);
		divVertices.innerHTML += "( " + vertice.x + ", " + vertice.y + ", " + vertice.z + ")" + "<input type=\"button\" value=\"Delete\" onclick=\"deletePoint(" + (vertices.length - 1) + ")\"/><br>";
	} else {
		if (verticeStatus == 0) {
			alert("This vertice already exists!");
		} else {
			alert("Invalid input!");	
		}
	}
}
function deletePoint(index) {
	vertices.splice(index, 1);
	divVertices.innerHTML = "";
	for (var i = 0; i < vertices.length; ++i) {
		divVertices.innerHTML += "( " + vertices[i].x + ", " + vertices[i].y + ", " + vertices[i].z + ")" + "<input type=\"button\" value=\"Delete\" onclick=\"deletePoint(" + i + ")\"/><br>";
	}
}
function deleteAllVertices() {
	vertices = [];
	divVertices.innerHTML = "";

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
    var z = 0;
	addPoint(x, y, z, true);
}
function drawCoordinates(vertice){    
    ctx.fillStyle = "#000000"; 
    ctx.beginPath(); //Start path
    ctx.arc(vertice.x + canvas.width / 2 ,  canvas.height / 2 - vertice.y, pointSize, 0, Math.PI * 2, true); // Draw a point using the arc function of the canvas with a point structure.
    ctx.fill(); // Close the path and fill.
}
function normalize(worldCoordenate) {
	worldCoordenate.x = worldCoordenate.x - canvas.width / 2;
	worldCoordenate.y = canvas.height / 2 - worldCoordenate.y;
}
function drawLine(a, b, dash, color) {
	ctx.beginPath();
	ctx.strokeStyle = color;
	ctx.setLineDash(dash);
	ctx.moveTo(a[0], a[1]);
	ctx.lineTo(b[0], b[1]);
	ctx.stroke();
	ctx.closePath();
}
function drawAxis() {
	ctx.fillStyle = "#d3d3d3";
	ctx.beginPath();
	ctx.moveTo(xzPlane[0][0], xzPlane[0][1]);
	ctx.lineTo(xzPlane[1][0], xzPlane[0][1]);
	ctx.lineTo(xzPlane[1][0], xzPlane[1][1]);
	ctx.lineTo(xzPlane[0][0], xzPlane[1][1]);
	ctx.closePath();
	ctx.fill();
	drawLine([0 , canvas.height / 2], [canvas.width, canvas.height / 2], [5, 3], "#0000ff");
	drawLine([canvas.width / 2 , 0], [canvas.width / 2, canvas.height], [5, 3], "#00ff00");
	drawLine([0 , canvas.height], [canvas.width, 0], [5, 3], "#ff0000");	
	
}
function toRadians (angle) {
	return angle * (Math.PI / 180);
}
function isometric2D(vertice) {
	var angle = 0;
	var xDelta = Math.cos(toRadians(angle));
	var yDelta = Math.sin(toRadians(angle));
	var zDelta = 0.5;
	return [vertice.x * xDelta + vertice.y * yDelta, vertice.x * xDelta + vertice.y * zDelta, 0.0];
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