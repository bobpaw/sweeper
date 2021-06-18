/**
 * @file Generates content for leaders.html.
 * @author Aiden Woodruff
 */

import formatTime from "./formatTime.js";

/**
 * Create an HTML table from a score object.
 * 
 * @param scores An object containing score info.
 * @returns The generated table.
 */
function create_table(scores: any[]): HTMLTableElement {
	const table = document.createElement("table");

	scores.sort((a, b) => a.score / a.time - b.score / b.time);
	for (let i = 0; i < scores.length; i++) {
		const row = table.insertRow();
		for (const part in scores[i]) {
			if (part === "time") {
				row.insertCell().appendChild(document.createTextNode(formatTime(scores[i][part])));
			} else {
				row.insertCell().appendChild(document.createTextNode(scores[i][part].toString()));
			}
		}
	}

	// Inserting the header at the end takes advantage of insertRow() creating
	// a <tbody> for us.
	const thead = table.createTHead();
	const header = thead.insertRow();
	for (const part in scores[0]) {
		const th = document.createElement("th");
		th.appendChild(document.createTextNode(part.replace(/\b\w/g, x => x.toUpperCase())));
		header.appendChild(th);
	}

	return table;
}

window.addEventListener("load", function () {
	let scores = [];
	const xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function () {
		if (this.readyState === 4 && this.status === 200) {
			scores = JSON.parse(this.responseText);
			document.getElementById("content").appendChild(create_table(scores));
		}
	};
	xhttp.open("GET", "leaderboard.json", true);
	xhttp.send();
});
