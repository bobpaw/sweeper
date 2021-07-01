const readdirp = require("readdirp");
const { minify } = require("terser");
const { readFileSync, writeFileSync } = require("fs");
const path = require("path");

const stream = readdirp("lib", {
	fileFilter: ["*.js", "!*.min.js"],
});

stream.on("data", async entry => {
	const filename = path.join(__dirname, "../lib", entry.path);
	console.log("filename: " + filename);
	minify(readFileSync(filename, "utf8")).then(output => {
		writeFileSync(filename.replace(/\.js$/, ".min.js"), output.code, "utf8");
	}).catch(error => {
		console.log(`minifiy error (${error.name}): ${error.message}`);
	});
});

  stream

stream.on("warn", error => {
	console.error(`warning (${error.name}): ${error.message}`);
});

stream.on("error", error => {
	console.error(`fatal error (${error.name}): ${error.message}`);
});

stream.on("end", () => {
	console.log("Done.");
});
