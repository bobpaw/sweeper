/**
 * @file Generates content for rules.html.
 * @author Aiden Woodruff
 */

document.addEventListener("DOMContentLoaded", () => {
	"use strict";

	const $ = document.querySelector.bind(document);

	const template = $("#example-1") as HTMLTemplateElement;

	const clones = Array(7) as DocumentFragment[];
	clones[0] = template.content.cloneNode(true) as DocumentFragment;
	
	clones[1] = clones[0].cloneNode(true) as DocumentFragment;
	let tds = clones[1].querySelectorAll("td");
	tds[4].classList.add("field__cell--revealed");
	tds[4].textContent = "3";

	clones[2] = clones[1].cloneNode(true) as DocumentFragment;
	tds = clones[2].querySelectorAll("td");
	tds[0].classList.add("field__cell--revealed");
	tds[1].classList.add("field__cell--revealed");
	tds[1].textContent = "2";
	tds[3].classList.add("field__cell--revealed");
	tds[3].textContent = "1";

	clones[3] = clones[2].cloneNode(true) as DocumentFragment;
	tds = clones[3].querySelectorAll("td");
	tds[2].classList.add("field__cell--flagged");
	tds[5].classList.add("field__cell--flagged");

	clones[4] = clones[3].cloneNode(true) as DocumentFragment;
	tds = clones[4].querySelectorAll("td");
	tds[6].classList.add("field__cell--mine");
	tds[7].classList.add("field__cell--mine");

	clones[5] = clones[3].cloneNode(true) as DocumentFragment;
	tds = clones[5].querySelectorAll("td");
	tds[8].textContent = "1";
	tds[8].classList.add("field__cell--revealed");

	clones[6] = clones[5].cloneNode(true) as DocumentFragment;
	tds = clones[6].querySelectorAll("td");
	tds[2].classList.add("field__cell--correct");
	tds[5].classList.add("field__cell--correct");
	tds[6].classList.add("field__cell--flagged", "field__cell--correct");
	tds[7].textContent = "2";
	tds[7].classList.add("field__cell--revealed");

	clones.forEach((x, i) => $(`#example-1_${i + 1}`).appendChild(x));
});
