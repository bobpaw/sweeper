/**
 * @file Generates content for leaders.html.
 * @author Aiden Woodruff
 */

import { formatTime } from "./formatTime.js";
import type { Score } from "./score";

const $: typeof document.querySelector = document.querySelector.bind(document);

document.addEventListener("DOMContentLoaded", () => {
	const scores: Score[] = JSON.parse(localStorage.getItem("leaderboard")) ?? [];

	const template = $("#leaderboard_row") as HTMLTemplateElement;
	scores.sort((a, b) => a.board_score / a.time - b.board_score / b.time);
	for (const row in scores) {
		const clone = template.content.cloneNode(true) as DocumentFragment;
		const datacells = clone.querySelectorAll(".leaderboard__element");

		datacells[0].textContent = scores[row].name;
		datacells[1].textContent = formatTime(scores[row].time);
		datacells[2].textContent = scores[row].width.toString();
		datacells[3].textContent = scores[row].height.toString();
		datacells[4].textContent = scores[row].mines.toString();
		datacells[5].textContent = scores[row].rclicks.toString();
		datacells[6].textContent = scores[row].clicks.toString();
		datacells[7].textContent = scores[row].board_score.toString();

		$("#content").appendChild(clone);
	}
});

/*
window.addEventListener("load", function () {
	let scores: Score[] = [];
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
*/
