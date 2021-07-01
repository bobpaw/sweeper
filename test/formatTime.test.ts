import { expect } from "chai";  // Using Expect style

import { formatTime } from "../lib/formatTime";

describe("formatTime", () => {
	it("should return '0:13'", () => {
		expect(formatTime(13)).to.equal("0:13");
	});
	it("should return '1:05'", () => {
		expect(formatTime(65)).to.equal("1:05");
	});
	it("should return '1:01:46'", () => {
		expect(formatTime(3706)).to.equal("1:01:46");
	});
});
