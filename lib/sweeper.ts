/**
 * @file Generate and manage content for index.html.
 * @author Aiden Woodruff
 */

import { MineField, Cell, Coordinates } from "./MineField.js";
import { formatTime } from "./formatTime.js";

const $ = document.querySelector.bind(document);

// Global variables
let table: HTMLTableElement;
let click_form: HTMLFormElement;
let minecount: HTMLParagraphElement;
let time = 0;
let timer: number | undefined = undefined; // Not sure what values are never accepted by window.clearInterval, so just use undefined
let clicks = 0;
let rclicks = 0;
let minefield: MineField;
let params: {width: number, height: number, mines: number};

/**
 * Extract coordinates from <td>.
 * 
 * @param cell A <td> in table.
 * @returns A coordinates object.
 */
function getCoordinatesByTD(cell: HTMLTableCellElement): Coordinates {
	const coord_tuple = cell.id.split(",").map(n => parseInt(n));
	return { x: coord_tuple[0], y: coord_tuple[1] };
}

/**
 * Get cell in minefield via the <td>.
 * 
 * Shorthand for minefield.at(getCoordinatesByTD()).
 * 
 * @param cell A <td> in table.
 * @returns The corresponding cell in minefield.
 */
function getCellByTD(cell: HTMLTableCellElement): Cell {
	return minefield.at(getCoordinatesByTD(cell));
}

/**
 * Get <td> via cell in minefield.
 * 
 * @param cell A cell object in minefield.
 * @returns The corresponding <td> in table.
 */
function getTDByCell(cell: Cell | Coordinates): HTMLTableCellElement {
	return table.rows[cell.y].cells[cell.x];
}

/**
 * Install <td> event listeners.
 * 
 * @param cell The cell corresponding to the <td>.
 */
function installCellEvents(cell: Cell | Coordinates): void {
	const td = getTDByCell(cell); // TODO: Maybe change to accepting td as param?
	td.addEventListener("click", revealCallback);
	td.addEventListener("contextmenu", flag);
}

/**
 * Uninstall <td> event listeners.
 *
 * @param cell The cell corresponding to the <td>.
 */
function uninstallCellEvents(cell: Cell | Coordinates): void {
	const td = getTDByCell(cell);
	td.removeEventListener("click", revealCallback);
	td.removeEventListener("contextmenu", flag);
}

/**
 * Update minecount element.
 * 
 * Passing unflagged skips counting the minefield.
 * 
 * @param unflagged Optional number of unflagged mines.
 */
function updateMinecount(unflagged?: number): void {
	if (typeof unflagged === "undefined") {
		let flagged = 0;
		minefield.forEach(c => {
			if (c.status === "F") ++flagged;
		});
		unflagged = minefield.mines - flagged;
	}
	minecount.textContent = `Mines: ${unflagged}`;
}

/**
 * Show win screen and leaderboard submission.
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
	document.getElementById("win-screen").style.display = "block";
}

/**
 * Show lose screen.
 */
function lose(): void {
	window.clearInterval(timer);
	minefield.forEach(c => { uninstallCellEvents(c); });
	// TODO: Decide if this is the right display.
	document.getElementById("lose-screen").style.display = "block";
}

/**
 * Reveal a cell in the minefield.
 * 
 * Updates Cell and <td>.
 * 
 * @param cell The cell to reveal.
 */
function revealCell(cell: Cell): void {
	if (cell.status === "R") return;
	cell.status = "R";

	const td = getTDByCell(cell);
	if (cell.value !== 0)
		td.textContent = cell.value.toString();
		// FIXME: td.append is probably more accurate but cells are currently
		// being double revealed right now.

	td.classList.remove("flagged");
	td.classList.remove("unflagged");
	td.classList.add("revealed");
	uninstallCellEvents(cell);
}

/**
 * Callback to reveal a cell (left click).
 * 
 * If the click type is set to flag, calls flag().
 * 
 * @param event The MouseEvent that triggered me.
 * @returns True or the return value of flag().
 */
function revealCallback(event: MouseEvent): boolean {
	// If in flag mode run flag instead
	if (click_form.elements["clicktype"].value === "flag") {
		return flag(event);
	}

	++clicks;
	
	const td = event.currentTarget as HTMLTableCellElement;
	const cell = getCellByTD(td);
	
	if (cell.value === 9) {
		// TODO: Replace with mine image
		td.textContent = "M";
		td.classList.add("wrong");
		lose();

	} else {
		minefield.floodToNumbers(cell, revealCell);
	}
	
	updateMinecount();

	if (minefield.every(c => c.value !== 9 && c.status === "R")) win();
	return true;
}

/**
 * Event handler to flag a cell.
 * 
 * @param event The MouseEvent that triggered me.
 * @returns Boolean indicating failure if the <td> is revealed. Success otherwise.
 */
function flag(event: MouseEvent): boolean {
	++rclicks;
	event.preventDefault();

	const td = event.currentTarget as HTMLTableCellElement;
	const cell = getCellByTD(td);

	switch (cell.status) {
	case "F":
		cell.status = "U";
		td.classList.remove("flagged");
		td.classList.add("unrevealed");
		updateMinecount();
		return true;
	case "U":
		cell.status = "F";
		td.classList.remove("unrevealed");
		td.classList.add("flagged");
		updateMinecount();
		return true;
	case "R":
	default:
		return false;
	}
}

/**
 * Send an XHR to ud_leaderboard.php file.
 */
function update_leaderboard() {
	const xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function () {
		if (this.status === 405) {
			console.log("Couldn't update leaderboard.");
			while (document.getElementById("end").firstChild) {
				document.getElementById("end").removeChild(document.getElementById("end").firstChild);
			}
			const error_msg = document.createElement("p");
			error_msg.innerHTML = "Leaderboard doesn't work here.";
			document.getElementById("end").appendChild(error_msg);
		} else if (this.readyState === 4 && this.status !== 200) {
			console.log("There was some error updating the leaderboard.");
		} else if (this.readyState === 4 && this.status === 200) {
			const ld = document.createElement("a");
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

/**
 * Event handler before minefield has been planted.
 * 
 * Doing it in two steps like this allows exclusion of a specific cell.
 * 
 * @param event The MouseEvent that triggers me.
 * @returns True.
 */
function populate_board(event: MouseEvent): true {
	const td = event.currentTarget as HTMLTableCellElement;
	const exclude = getCoordinatesByTD(td);

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
	td.click();

	return true;
}

window.onload = function () {
	// Test for HTTP-GET variables
	const searchParams = (new URL(document.URL)).searchParams;

	params = {
		width: searchParams.has("width") ? parseInt(searchParams.get("width")) : 10,
		height: searchParams.has("height") ? parseInt(searchParams.get("height")) : 10,
		mines: searchParams.has("mines") ? parseInt(searchParams.get("mines")) : null
	};

	// Param validation
	if (Number.isNaN(params.width) || params.width < 1) params.width = 10;
	if (Number.isNaN(params.height) || params.height < 1) params.height = 10;

	if (Number.isNaN(params.mines)  || params.mines === null || params.mines >= (params.width * params.height)) {
		const root = Math.floor(Math.sqrt(params.width * params.height));
		params.mines = Math.floor((Math.random() * root) + root);
	}

	const params_form = $("#params") as HTMLFormElement;
	minecount = $("#minecount") as HTMLParagraphElement;
	click_form = $("#clicktype_form") as HTMLFormElement;

	
	// Replace apology with table
	table = document.createElement("table");
	table.classList.add("board");
	table.id = "board";
	$("#content").insertBefore(table, $("#apology"));
	$("#content").removeChild($("#apology"));

	if (params.width * params.height > 5000) {
		// TODO: Decide whether this is the display style I want.
		(<HTMLElement>$("#fatal-warning")).style.display = "block";
		document.body.removeChild($("#board"));
		return;
	}

	for (let y = 0; y < params.height; y++) {
		const row = table.insertRow();
		for (let x = 0; x < params.width; x++) {
			const data = row.insertCell();
			data.id = `${x},${y}`;
			data.className = "unrevealed";
			data.addEventListener("click", populate_board, { once: true });
		}
	}

	timer = window.setInterval(function () {
		time++;
		document.getElementById("timer").textContent = "Time - " + formatTime(time);
	}, 1000);
    
	updateMinecount(params.mines);

	// Set fields with previous values
	for (const param in params) {
		params_form.elements[param].placeholder = params[param];
	}
};
