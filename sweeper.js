// Test for HTTP-GET variables
var dimensions = read_http_get(["width", "height", "mines"]);
if (!dimensions["width"] || dimensions["width"] < 1) {
    dimensions["width"] = 10;
}
if (!dimensions["height"] || dimensions["height"] < 1) {
    dimensions["height"] = 10;
}
if (!dimensions["mines"] || dimensions["mines"] > dimensions["width"] * dimensions["height"]) {
    dimensions["mines"] = 20;
}

var boardmap = Array();
var mines = Array();
var unflagged = 0;

// Initialize Board array
for (var y = 0; y < dimensions["height"]; y++) {
    boardmap[y] = Array();
    for (x = 0; x < dimensions["width"]; x++) {
	boardmap[y][x] = {
	    value: "0",
	    state: "U"
	}
    }
}

// Filter method
function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}

// Get random mine values
while (mines.length < dimensions["mines"]) {
    mines.push( {
	x: Math.floor(Math.random() * dimensions["width"]),
	y: Math.floor(Math.random() * dimensions["height"])
    });
    mines.filter(onlyUnique);
}

unflagged = mines.length;

// Place mines
for (var i = 0; i < mines.length; i++) {
    boardmap[mines[i].y][mines[i].x].value = "M";
}

// Assign numbers
for (var y = 0, count = 0, width = dimensions["width"], height = dimensions["height"]; y < height; y++) {
    for (var x = 0; x < width; x++, count = 0) {
	if (boardmap[y][x].value === "M") {
	    continue;
	}
	if (x > 0 && boardmap[y][x - 1].value === "M") {
	    count++;
	}
	if (y > 0 && boardmap[y - 1][x].value === "M") {
	    count++;
	}
	if (x < width - 1 && boardmap[y][x + 1].value === "M") {
	    count++;
	}
	if (y < height - 1 && boardmap[y+1][x].value === "M") {
	    count++;
	}
	if (x > 0 && y > 0 && boardmap[y-1][x - 1].value === "M") {
	    count++;
	}
	if (x > 0 && y < height - 1 && boardmap[y+1][x - 1].value === "M") {
	    count++;
	}
	if (x < width - 1 && y > 0 && boardmap[y-1][x + 1].value === "M") {
	    count++;
	}
	if (x < width - 1 && y < height - 1 && boardmap[y + 1][x + 1].value === "M") {
	    count++;
	}
	boardmap[y][x].value = count.toString();
    }
}

// Retur cell object from x and y coordinates
function get_cell (x, y) {
    return document.getElementById( (x.toString() + "," + y.toString() ) );
}

// Return x y dict from cell object
function get_cell_xy (object) {
    coord = {};
    coord.x = parseInt(object.id.substring(0, object.id.indexOf(",")), 10);
    coord.y = parseInt(object.id.substring(object.id.indexOf(",")+1), 10);
    return coord;
}

// Reveal a cell
function reveal (e) {
    if (e instanceof HTMLTableCellElement) {
	var object = e;
    } else if (e instanceof MouseEvent) {
	var object = e.target;
    } else {
	return false;
    }
    var coord = get_cell_xy(object);
    if (boardmap[coord.y][coord.x].state === "R") {
	return;
    } else if (boardmap[coord.y][coord.x].state === "U" || boardmap[coord.y][coord.x].state === "F") {
	boardmap[coord.y][coord.x].state = "R";
    }
    object.classList.remove("flagged");
    object.classList.remove("unrevealed");
    object.classList.add("revealed");
    object.removeEventListener("click", reveal);
    object.removeEventListener("contextmenu", flag);
    switch(boardmap[coord.y][coord.x].value) {
    case "0":
	object.innerHTML = "0";
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
	    reveal(get_cell(x + 1, y + 1));
	}
	break;
    case "M":
	for (var y = 0, td = undefined; y < height; y++) {
	    for (var x = 0; x < width; x++) {
		reveal(get_cell(x, y));
	    }
	}
	object.innerHTML = "M";
	alert("You have lost. I'm so very sorry. :(");
	break;
    default:
	object.innerHTML = boardmap[coord.y][coord.x].value;
	break;
    }
}

function flag (e) {
    if (e instanceof HTMLTableCellElement) {
	var object = e;
    } else if (e instanceof MouseEvent) {
	var object = e.target;
	e.preventDefault();
    } else {
	return false;
    }
    var coord = get_cell_xy(object);
    if (boardmap[coord.y][coord.x].state === "F") {
	boardmap[coord.y][coord.x].state = "U";
	object.classList.remove("flagged");
	object.classList.add("unrevealed");
	unflagged++;
    } else if (boardmap[coord.y][coord.x].state === "U") {
	boardmap[coord.y][coord.x].state = "F";
	object.classList.remove("unrevealed");
	object.classList.add("flagged");
	unflagged--;
    } else if (boardmap[coord.y][coord.x].state === "R") {
    }
    var allgone = true;
    for (var i = 0; i < dimensions["mines"]; i++) {
	if (boardmap[mines[i].y][mines[i].x].state !== "F") {
	    allgone = false;
	}
    }
    if (allgone) {
	var stuff = document.body.getElementsByTagName("td");
	for (var i = 0; i < stuff.length; i++) {
	    stuff[i].onclick = null;
	    stuff[i].oncontextmenu = null;
	}
	alert("Congratulations! You win.");
    } else {
	document.getElementById("minecount").innerHTML = "Mines: " + unflagged.toString();
    }
}

var table = "";
for (var y = 0; y < dimensions["height"]; y++) {
    table += "<tr>";
    for (x = 0; x < dimensions["width"]; x++) {
	if (boardmap[y][x].value !== "M") {
	    table += "<td class='unrevealed' n" + boardmap[y][x].value + "' id='" + x + "," + y + "'></td>";
	} else if (boardmap[y][x].value === "M") {
	    table += "<td class='unrevealed mine' id='" + x + "," + y + "'></td>";
	} else {
	    table += "<td class='unrevealed null' id='" + x + "," + y + "'></td>";
	}
    }
    table += "</tr>";
}

window.onload = function () {
    document.getElementById("board").innerHTML = table;
    var tds = document.getElementsByTagName("td");
    for (var i = 0; i < tds.length; i++) {
	tds[i].oncontextmenu = flag;
	tds[i].onclick = reveal;
    }
    document.getElementById("minecount").innerHTML = "Mines: " + unflagged.toString();
};
