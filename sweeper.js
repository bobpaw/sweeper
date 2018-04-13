var dimensions = read_http_get(["width", "height", "mines"]);
if (dimensions["width"] === undefined || dimensions["width"] < 1) {
    dimensions["width"] = 10;
}
if (dimensions["height"] === undefined || dimensions["height"] < 1) {
    dimensions["height"] = 10;
}
if (dimensions["mines"] === undefined || dimensions["mines"] > dimensions["width"] * dimensions["height"]) {
    dimensions["mines"] = 20;
}
var boardmap = Array();
var mines = Array();
for (var y = 0; y < dimensions["height"]; y++) {
    boardmap[y] = Array();
    for (x = 0; x < dimensions["width"]; x++) {
        boardmap[y][x] = 0;
    }
}
for (var i = 0; i < dimensions["mines"]; i++) {
    boardmap[Math.floor(Math.random() * dimensions["height"])][Math.floor(Math.random() * dimensions["width"])] = "M";
}

// Assign numbers
for (var y = 0, count = 0, width = dimensions["width"], height = dimensions["height"]; y < height; y++) {
    for (var x = 0; x < width; x++, count = 0) {
        if (x > 0 && boardmap[y][x - 1] === "M") count++;
        if (y > 0 && boardmap[y - 1][x] === "M") count++;
        if (x < width - 1 && boardmap[y][x + 1] === "M") count++;
        if (y < height - 1 && boardmap[y+1][x] === "M") count++;
        if (x > 0 && y > 0 && boardmap[y-1][x - 1] === "M") count++;
        if (x > 0 && y < height - 1 && boardmap[y+1][x - 1] === "M") count++;
        if (x < width - 1 && y > 0 && boardmap[y-1][x + 1] === "M") count++;
        if (x < width - 1 && y < height - 1 && boardmap[y + 1][x + 1] === "M") count++;
        if (boardmap[y][x] !== "M") boardmap[y][x] = count;
    }
}

function get_cell (x, y) {
    return document.getElementById( (x.toString() + "," + y.toString() ) );
}

function get_cell_xy (object) {
    coord = {};
    coord.x = parseInt(object.id.substring(0, object.id.indexOf(",")), 10);
    coord.y = parseInt(object.id.substring(object.id.indexOf(",")+1), 10);
    return coord;
}
function reveal (object) {
    console.log("Editing item with id: " + object.id);
    object.classList.remove("unrevealed");
    object.classList.add("revealed");
    object.removeEventListener("click", reveal);
    if (object.classList.contains("n0")) {
	object.innerHTML = "0";
        var coord = get_cell_xy(object);
	var x = coord.x;
	var y = coord.y;
	var width = dimensions["width"];
	var height = dimensions["height"];
	if (x < width - 1) {
            reveal(get_cell(x + 1, y));
        }
	if (x > 0 && y > 0) {
            reveal(get_cell(x - 1, y - 1));
        }
	if (x > 0) {
            reveal(get_cell(x - 1, y));
        }
	if (x > 0 && y < height - 1) {
            reveal(get_cell(x - 1, y + 1));
        }
	if (y < height - 1) {
            reveal(get_cell(x, y + 1));
        }
	if (x < width - 1 && y > 0) {
            reveal(get_cell(x + 1, y - 1));
        }
	if (y > 0) {
            reveal(get_cell(x, y - 1));
        }
	if (x < width - 1 && y < height - 1) {
            reveal(get_text(x + 1, y + 1));
        }
    } else if (object.classList.contains("n1")) {
	object.innerHTML = "1";
    } else if (object.classList.contains("n2")) {
	object.innerHTML = "2";
    } else if (object.classList.contains("n3")) {
	object.innerHTML = "3";
    } else if (object.classList.contains("n4")) {
	object.innerHTML = "4";
    } else if (object.classList.contains("n5")) {
	object.innerHTML = "5";
    } else if (object.classList.contains("mine")) {
	object.innerHTML = "M";
    }
}
var table = "";
for (var y = 0; y < dimensions["height"]; y++) {
    table += "<tr>";
    for (x = 0; x < dimensions["width"]; x++) {
	if (boardmap[y][x] !== "M") {
	    table += "<td class='unrevealed n" + boardmap[y][x] + "' id='" + x + "," + y + "' onclick='reveal(this)'></td>";
	} else if (boardmap[y][x] === "M") {
	    table += "<td class='unrevealed mine' onclick='reveal(this)'></td>";
	} else {
	    table += "<td class='unrevealed null' onclick='reveal(this)'></td>";
	}
    }
    table += "</tr>";
}
window.onload = function () {document.getElementById("board").innerHTML = table};
