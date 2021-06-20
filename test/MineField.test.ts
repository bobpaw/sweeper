import { expect } from "chai";

import { MineField, Coordinates, Cell } from "../lib/MineField";

describe("MineField", function () {
	const mf = new MineField(10, 10, { x: 4, y: 5 }, 9);

	it("should be 10x10", () => {
		expect(mf.field.length).to.equal(10);
		
		for (let i = 0; i < 10; ++i)
			expect(mf.field[i].length).to.equal(10);
	});

	it("should have 9 mines", () => {
		expect(mf.mines).to.equal(9);
	});

	it("should not have a mine at (4, 5)", () => {
		expect(mf.at({ x: 4, y: 5 }).value).to.not.equal(9);
	});
});
