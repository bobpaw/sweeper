import formatTime from "./formatTime.js";

/**
 * @param scores
 */
function create_table(scores: any[]) {
	let table = document.createElement("table");

	scores.sort((a, b) => a.score / a.time - b.score / b.time);
	for (let i = 0; i < scores.length; i++) {
		let row = table.insertRow();
		for (let part in scores[i]) {
			if (part === "time") {
				row.insertCell().appendChild(document.createTextNode(formatTime(scores[i][part])));
			} else {
				row.insertCell().appendChild(document.createTextNode(scores[i][part].toString()));
			}
		}
	}

	// Inserting the header at the end takes advantage of insertRow() creating
	// a <tbody> for us.
	let thead = table.createTHead();
	let header = thead.insertRow();
	for (let part in scores[0]) {
		let th = document.createElement("th");
		th.appendChild(document.createTextNode(part.replace(/\b\w/g, x => x.toUpperCase())));
		header.appendChild(th);
	}

	return table;
}

window.addEventListener("load", function () {
	let scores = Array();
	let xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function () {
		if (this.readyState === 4 && this.status === 200) {
			scores = JSON.parse(this.responseText);
			document.getElementById("content").appendChild(create_table(scores));
		}
	};
	xhttp.open("GET", "leaderboard.json", true);
	xhttp.send();
});
