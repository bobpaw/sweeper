import { MineField, Cell, Coordinates } from "./MineField.js";
import formatTime from "./formatTime.js";
import { getNodeMajorVersion } from "./node_modules/typescript/lib/typescript.js";

const $ = document.querySelector;

// Global variables
let table: HTMLTableElement;
let click_form: HTMLFormElement;
let minecount: HTMLParagraphElement;
let time = 0;
let timer: number | undefined = undefined; // Not sure what values are never accepted by window.clearInterval, so just use undefined
let clicks = 0;
let rclicks = 0;
let minefield: MineField;


/**
 * Get cell in minefield via the <td>.
 * 
 * @param cell
 */
function getCellByTD(cell: HTMLTableCellElement): Cell {
	let coord_tuple = cell.id.split(",").map(parseInt);
	return minefield.at({ x: coord_tuple[0], y: coord_tuple[1] });
}

/**
 * Get <td> via cell in minefield.
 * 
 * @param cell
 */
function getTDByCell(cell: Cell | Coordinates): HTMLTableCellElement {
	return table.rows[cell.y].cells[cell.x];
}

/**
 * Install <td> event listeners.
 * 
 * @param cell {Cell}
 */
function installCellEvents(cell: Cell | Coordinates): void {
	let td = getTDByCell(cell);
	td.addEventListener("click", reveal);
	td.addEventListener("contextmenu", flag);
}

function uninstallCellEvents(cell: Cell | Coordinates): void {
    let td = getTDByCell(cell);
    td.removeEventListener("click", reveal);
	td.removeEventListener("contextmenu", flag);
}

/**
 * Update minecount element.
 */
function updateMinecount(): void {
	let flagged = 0;
	minefield.forEach(c => {
		if (c.status === "F") ++flagged;
	});
    
	minecount.textContent = `Mines: ${minefield.mines - flagged}`;
}

/**
 *
 */
function win(): void {
    minefield.forEach(c => {
        if (c.status === "F") {
            getTDByCell(c).classList.add("correct");
            uninstallCellEvents(c);
        }
    });
	window.clearInterval(timer);

	$("#leaderboard").addEventListener("click", update_leaderboard);
	$("#name").addEventListener("keyup", function (e: KeyboardEvent) {
		if (e.key === "Enter") {
			update_leaderboard();
			return false;
		}
		return true;
	});
	// TODO: Decide if this is the correct display.
	$("#win-screen").style.display = "block";
}

/**
 *
 */
function lose(): void {
	window.clearInterval(timer);
	minefield.forEach(c => {uninstallCellEvents(c);});
	// TODO: Decide if this is the right display.
	$("#lose-screen").style.display="block";
}

// Reveal a cell
/**
 * @param e
 * @example
 */
function reveal(e: MouseEvent): boolean {
	// If in flag mode run flag instead
	if (click_form.elements["flag"].checked) {
		return flag(e);
	}
	
	let cell = getCellByTD(this);
	
	switch(cell.status) {
		case "R":
			return;
		case "U":
			cell.status = "R";
			break;
		case "F":
			cell.status = "R";
			updateMinecount(); // FIXME: Run at end instead.
	}
	
	if (cell.value === 9) {
		// TODO: Replace with mine image
		this.textContent = "M";
		this.classList.add("wrong");
		lose();
		
	} else {
		minefield.floodToNumbers(cell, c => {
			if (c.status === "R") return;
			c.status = "R";

			let td = getTDByCell(c);
			td.classList.remove("flagged");
			td.classList.remove("unflagged");
			td.classList.add("revealed");
			uninstallCellEvents(c);

		});
	}
	
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
	
	if (minefield.every(c => c.value !== 9 && c.status === "R")) win();
	return true;
}

/**
 * Event handler to flag cell.
 * 
 * @param e
 */
function flag(e: MouseEvent): boolean {
	// Only works for clicks
	++rclicks;
	e.preventDefault();
	let cell = getCellByTD(this);
	switch (cell.status) {
	case "F":
		cell.status = "U";
		this.classList.remove("flagged");
		this.classList.add("unrevealed");
		updateMinecount();
		return true;
	case "U":
		cell.status = "F";
		this.classList.remove("unrevealed");
		this.classList.add("flagged");
		updateMinecount();
		return true;
	case "R":
	default:
		return false;
        
	}
}

/**
 *
 */
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
		name: (<HTMLInputElement>$("name")).value,
		time: time,
		width: minefield.width,
		height: minefield.height,
		mines: minefield.mines,
		rclicks: rclicks,
		clicks: clicks,
		board_score: minefield.score3BV()
	}));
}

// Test for HTTP-GET variables
let searchParams = (new URL(document.URL)).searchParams;

let params = {
	width: searchParams.has("width") ? parseInt(searchParams.get("width")) : 10,
	height: searchParams.has("height") ? parseInt(searchParams.get("height")) : 10,
	mines: searchParams.has("mines") ? parseInt(searchParams.get("mines")) : null
};

// Param validation
if (params.width < 1) params.width = 10;
if (params.height < 1) params.height = 10;

if (params.mines === null || params.mines >= (params.width * params.height)) {
	let root = Math.floor(Math.sqrt(params.width * params.height));
	params.mines = Math.floor((Math.random() * root) + root);
}

/**
 * @param e
 * @example
 */
function populate_board(e: MouseEvent): boolean {

	let exclude = getCellByTD(this);


	// Initialize Board array
	minefield = new MineField(params.width, params.height, exclude, params.mines);

	minefield.forEach(c => {
		if (c.value === 9) {
			getTDByCell(c).className = "unrevealed mine";
		}
		installCellEvents(c);
	});

	// FIXME: might be an error to trigger an event from an event
	// Hopefully the `once` unregisters this first.
	this.click();
	return true;
}

window.onload = function () {
	let params_form: HTMLFormElement;

	// Scope out item
	{
		$("#content").removeChild($("#apology"));
		let content = document.createDocumentFragment();

		// Replace apology with table
		table = document.createElement("table");
		table.classList.add("board");
		table.id = "board";
		$("#content").insertBefore(table, $("#apology"));

	}
	if (params.width * params.height > 5000) {
		// TODO: Decide whether this is the display style I want.
		(<HTMLElement>$("#fatal-warning")).style.display = "block";
		document.body.removeChild($("#board"));
		return;
	}

	for (let y = 0; y < minefield.height; y++) {
		let row = table.insertRow();
		for (let x = 0; x < minefield.width; x++) {
			let data = row.insertCell();
			data.id = `${x},${y}`;
			data.className = "unrevealed";
			data.addEventListener("click", populate_board, { once: true });
		}
	}

	timer = window.setInterval(function () {
		time++;
		document.getElementById("timer").textContent = "Time - " + formatTime(time);
	}, 1000);
    
	updateMinecount();

	// Set fields with previous values
	for (let param in params) {
		params_form.elements[param] = params[param];
	}
};
