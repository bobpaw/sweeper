import { read as http_get_read } from "./http-get.js";
// Global variables
let boardmap: Cell[][] = Array();
let mines: Coordinates[] = Array();
let table = "";
let height = 0;
let width = 0;
let total_mines = 0;
let time = 0;
let timer: number | undefined = undefined; // Not sure what values are never accepted by window.clearInterval, so just use undefined
let clicks = 0;
let rclicks = 0;

class Coordinates {
    x: number;
    y: number;
    constructor(x_?: number | string, y_?: number | string) {
        if (!x_) {
            this.x = 0;
            this.y = 0;
        } else {
            this.x = typeof x_ === "string" ? parseInt(x_, 10) : x_;
            this.y = typeof y_ === "string" ? parseInt(y_, 10) : y_;
        }
    }
    copy(): Coordinates {
        return new Coordinates(this.x, this.y);
    }
    equals(other: Coordinates): boolean {
        if (this.x === other.x && this.y === other.y)
            return true;
    }
    in_arr(array: Coordinates[]): boolean {
        return array.some(x => x instanceof Coordinates && this.equals(x), this);
    }
    find_in(array: Coordinates[]): number {
        return array.findIndex(x => x instanceof Coordinates && this.equals(x), this);
    }
}
class Cell {
    value: "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "M";
    status: any;
    marked: boolean;
    loc: Coordinates;
    constructor(value_?: "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "M", status_?: any, marked_?: boolean, locationx_?: number | Coordinates, locationy_?: number) {
        if (!value_) {
            this.value = "0";
            this.status = undefined;
            this.marked = false;
            this.loc = new Coordinates();
            return;
        } else {
            this.loc = locationx_ instanceof Coordinates ? locationx_.copy() : new Coordinates(locationx_, locationy_);
            this.value = value_;
            this.status = status_;
            this.marked = marked_;
        }
    }
    copy(): Cell {
        return new Cell(this.value, this.status, this.marked, this.loc);
    }
    equals(other: Cell): boolean {
        return this.value === other.value && this.status === other.status && this.marked === other.marked && this.loc.equals(other.loc);
    }
    weak_equals(other: Cell | Coordinates): boolean {
        return other instanceof Cell ? this.loc.equals(other.loc) : this.loc.equals(other);
    }
    in_arr(array: Cell[]): boolean {
        return array.some(x => x instanceof Cell && this.equals(x), this);
    }
    weak_in_arr(array: Cell[] | Coordinates[]): boolean {
        return array.some(x => (x instanceof Cell || x instanceof Coordinates) && this.weak_equals(x), this);
    }
    find_in(array: Cell[]): number {
        return array.findIndex(x => x instanceof Cell && this.equals(x), this);
    }
    weak_find_in(array: Cell[] | Coordinates[]): number {
        return array.findIndex(x => (x instanceof Cell || x instanceof Coordinates) && this.weak_equals(x), this);
    }
}

// TODO(aiden.woodruff@gmail.com): Write function to return surrounding 
// cells (both 2d arrays and 1d)

// Return cell object from x and y coordinates
function get_cell(x_: Cell | Coordinates | number, y_?: number): HTMLElement {
    let x = 0, y = 0;
    if (x_ instanceof Coordinates) {
        x = x_.x;
        y = x_.y;
    } else if (x_ instanceof Cell) {
        x = x_.loc.x;
        y = x_.loc.y;
    } else {
        x = x_;
        y = y_;
    }
    return document.getElementById((x.toString() + "," + y.toString()));
}

// Updates unflagged (or really, unrevealed) mine count
function unflagged(): void {
    document.getElementById("minecount").innerHTML = "Mines: " + (total_mines - Array.prototype.concat.apply([], boardmap).filter((x: Cell) => x.status === "F").length).toString();
}

// Return x y dict from cell object
function get_cell_xy(object_: HTMLElement): Coordinates {
    let obj_id = object_.id;
    return new Coordinates(parseInt(obj_id.substring(0, obj_id.indexOf(",")), 10), parseInt(obj_id.substring(obj_id.indexOf(",") + 1), 10));
}

function win(): void {
    for (var y = 0; y < height; y++) {
        for (var x = 0; x < width; x++) {
            if (boardmap[y][x].status === "F") {
                get_cell(x, y).classList.remove("flagged");
                get_cell(x, y).classList.add("correct");
            }
        }
    }
    window.clearInterval(timer);
    document.getElementById("board").innerHTML += "";
    document.getElementById("end").innerHTML = "<br /><h3>Congratulations! You win! :)</h3>\nName: <input id='name' type='text' /><br /><input id='leaderboard' type='button' value='Push to leaderboard' />";
    document.getElementById("leaderboard").addEventListener("click", update_leaderboard);
    document.getElementById("name").addEventListener("keypress", function (e) {
        if (e.key === "Enter") {
            document.getElementById("leaderboard").click();
            return false;
        }
        return true;
    });
}

function lose(): void {
    window.clearInterval(timer);
    document.getElementById("board").innerHTML += "";
    document.getElementById("end").innerHTML = "<br /><h3>I am so sorry. You have lost. :(</h3>";
}

function count3BV(): number {
    var score_3bv = 0;
    var cells = [].concat.apply([], boardmap);
    cells.filter((x: Cell) => x.value === "0").forEach(function (cur) {
        if (cur.marked) {
            return;
        }
        cur.marked = true; // FIXME: Modifies cells, but floodFillMark modifies boardmap. Probably wrong.
        score_3bv++;
        floodFillMark(cur);
    });
    score_3bv += [].concat.apply([], boardmap).filter(x => { return !x.marked && x.value !== "M" }).length;
    return score_3bv;
}

function floodFillMark(cell: Coordinates | Cell) {
    let x = 0, y = 0;
    if (cell instanceof Coordinates) {
        x = cell.x;
        y = cell.y;
    } else if (cell instanceof Cell) {
        x = cell.loc.x;
        y = cell.loc.y;
    }
    if (x > 0 && !boardmap[y][x - 1].marked) {
        boardmap[y][x - 1].marked = true;
        if (boardmap[y][x - 1].value === "0") {
            floodFillMark(boardmap[y][x - 1]);
        }
    }
    if (x > 0 && y > 0 && !boardmap[y - 1][x - 1].marked) {
        boardmap[y - 1][x - 1].marked = true;
        if (boardmap[y - 1][x - 1].value === "0") {
            floodFillMark(boardmap[y - 1][x - 1]);
        }
    }
    if (x > 0 && y < height - 1 && !boardmap[y + 1][x - 1].marked) {
        boardmap[y + 1][x - 1].marked = true;
        if (boardmap[y + 1][x - 1].value === "0") {
            floodFillMark(boardmap[y + 1][x - 1]);
        }
    }
    if (y < height - 1 && !boardmap[y + 1][x].marked) {
        boardmap[y + 1][x].marked = true;
        if (boardmap[y + 1][x].value === "0") {
            floodFillMark(boardmap[y + 1][x]);
        }
    }
    if (x < width - 1 && y < height - 1 && !boardmap[y + 1][x + 1].marked) {
        boardmap[y + 1][x + 1].marked = true;
        if (boardmap[y + 1][x + 1].value === "0") {
            floodFillMark(boardmap[y + 1][x + 1]);
        }
    }
    if (x < width - 1 && !boardmap[y][x + 1].marked) {
        boardmap[y][x + 1].marked = true;
        if (boardmap[y][x + 1].value === "0") {
            floodFillMark(boardmap[y][x + 1]);
        }
    }
    if (x < width - 1 && y > 0 && !boardmap[y - 1][x + 1].marked) {
        boardmap[y - 1][x + 1].marked = true;
        if (boardmap[y - 1][x + 1].value === "0") {
            floodFillMark(boardmap[y - 1][x + 1]);
        }
    }
    if (y > 0 && !boardmap[y - 1][x].marked) {
        boardmap[y - 1][x].marked = true;
        if (boardmap[y - 1][x].value === "0") {
            floodFillMark(boardmap[y - 1][x]);
        }
    }
}

// Reveal a cell
function reveal(e: HTMLElement | MouseEvent | Coordinates | Cell): boolean {
    // If in flag mode run flag instead
    if ((<HTMLInputElement>document.getElementById("left")).checked) { // I know what #left is in this context
        return flag(e);
    }
    let coord: Coordinates;
    let object: HTMLElement;
    if (e instanceof HTMLElement) {
        object = e;
        coord = get_cell_xy(object);
    } else if (e instanceof MouseEvent) {
        object = <HTMLElement>e.target; // MouseEvent is only added to HTMLElements here
        coord = get_cell_xy(object);
        clicks++;
    } else if (e instanceof Coordinates) {
        object = get_cell(e);
        coord = e;
    } else if (e instanceof Cell) {
        object = get_cell(e);
        coord = e.loc;
    } else {
        return false;
    }
    if (boardmap[coord.y][coord.x].status === "R") {
        return;
    } else if (boardmap[coord.y][coord.x].status === "U") {
        boardmap[coord.y][coord.x].status = "R";
    } else if (boardmap[coord.y][coord.x].status === "F") {
        boardmap[coord.y][coord.x].status = "R";
        unflagged();
    }
    object.classList.remove("flagged");
    object.classList.remove("unrevealed");
    object.classList.add("revealed");
    object.removeEventListener("click", reveal);
    object.removeEventListener("contextmenu", flag);
    switch (boardmap[coord.y][coord.x].value) {
        case "0":
            object.innerHTML = "";
            let x = coord.x;
            let y = coord.y;
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
            return false;
        default:
            object.innerHTML = boardmap[coord.y][coord.x].value;
            break;
    }
    if ([].concat.apply([], boardmap).every(x => x.value !== "M" && x.status !== "R")) {
        win();
    }
}

function flag(e: any): boolean {
    // Only works for clicks
    if (!(e instanceof MouseEvent)) return false;
    rclicks++;
    let object = <HTMLElement>e.target;
    e.preventDefault();
    var coord = get_cell_xy(object);
    if (boardmap[coord.y][coord.x].status === "F") {
        boardmap[coord.y][coord.x].status = "U";
        object.classList.remove("flagged");
        object.classList.add("unrevealed");
    } else if (boardmap[coord.y][coord.x].status === "U") {
        boardmap[coord.y][coord.x].status = "F";
        object.classList.remove("unrevealed");
        object.classList.add("flagged");
    } else if (boardmap[coord.y][coord.x].status === "R") {
    }
    unflagged();
    return true;
}

function update_leaderboard() {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.status === 405) {
            console.log("Couldn't update leaderboard.");
            while (document.getElementById("end").firstChild) {
                document.getElementById("end").removeChild(document.getElementById("end").firstChild);
            }
            var error_msg = document.createElement("p");
            error_msg.innerHTML = "Leaderboard doesn't work here.";
            document.getElementById("end").appendChild(error_msg);
        } else if (this.readyState === 4 && this.status !== 200) {
            console.log("There was some error updating the leaderboard.");
        } else if (this.readyState === 4 && this.status === 200) {
            var ld = document.createElement("a");
            ld.href = "leaders.html";
            ld.innerHTML = "Leaderboard";
            while (document.getElementById("end").firstChild) {
                document.getElementById("end").removeChild(document.getElementById("end").firstChild);
            }
            document.getElementById("end").appendChild(ld);
        }
    };
    xhttp.open("POST", "ud_leaderboard.php", true);
    xhttp.setRequestHeader("Content-Type", "application/json");
    xhttp.send(JSON.stringify({
        name: (<HTMLInputElement>document.getElementById("name")).value,
        time: time,
        width: width,
        height: height,
        mines: total_mines,
        rclicks: rclicks,
        clicks: clicks,
        board_score: count3BV()
    }));
}

// Test for HTTP-GET variables
let dimensions = http_get_read(["width", "height", "mines"]);
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
if (!dimensions["mines"] || parseInt(dimensions["mines"], 10) >= (width * height)) {
    total_mines = Math.floor(Math.sqrt(width * height));
    total_mines = Math.floor((Math.random() * Math.floor(Math.sqrt(width * height))) + Math.floor(Math.sqrt(width * height)));
} else {
    total_mines = parseInt(dimensions["mines"], 10);
}

// Filter method
function onlyUniqueCoord(value: Coordinates, index: number, self: Coordinates[]): boolean {
    return value.find_in(self) === index;
}

function populate_board(e: Coordinates | HTMLTableCellElement | MouseEvent): boolean {
    let disclude: Coordinates;
    if (e instanceof Coordinates) {
        // How it should be
        disclude = e;
    } else if (e instanceof HTMLTableCellElement) {
        disclude = get_cell_xy(e);
    } else if (e instanceof MouseEvent) {
        if (e.which === 3) {
            e.preventDefault();
            return false;
        }
        disclude = get_cell_xy(<HTMLElement>e.target);
    } else {
        return false;
    }

    // Initialize Board array
    boardmap = Array();
    for (let y = 0; y < height; y++) {
        boardmap.push(Array());
        for (let x = 0; x < width; x++) {
            boardmap[y].push(new Cell("0", "U", false, x, y)); // FIXME: Somehow x and y aren't correctly supplied or something, so that for x values of zero, y is always zero
        }
    }

    // Get random mine values
    mines = Array();
    while (mines.length < total_mines) {
        mines.push(new Coordinates(
            Math.floor(Math.random() * width),
            Math.floor(Math.random() * height)
        ));
        mines = mines.filter(onlyUniqueCoord);
        mines = mines.filter(value => !value.equals(disclude));
    }

    // Place mines
    mines.forEach(mine => { boardmap[mine.y][mine.x].value = "M"; });

    // Assign numbers
    for (let y = 0, count = 0; y < height; y++) {
        for (let x = 0; x < width; x++, count = 0) {
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
            if (y < height - 1 && boardmap[y + 1][x].value === "M") {
                count++;
            }
            if (x > 0 && y > 0 && boardmap[y - 1][x - 1].value === "M") {
                count++;
            }
            if (x > 0 && y < height - 1 && boardmap[y + 1][x - 1].value === "M") {
                count++;
            }
            if (x < width - 1 && y > 0 && boardmap[y - 1][x + 1].value === "M") {
                count++;
            }
            if (x < width - 1 && y < height - 1 && boardmap[y + 1][x + 1].value === "M") {
                count++;
            }
            boardmap[y][x].value = <"0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "M">count.toString();
        }
    }

    table = "";
    for (let y = 0; y < height; y++) {
        table += "<tr>";
        for (let x = 0; x < width; x++) {
            if (boardmap[y][x].value !== "M") {
                table += "<td class='unrevealed' id='" + x + "," + y + "'></td>";
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
    let tds = document.getElementsByTagName("td");
    for (let i = 0; i < tds.length; i++) {
        tds[i].addEventListener("contextmenu", flag);
        tds[i].addEventListener("click", reveal);
    }
    clicks++;
    reveal(disclude);
    return true;
}

window.onload = function () {

    // Scope out item
    {
        document.getElementById("content").innerHTML = "";
        let item: HTMLElement;

        // right/left click form
        item = document.createElement("form");
        item.id = "click_type_form";
        item.style.border = "1px solid black";
        item.style.display = "inline-block";
        item.innerHTML = "<h3 style='display:inline'>Click Mode: </h3><input type='radio' name='clicktype' id='right' value='right' checked='checked' /><label for='right'>Reveal</label><input type='radio' name='clicktype' id='left' value='left' /><label for='left'>Flag</label>";
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
        (<HTMLFormElement>item).method = "get";
        item.innerHTML = "Width: <input type='number' placeholder='10' name='width' />Height: <input placeholder='10' type='number' name='height' />Mines: <input type='number' name='mines'><br><input type='submit' value='New Game'>";
        document.getElementById("content").appendChild(item);
    }
    if (width * height > 5000) {
        document.body.insertBefore(document.createElement("p").appendChild(document.createTextNode("This probably won't work. Try a size where width * height is less than 5000")), document.getElementById("board"));
        document.body.removeChild(document.getElementById("board"));
        return;
    }
    for (var y = 0; y < height; y++) {
        table += "<tr>";
        for (let x = 0; x < width; x++) {
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
    timer = window.setInterval(function () {
        time++;
        document.getElementById("timer").innerHTML = "Time - " + Math.floor(time / 60).toString() + ":" + (time % 60 < 10 ? "0" : "") + (time % 60).toString();
    }, 1000);
    document.getElementById("minecount").innerHTML = "Mines: " + total_mines.toString()

    // Set fields with previous values
    Array("height", "width", "mines").forEach(function (x) {
        (<HTMLInputElement>document.getElementsByName(x)[0]).value = dimensions[x] ? dimensions[x] : "";
    });
};
