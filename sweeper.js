// Global variables
var boardmap = Array();
var mines = Array();
var unflagged = 0;
var table = "";
var height = 0;
var width = 0;
var total_mines = 0;
var time = 0;
var timer = undefined;
var clicks = 0;
var rclicks = 0;

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

// Return cell object from x and y coordinates
function get_cell (x, y) {
    if (x instanceof Coordinates) {
        y = x.y;
        x = x.x;
    }
    return document.getElementById( (x.toString() + "," + y.toString() ) );
}

// Return x y dict from cell object
function get_cell_xy (object) {
    coord = new Coordinates();
    coord.x = parseInt(object.id.substring(0, object.id.indexOf(",")), 10);
    coord.y = parseInt(object.id.substring(object.id.indexOf(",")+1), 10);
    return coord;
}

function win () {
    for (var y = 0; y < height; y++) {
        for (var x = 0; x < width; x++) {
            if (boardmap[y][x].state === "F") {
                get_cell(x, y).classList.remove("flagged");
                get_cell(x, y).classList.add("correct");
            }
        }
    }
    window.clearInterval(timer);
    document.getElementById("board").innerHTML += "";
    document.getElementById("end").innerHTML = "<br><h3>Congratulations! You win! :)</h3>\n<input id='leaderboard' type='button' value='Push to leaderboard'>";
    document.getElementById("leaderboard").onclick = update_leaderboard;
}

function lose () {
    window.clearInterval(timer);
    document.getElementById("board").innerHTML += "";
    document.getElementById("end").innerHTML = "<br><h3>I am so sorry. You have lost. :(</br>";
}

// Reveal a cell
function reveal (e) {
    // If in flag mode run flag instead
    if (document.getElementById("left").checked) {
        return flag(e);
    }
    var coord;
    var object;
    if (e instanceof HTMLTableCellElement) {
        object = e;
        coord = get_cell_xy(object);
    } else if (e instanceof MouseEvent) {
        object = e.target;
        coord = get_cell_xy(object);
        clicks++;
    } else if (e instanceof Coordinates) {
        object = get_cell(e);
        coord = e;
    } else {
        return false;
    }
    coord = get_cell_xy(object);
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
        object.innerHTML = "";
        var x = coord.x;
        var y = coord.y;
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
        lose();
        break;
    default:
        object.innerHTML = boardmap[coord.y][coord.x].value;
        break;
    }
    var allgone = true;
    for (var y = 0; y < height; y++) {
        for (var x = 0; x < width; x++) {
            if (boardmap[y][x].value !== "M" && boardmap[y][x].state === "U") {
                allgone = false;
            }
        }
    }
    if (allgone) {
        win();
    }
}

function flag (e) {
    if (e instanceof HTMLTableCellElement) {
        var object = e;
    } else if (e instanceof MouseEvent) {
        rclicks++;
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
    for (var y = 0; y < height; y++) {
        for (var x = 0; x < width; x++) {
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
        win();
    }
}

function update_leaderboard () {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.status === 405) {
            console.log("Couldn't update leaderboard.");
            document.getElementById("end").removeChild(document.getElementById("end").getElementsByTagName("input")[0]);
            var error_msg = document.createElement("p");
            error_msg.innerHTML = "Leaderboard doesn't work here.";
            document.getElementById("end").appendChild(error_msg);
        } else if (this.readyState === 4 && this.status !== 200) {
            console.log("There was some error updating the leaderboard.");
        } else if (this.readyState === 4 && this.status === 200) {
            var ld = document.createElement("a");
            ld.href = "leaders.html";
            ld.innerHTML = "Leaderboard";
            document.getElementById("end").appendChild(ld);
            document.getElementById("end").removeChild(document.getElementById("end").getElementsByTagName("input")[0]);

        }};
    xhttp.open("POST", "ud_leaderboard.php", true);
    xhttp.setRequestHeader("Content-Type", "application/json");
    xhttp.send(JSON.stringify( {
        time: time,
        width: width,
        height: height,
        mines: total_mines,
        rclicks: rclicks,
        clicks: clicks
    }));
}

// Test for HTTP-GET variables
var dimensions = read_http_get(["width", "height", "mines"]);
if (!dimensions["width"] || dimensions["width"] < 1) {
    width = 10;
} else {
    width = parseInt(dimensions["width"], 10);
}
if (!dimensions["height"] || dimensions["height"] < 1) {
    height = 10;
} else {
    height = parseInt(dimensions["height"], 10);
}
if (!dimensions["mines"] || parseInt(dimensions["mines"], 10) > (width * height)) {
    total_mines = Math.floor(Math.sqrt(width * height));
    total_mines = Math.floor((Math.random() * Math.floor(Math.sqrt(width*height))) + Math.floor(Math.sqrt(width*height)));
} else {
    total_mines = parseInt(dimensions["mines"], 10);
}

// Filter method
function onlyUniqueCoord(value, index, self) {
    return value.find(self) === index;
}
function populate_board (e) {
    var disclude;
    if (e instanceof Coordinates) {
        // How it should be
        disclude = e;
    } else if (e instanceof HTMLTableCellElement) {
        disclude = get_cell_xy(disclude);
    } else if (e instanceof MouseEvent) {
        if (e.which === 3) {
            e.preventDefault();
            return false;
        }
        disclude = get_cell_xy(e.target);
    } else {
        return false;
    }

    // Initialize Board array
    boardmap = Array();
    for (var y = 0; y < height; y++) {
        boardmap[y] = Array();
        for (x = 0; x < width; x++) {
            boardmap[y][x] = {
                value: "0",
                state: "U"
            }
        }
    }

    // Get random mine values
    while (mines.length < total_mines) {
        mines.push(new Coordinates(
            Math.floor(Math.random() * width),
            Math.floor(Math.random() * height)
        ));
        mines = mines.filter(onlyUniqueCoord);
        mines = mines.filter(value => { return ! value.equals(disclude); });
    }

    unflagged = mines.length;

    // Place mines
    for (var i = 0; i < mines.length; i++) {
        boardmap[mines[i].y][mines[i].x].value = "M";
    }

    // Assign numbers
    for (var y = 0, count = 0; y < height; y++) {
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

    table = "";
    for (var y = 0; y < height; y++) {
        table += "<tr>";
        for (x = 0; x < width; x++) {
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

    // Write table to HTML and add event listeners
    document.getElementById("board").innerHTML = table;
    var tds = document.getElementsByTagName("td");
    for (var i = 0; i < tds.length; i++) {
        tds[i].oncontextmenu = flag;
        tds[i].onclick = reveal;
    }
    clicks++;
    reveal(disclude);
}

window.onload = function () {

    // Only create body if JavaScript works
    {
        document.getElementById("content").innerHTML = "";
        var item;

        // right/left click form
        item = document.createElement("form");
        item.id = "click_type_form";
        item.style.border = "1px solid black";
        item.style.display = "inline-block";
        item.innerHTML = "<h3 style='display:inline'>Click Mode: </h3><input type='radio' name='clicktype' id='right' value='right' checked><label for='right'>Reveal</label><input type='radio' name='clicktype' id='left' value='left'><label for='left'>Flag</label>";
        document.getElementById("content").appendChild(item);

        // Add some spacing
        document.getElementById("content").appendChild(document.createElement("br"));
        document.getElementById("content").appendChild(document.createElement("br"));

        // board table
        item = document.createElement("table");
        item.classList.add("board");
        item.id = "board";
        document.getElementById("content").appendChild(item);

        // end div
        item = document.createElement("div");
        item.id = "end";
        document.getElementById("content").appendChild(item);

        // minecount p
        item = document.createElement("p");
        item.id = "minecount";
        document.getElementById("content").appendChild(item);

        // timer p
        item = document.createElement("p");
        item.id = "timer";
        item.appendChild(document.createTextNode("Time - 0:00"));
        document.getElementById("content").appendChild(item);

        // restart form
        item = document.createElement("form");
        item.method = "get";
        item.innerHTML = "Width: <input type='text' name='width'>Height: <input type='text' name='height'>Mines: <input type='text' name='mines'><br><input type='submit' value='New Game'>";
        document.getElementById("content").appendChild(item);
    }
    if (width * height > 5000) {
        document.body.insertBefore(document.createElement("p").appendChild(document.createTextNode("This probably won't work. Try a size where width * height is less than 5000")), document.getElementById("board"));
        document.body.removeChild(document.getElementById("board"));
        return;
    }
    for (var y = 0; y < height; y++) {
        table += "<tr>";
        for (x = 0; x < width; x++) {
            table += "<td class='unrevealed' id='" + x + ',' + y + "'></td>";
        }
        table += "</tr>";
    }
    document.getElementById("board").innerHTML = table;
    var tds = document.getElementsByTagName("td");
    for (var i = 0; i < tds.length; i++) {
        tds[i].onclick = populate_board;
        tds[i].oncontextmenu = populate_board;
    }
    timer = window.setInterval( function () {
        time++;
        document.getElementById("timer").innerHTML = "Time - " + Math.floor(time/60).toString() + ":" + (time % 60 < 10 ? "0" : "") + (time % 60).toString();
    }, 1000);
    document.getElementById("minecount").innerHTML = "Mines: " + total_mines.toString()
    document.getElementsByName("height")[0].value = dimensions["height"] ? dimensions["height"] : "";
    document.getElementsByName("width")[0].value = dimensions["width"] ? dimensions["width"] : "";
    document.getElementsByName("mines")[0].value = dimensions["mines"] ? dimensions["mines"] : "";
};
