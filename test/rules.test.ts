import { firefox } from "playwright";
import { join } from "path";

import { expect } from "chai";

describe("rules.html", async () => {
	let browser, page;

	before(async () => {
		browser = await firefox.launch({headless: true});
		page = await browser.newPage();
	})
});
(async () => {
	const browser = await firefox.launch({ headless: false });
	const page = await browser.newPage();
	await page.goto(`file://${join(__dirname, "../rules.html")}`);
	await browser.close();
})();
