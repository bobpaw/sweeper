// Global variables
var boardmap = Array();
var mines = Array();
var unflagged = 0;
var table = "";

// Return cell object from x and y coordinates
function get_cell (x, y) {
    return document.getElementById( (x.toString() + "," + y.toString() ) );
}

// Return x y dict from cell object
function get_cell_xy (object) {
    coord = new Coordinates();
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
	object.innerHTML = "M";
	object.classList.add("wrong");
	for (var y = 0; y < dimensions["height"]; y++) {
	    for (var x = 0; x < dimensions["width"]; x++) {
		if (boardmap[y][x].state === "U") {
		    reveal(get_cell(x, y));
		}
		if (boardmap[y][x].state === "F") {
		    var correct = false;
		    for (var i = 0; i < mines.length; i++) {
			if (mines[i].equals(new Coordinates(x, y))) {
			    correct = true;
			    break;
			}
		    }
		    reveal(get_cell(x, y));
		    get_cell(x, y).innerHTML = "";
		    if (correct) {
			get_cell(x,y).classList.remove("flagged");
			get_cell(x,y).classList.remove("wrong");
			get_cell(x,y).classList.add("correct");
		    }
		}
	    }
	}
	document.getElementById("board").innerHTML += "";
	document.getElementById("end").innerHTML = "<br><h3>I am so sorry. You have lost. :(</br>";
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
    var flags = Array();
    for (var y = 0; y < dimensions["height"]; y++) {
	for (var x = 0; x < dimensions["width"]; x++) {
	    if (boardmap[y][x].state === "F") {
		flags.push(new Coordinates(x, y));
	    }
	}
    }
    if (Math.sign(flags.length - mines.length)) {
	allgone = false;
    } else {
	for (var i = 0; i < flags.length; i++) {
	    if (! flags[i].in_arr(mines)){
		allgone = false;
		break;
	   }
	}
    }
    document.getElementById("minecount").innerHTML = "Mines: " + unflagged.toString();
    if (allgone) {
	for (var y = 0; y < dimensions["height"]; y++) {
	    for (var x = 0; x < dimensions["width"]; x++) {
		if (boardmap[y][x].state === "F") {
		    get_cell(x, y).classList.remove("flagged");
		    get_cell(x, y).classList.add("correct");
		}
	    }
	}
	document.getElementById("board").innerHTML += "";
	document.getElementById("end").innerHTML = "<br><h3>Congratulations! You win! :)</br>";
    }
}

// Test for HTTP-GET variables
var dimensions = read_http_get(["width", "height", "mines"]);
if (!dimensions["width"] || dimensions["width"] < 1) {
    dimensions["width"] = 10;
}
if (!dimensions["height"] || dimensions["height"] < 1) {
    dimensions["height"] = 10;
}
if (!dimensions["mines"] || parseInt(dimensions["mines"], 10) > parseInt(dimensions["width"], 10) * parseInt(dimensions["height"], 10)) {
    dimensions["mines"] = Math.floor(Math.sqrt(dimensions["width"] * dimensions["height"]));
}

class Coordinates {
    constructor (x, y) {
	if (x instanceof Coordinates) {
	    this.x = x.x;
	    this.y = x.y;
	} else {
	    this.x = typeof x === "string" ? parseInt(x, 10) : x;
	    this.y = typeof y === "string" ? parseInt(y, 10) : y;
	}
    }
    equals (other) {
	if (other instanceof Coordinates) {
	    if (this.x === other.x && this.y === other.y) {
		return true;
	    }
	} else {
	    return false;
	}
    }
    in_arr (array) {
	for (var i = 0; i < array.length; i++) {
	    if (array[i].equals(this)) {
		return true;
	    }
	}
	return false;
    }
    find (array) {
	for (var i = 0; i < array.length; i++) {
	    if (array[i].equals(this)) {
		return i;
	    }
	}
	return -1;
    }
    copy () {
	a = new Coordinates(this.x, this.y);
	return a;
    }
}

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
function onlyUniqueCoord(value, index, self) {
    return value.find(self) === index;
}

// Get random mine values
while (mines.length < parseInt(dimensions["mines"],10)) {
    mines.push(new Coordinates(
	Math.floor(Math.random() * dimensions["width"]),
	Math.floor(Math.random() * dimensions["height"])
    ));
    mines = mines.filter(onlyUniqueCoord);
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
