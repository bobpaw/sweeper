/**
 * @file Generate and manage content for index.html.
 * @author Aiden Woodruff
 */

import { MineField, Cell, Coordinates } from "./MineField.js";
import { formatTime } from "./formatTime.js";
import type { Score } from "./score";

const $ = document.querySelector.bind(document);

// Global variables
let table: HTMLTableElement;
let click_form: HTMLFormElement;
let minecount: HTMLParagraphElement;
let timer: number | undefined = undefined; // Not sure what values are never accepted by window.clearInterval, so just use undefined
let minefield: MineField;
let params: {width: number, height: number, mines: number};
const score_entry: Score = {
	name: "",
	time: 0,
	width: -1,
	height: -1,
	mines: -1,
	rclicks: 0,
	clicks: 0,
	board_score: -1
};

/**
 * Extract coordinates from \<td\>.
 * 
 * @param cell A \<td\> in table.
 * @returns A coordinates object.
 */
function getCoordinatesByTD(cell: HTMLTableCellElement): Coordinates {
	const coord_tuple = cell.id.split(",").map(n => parseInt(n));
	return { x: coord_tuple[0], y: coord_tuple[1] };
}

/**
 * Get cell in minefield via the \<td\>.
 * 
 * Shorthand for minefield.at(getCoordinatesByTD()).
 * 
 * @param cell A \<td\> in table.
 * @returns The corresponding cell in minefield.
 */
function getCellByTD(cell: HTMLTableCellElement): Cell {
	return minefield.at(getCoordinatesByTD(cell));
}

/**
 * Get \<td\> via cell in minefield.
 * 
 * @param cell A cell object in minefield.
 * @returns The corresponding \<td\> in table.
 */
function getTDByCell(cell: Cell | Coordinates): HTMLTableCellElement {
	return table.rows[cell.y].cells[cell.x];
}

/**
 * Install \<td\> event listeners.
 * 
 * @param cell The cell corresponding to the \<td\>.
 */
function installCellEvents(cell: Cell | Coordinates): void {
	const td = getTDByCell(cell); // TODO: Maybe change to accepting td as param?
	td.addEventListener("click", revealCallback);
	td.addEventListener("contextmenu", flag);
}

/**
 * Uninstall \<td\> event listeners.
 *
 * @param cell The cell corresponding to the \<td\>.
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
		unflagged = minefield.mines - minefield.count(c => c.status === "F");
	}
	minecount.textContent = `Mines: ${unflagged}`;
}

/**
 * Show win screen and leaderboard submission.
 */
function win(): void {
	minefield.forEach(c => {
		if (c.status === "F") {
			getTDByCell(c).classList.add("field__cell--correct");
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
 * Updates Cell and \<td\>.
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

	td.classList.remove("field__cell--flagged");
	td.classList.add("field__cell--revealed");
	uninstallCellEvents(cell);
}

/**
 * Callback to reveal a cell (left click).
 * 
 * If the click type is set to flag, calls flag().
 * 
 * @param event The MouseEvent that triggered me.
 */
function revealCallback(event: MouseEvent) {
	// If in flag mode run flag instead
	if (click_form.elements["clicktype"].value === "flag") {
		flag(event);
		return;
	}

	++score_entry.clicks;
	
	const td = event.currentTarget as HTMLTableCellElement;
	const cell = getCellByTD(td);
	
	if (cell.value === 9) {
		// TODO: Replace with mine image
		td.textContent = "M";
		if (cell.status === "F") td.classList.remove("field__cell--flagged");
		td.classList.add("field__cell--wrong");
		lose();

	} else {
		minefield.floodToNumbers(cell, revealCell);
	}
	
	updateMinecount();

	if (minefield.every(c => c.value === 9 || c.status === "R")) win();
}

/**
 * Event handler to flag a cell.
 * 
 * @param event The MouseEvent that triggered me.
 * @returns Boolean indicating failure if the \<td\> is revealed. Success otherwise.
 */
function flag(event: MouseEvent): boolean {
	++score_entry.rclicks;
	event.preventDefault();

	const td = event.currentTarget as HTMLTableCellElement;
	const cell = getCellByTD(td);

	switch (cell.status) {
	case "F":
		cell.status = "U";
		td.classList.remove("field__cell--flagged");
		updateMinecount();
		return true;
	case "U":
		cell.status = "F";
		td.classList.add("field__cell--flagged");
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
	score_entry.name = $("#name").value;

	const replace_link = () => {
		const ld = document.createElement("a");
		ld.href = "leaders.html";
		ld.textContent = "Leaderboard";
		while ($("#end").firstChild) $("#end").removeChild($("#end").firstChild);
		$("#end").appendChild(ld);
	};

	const xhttp = new XMLHttpRequest();
	xhttp.addEventListener("load", () => {
		if (xhttp.status === 200) {
			replace_link();
		} else {
			const leaderboard: Score[] = JSON.parse(localStorage.getItem("leaderboard")) ?? [];

			leaderboard.push(score_entry);

			try {
				localStorage.setItem("leaderboard", JSON.stringify(leaderboard));
				replace_link();
			} catch (e) {
				if (e instanceof DOMException
					&& (e.name === "QuotaExceededError" || e.code === 22)) {
					while ($("#end").firstChild) {
						$("#end").removeChild($("#end").firstChild);
					}
					const error_msg = document.createElement("p");
					error_msg.textContent = "Leaderboard doesn't work here.";
					$("#end").appendChild(error_msg);
				} else {
					throw e;
				}
			}
		}
	});

	xhttp.open("POST", "ud_leaderboard.php", true);
	xhttp.setRequestHeader("Content-Type", "application/json");
	
	xhttp.send(JSON.stringify(score_entry));
}

/**
 * Event handler before minefield has been planted.
 * 
 * Doing it in two steps like this allows exclusion of a specific cell.
 * 
 * @param event The MouseEvent that triggers me.
 */
function populate_board(event: MouseEvent) {
	const td = event.target as HTMLTableCellElement;
	const exclude = getCoordinatesByTD(td);

	// Initialize Board array
	minefield = new MineField(params.width, params.height, exclude, params.mines);

	score_entry.board_score = minefield.score3BV();

	minefield.forEach(installCellEvents);

	// FIXME: might be an error to trigger an event from an event
	// Hopefully the `once` unregisters this first.
	td.click();
}

window.onload = function () {
	// Test for HTTP-GET variables
	const searchParams = (new URL(document.URL)).searchParams;

	params = {
		width: searchParams.has("width") && searchParams.get("width").length > 0 ? parseInt(searchParams.get("width")) : 10,
		height: searchParams.has("height") && searchParams.get("height").length > 0 ? parseInt(searchParams.get("height")) : 10,
		mines: searchParams.has("mines") && searchParams.get("width").length > 0 ? parseInt(searchParams.get("mines")) : null
	};

	const params_form = $("#params") as HTMLFormElement;

	// Param validation
	if (Number.isNaN(params.width) || params.width < 1) {
		params.width = 10;
		params_form.elements["width"].placeholder = params.width;
	} else {
		params_form.elements["width"].value = params.width;
	}

	if (Number.isNaN(params.height) || params.height < 1) {
		params.height = 10;
		params_form.elements["height"].placeholder = params.height;
	} else {
		params_form.elements["height"].value = params.height;
	}

	if (Number.isNaN(params.mines)  || params.mines === null || params.mines >= (params.width * params.height)) {
		const root = Math.floor(Math.sqrt(params.width * params.height));
		params.mines = Math.floor((Math.random() * root) + root);
	} else {
		params_form.elements["mines"].value = params.mines;
	}

	score_entry.height = params.height;
	score_entry.width = params.width;
	score_entry.mines = params.mines;
	score_entry.clicks = 0;
	score_entry.rclicks = 0;

	minecount = $("#minecount") as HTMLParagraphElement;
	click_form = $("#clicktype-form") as HTMLFormElement;

	
	// Replace apology with table
	table = document.createElement("table");
	table.classList.add("field");
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
			data.className = "field__cell";
			table.addEventListener("click", populate_board, { once: true });
		}
	}

	score_entry.time = 0;

	timer = window.setInterval(function () {
		++score_entry.time;
		$("#timer").textContent = `Time - ${formatTime(score_entry.time)}`;
	}, 1000);
    
	updateMinecount(params.mines);
};
