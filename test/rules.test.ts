import { firefox } from "playwright";
import { join } from "path";

(async () => {
	const browser = await firefox.launch();
	const page = await browser.newPage();
	await page.goto(`file://${join(__dirname, "../rules.html")}`);
	await browser.close();
})();
