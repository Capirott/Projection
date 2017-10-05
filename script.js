var pointSize = 3; // Change according to the size of the point.
var vertices = [];
var edges = [];
var xAxis = [];
var yAxis = [];
var zAxis = [];

var tranMatrix = (x, y, z) => {
	return [
		[1, 0, 0, x],
		[0, 1, 0, y],
		[0, 0, 1, z],
		[0, 0, 0, 1]
	]
};
var rotX = angle => {
		return 	[
						[1.0, 0, 0, 0],
						[0, Math.cos(toRadians(angle)), -Math.sin(toRadians(angle)), 0],
						[0, Math.sin(toRadians(angle)), Math.cos(toRadians(angle)), 0],
						[0, 0, 0, 1.0]
				];
};
var rotY = angle => {
		return 	[
						[Math.cos(toRadians(angle)), 0, Math.sin(toRadians(angle)), 0],
						[0, 1.0, 0, 0],
						[-Math.sin(toRadians(angle)), 0, Math.cos(toRadians(angle)), 0],
						[0, 0, 0, 1.0]
				];
};
var rotZ = angle => {
		return 	[
						[Math.cos(toRadians(angle)), -Math.sin(toRadians(angle)), 0, 0],
						[Math.sin(toRadians(angle)), Math.cos(toRadians(angle)), 0, 0],
						[0, 0, 1, 0],
						[0, 0, 0, 1]
				];
};
var ortProjXY = [
	[1, 0, 0, 0],
	[0, 1, 0, 0],
	[0, 0, 0, 0],
	[0, 0, 0, 1]
];
var ortProjXZ = [
	[1, 0, 0, 0],
	[0, 0, 0, 0],
	[0, 0, 1, 0],
	[0, 0, 0, 1]
];
var ortProjYZ = [
	[0, 0, 0, 0],
	[0, 1, 0, 0],
	[0, 0, 1, 0],
	[0, 0, 0, 1]
];
var perX = (dx, dy, dz, id) => {
		return 	[
						[id, 0, 0, Math.abs(dx)],
						[0, 1, 0, 0],
						[0, 0, 1, 0],
						[0, dy, dz, 1.0]
				];
};
var perY = (dx, dy, dz, id) => {
		return 	[
						[1.0, 0, 0, 0],
						[0, id, 0, Math.abs(dy)],
						[0, 0, 1, 0],
						[dx, 0, dz, 1.0]
				];
};
var perZ = (dx, dy, dz, id) => {
		return 	[
						[1.0, 0, 0, 0],
						[0, 1.0, 0, 0],
						[0, 0, id, Math.abs(dz)],
						[dx, dy, 0, 1.0]
				];
};
var isoMatrix = matmult(ortProjXY, matmult(rotX(35.26439),  rotY(45)));
var dimMatrix = matmult(ortProjXY, matmult(rotX(20.705),  rotY(22.208)));
var triMatrix = matmult(ortProjXY, matmult(rotX(45),  rotY(30)));
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
	this.getVec4 = function() {
		return[[this.x ,this.y, this.z , this.w]]
	}
	this.translate = function(vec) {
		return new vec4(this.x + vec.x, this.y + vec.y, this.z + vec.z);
	}
	this.copyArray = function(array) {
		this.x = array[0][0];
		this.y = array[1][0];
		this.z = array[2][0];
		this.w = array[3][0] === undefined ? 1 : array[3][0];
		return this;
	}
	this.copyVec = function(array) {
		this.x = array[0][0];
		this.y = array[0][1];
		this.z = array[0][2];
		this.w = array[0][3];
		return this;
	}
	this.scale = function(vec) {
		return new vec4(this.x * vec.x, this.y * vec.y, this.z * vec.z);
	}
	this.rotate = function(vec, vect) {
		var rotXX = rotX(vec.x);
		var rotYY = rotY(vec.y);
		var rotZZ = rotZ(vec.z);
		var rotRet = this.translate(new vec4(-vect.x, -vect.y, -vect.z));
		rotRet.copyArray(matmult(rotXX, rotRet.getMat4()));
		rotRet.copyArray(matmult(rotYY, rotRet.getMat4()));
		rotRet.copyArray(matmult(rotZZ, rotRet.getMat4()));
		return rotRet.translate(vect);
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
	update();
	drawScene();
}
function update() {
	if ($("rotate").checked) {
		var vecT = new vec4(parseFloat($("xT").value), parseFloat($("yT").value), parseFloat($("zT").value));
		if (!(isNaN(vecT.x) || isNaN(vecT.y) || isNaN(vecT.z))){
			var vecA = new vec4(parseFloat($("xA").value), parseFloat($("yA").value), parseFloat($("zA").value));
			if (!(isNaN(vecA.x) || isNaN(vecA.y) || isNaN(vecA.z))){
				for (var i = 0; i < vertices.length; ++i) {
					vertices[i] = vertices[i].rotate(vecT, vecA);
				}
			}
		}
	}
}
function drawScene() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	drawPlane();
	drawAxis();
	for (var i = 0; i < edges.length; ++i) {
		drawEdge(edges[i]);
	}
	for (var i = 0; i < vertices.length; ++i) {
		drawCoordinates(calcProjection(vertices[i]), i);
	}
	ctx.font = "30px Arial";
	var rect = canvas.getBoundingClientRect();
    var x = rect.left; // x == the location of the click in the document - the location (relative to the left) of the canvas in the document
    var y = rect.top; // y == the location of the click in the document - the location (relative to the top) of the canvas in the document
	//ctx.fillText("(" + x + ", " + y + ")" ,canvas.width - 100, canvas.height - 10);
}
function startCanvas() {
	canvas = $("myCanvas");
	var planeScale = new vec4(200, 200, 200);
	var divVertices = $("divVertices");
	xzPlane = [
		(new vec4(-1, 0, -1)).scale(planeScale),
		(new vec4(1, 0, -1)).scale(planeScale),
		(new vec4(1, 0, 1)).scale(planeScale),
		(new vec4(-1, 0, 1)).scale(planeScale),
	];
	var vert = [new vec4(0, 100, 0), new vec4(0, 0, 0), new vec4(100, 0, 0), new vec4(100, 0, 100), new vec4(0, 0, 100), new vec4(0, 100, 100), new vec4(100, 100, 100), new vec4(100, 100, 0)];
	var ed = [[ 0, 7], [ 1, 4], [ 6, 7], [ 3, 4], [ 0, 5], [ 6, 5], [ 4, 5], [ 0, 1], [ 6, 3], [1, 2], [3, 2], [7, 2]];
	for (var i = 0; i < vert.length; ++i) {
		addVertice(vert[i]);
	}
	for (var i = 0; i < ed.length; ++i) {
		addEdge(ed[i][0], ed[i][1]);
	}
	$("x").select();
	xAxis = [
		new vec4(-canvas.width / 2, 0, 0),
		new vec4(canvas.width / 2, 0, 0)
	];
	yAxis = [
		new vec4(0, -canvas.width / 2, 0),
		new vec4(0, canvas.width / 2, 0)
	];
	zAxis = [
		new vec4(0, 0, -canvas.width / 2),
		new vec4(0, 0, canvas.width / 2)
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
		divVertices.innerHTML += (vertices.length - 1) + ": (" + vertice.x + ", " + vertice.y + ", " + vertice.z + ")<br>";
	} else {
		if (verticeStatus == 0) {
			alert("This vertice already exists!");
		} else {
			alert("Invalid input!");
		}
	}
	$("x").select();
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
		divEdges.innerHTML += (edges.length - 1) + ": (" + edge[0] + ", " + edge[1] + ")<br>";
	} else {
		if (edgeStatus == 0) {
			alert("This edge already exists!");
		} else {
			alert("Invalid input!");
		}
	}
	$("vA").select();
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
function execOp(op) {
	var vecT = new vec4(parseFloat($("xT").value), parseFloat($("yT").value), parseFloat($("zT").value));
	if (isNaN(vecT.x) || isNaN(vecT.y) || isNaN(vecT.z)){
		alert("The transformation input cannot be empty!");
		return;
	}
	switch (op) {
		case 1:
			var vecA = new vec4(parseFloat($("xA").value), parseFloat($("yA").value), parseFloat($("zA").value));
			if (isNaN(vecA.x) || isNaN(vecA.y) || isNaN(vecA.z)){
				alert("The anchor vertice cannot have empty values!");
				return;
			}
			for (var i = 0; i < vertices.length; ++i) {
				vertices[i] = vertices[i].rotate(vecT, vecA);
			}
			break;
		case 2:
			for (var i = 0; i < vertices.length; ++i) {
				vertices[i] = vertices[i].translate(vecT);
			}
			break;
		case 3:
			for (var i = 0; i < vertices.length; ++i) {
				vertices[i] = vertices[i].scale(vecT);
			}
			break;
		case 4:
			$("xT").value = parseFloat($("xT").value) * -1;
			$("yT").value = parseFloat($("yT").value) * -1;
			$("zT").value =  parseFloat($("zT").value) * -1;
			break;

	}
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
	ctx.arc(pixelVertice.x , pixelVertice.y , pointSize, 0, Math.PI * 2, true);
	ctx.font = "10px Arial";
	ctx.fillText(i, pixelVertice.x + 10, pixelVertice.y);
    ctx.fill();
	ctx.closePath();
}
function normalize(worldCoordinates) {
	return new vec4(worldCoordinates.x / worldCoordinates.w + canvas.width / 2,  canvas.height / 2 - worldCoordinates.y / worldCoordinates.w, pointSize, worldCoordinates.w);
}
function worldCoordinates(vertice) {
	return new vec4(vertice.x - canvas.width / 2, canvas.height / 2 - vertice.y, worldCoordinates.w);
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
function calcProjection(ver) {
	projMatrix = [];
	var isProjection = false;
	if ($("iso").checked) {
		projMatrix = isoMatrix
	} else if ($("dim").checked) {
		projMatrix = dimMatrix
	} else if ($("tri").checked) {
		projMatrix = triMatrix
	} else {
		var dx  = parseFloat($("xP").value);
		var dy  = parseFloat($("yP").value);
		var dz  = parseFloat($("zP").value);
		isProjection = true;
		if ($("xy").checked) {
			projMatrix = matmult(perZ(-dx, -dy, 0, 1), matmult(perZ(0, 0, 1.0/dz, 0), perZ(dx, dy, 0, 1)));
		} else if ($("xz").checked) {
			projMatrix = matmult(matmult(matmult(matmult(perY(-dx, 0, -dz, 1), matmult(perY(0, 1/dy, 0, 0), perY(dx, 0, dz, 1))), tranMatrix(-dx, -dy, -dz)), rotX(90)), tranMatrix(dx, dy, dz));
		} else if($("yz").checked) {
			projMatrix = matmult(matmult(matmult(matmult(perX(0, -dy, -dz, 1), matmult(perX(1.0/dx, 0, 0, 0), perX(0, dy, dz, 1))), tranMatrix(-dx, -dy, -dz)), rotY(-90)), tranMatrix(dx, dy, dz));
		}
	}
	if (!isProjection) {
		return (new vec4()).copyArray(matmult(projMatrix, ver.getMat4()));
	} else {
		return (new vec4()).copyVec(matmult(ver.getVec4(), projMatrix));
	}
}
function drawPlane() {
	var tmp = [];
	for (var i = 0; i < xzPlane.length; ++i) {
		tmp[i] = normalize(calcProjection(xzPlane[i]));
	}
	ctx.fillStyle = "#d3d3d3";
	ctx.beginPath();
	ctx.moveTo(tmp[0].x, tmp[0].y);
	ctx.lineTo(tmp[1].x, tmp[1].y);
	ctx.lineTo(tmp[2].x, tmp[2].y);
	ctx.lineTo(tmp[3].x, tmp[3].y);
	ctx.closePath();
	ctx.fill();
}
function drawEdge(edge) {
	var vertA = normalize(calcProjection(vertices[edge[0]]));
	var vertB = normalize(calcProjection(vertices[edge[1]]));
	drawLine(vertA, vertB, [], "#000000");
}
function drawAxis() {
	drawLine(normalize(calcProjection(xAxis[0])), normalize(calcProjection(xAxis[1])), [5, 3], "#0000ff");
	drawLine(normalize(calcProjection(yAxis[0])), normalize(calcProjection(yAxis[1])), [5, 3], "#00ff00");
	drawLine(normalize(calcProjection(zAxis[0])), normalize(calcProjection(zAxis[1])), [5, 3], "#ff0000");
}
function toRadians (angle) {
	return angle * (Math.PI / 180);
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
function $(element) {
	return document.getElementById(element);
}
