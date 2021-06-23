import { expect } from "chai";

import { MineField, Coordinates, Cell } from "../lib/MineField";

describe("MineField", function () {
	const mf = new MineField(10, 10, { x: 4, y: 5 }, 9);

	it("should be 10x10", () => {
		expect(mf.field).to.have.length(10);
		
		for (let i = 0; i < 10; ++i)
			expect(mf.field[i]).to.have.length(10);
	});

	it("should have 9 mines", () => {
		expect(mf.mines).to.equal(9);
	});

	it("should not have a mine at (4, 5)", () => {
		expect(mf.at({ x: 4, y: 5 }).value).to.not.equal(9);
	});

	describe("at(Coordinates)", function () {
		it("should return the same object", () => {
			expect(mf.at({ x: 7, y: 6 })).to.equal(mf.field[6][7]);
		});
	});

	describe("surrounding(Coordinates)", function () {
		it("should return its surroundings", () => {
			const surroundings = mf.surrounding({ x: 4, y: 5 });
			expect(surroundings).to.include(mf.at({ x: 3, y: 5 }));
			expect(surroundings).to.include(mf.at({ x: 3, y: 4 }));
			expect(surroundings).to.include(mf.at({ x: 4, y: 4 }));
			expect(surroundings).to.include(mf.at({ x: 5, y: 4 }));
			expect(surroundings).to.include(mf.at({ x: 5, y: 5 }));
			expect(surroundings).to.include(mf.at({ x: 5, y: 6 }));
			expect(surroundings).to.include(mf.at({ x: 4, y: 6 }));
			expect(surroundings).to.include(mf.at({ x: 3, y: 6 }));
		});

		it("should be able to alter its surroundings", () => {
			mf.surrounding({ x: 4, y: 5 }).forEach(c => c._marked = true);
			expect(mf.surrounding({ x: 4, y: 5 }).filter(c => c._marked)).to.have.length(8);
		});
	
		it("should have only altered its surroundings", () => {
			let count = 0;
			mf.forEach(c => {
				if (c._marked) ++count;
			});
			expect(count).to.equal(8);
		});
	});

	describe("every(pred)", function () {
		it("should all be unrevealed", () => {
			expect(mf.every(c => c.status === "U")).to.be.true;
		});
	});

	describe("score3BV", function () {
		const test_values = [0, 1, 1, 1, 1, 9, 2, 1, 1, 0, 0, 1, 9, 1, 1, 1, 2, 9, 2, 1, 0, 1, 1, 1, 0, 0, 1, 2, 9, 1, 0, 0, 1, 1, 1, 0, 0, 1, 2, 2, 1, 2, 2, 9, 1, 0, 1, 1, 2, 9, 9, 2, 9, 2, 1, 1, 2, 9, 2, 1, 1, 2, 1, 1, 0, 1, 9, 3, 2, 1, 0, 0, 0, 0, 0, 1, 1, 2, 9, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 9, 1, 0, 0, 0, 0, 0, 0, 0, 0] as const;
		const mf3 = new MineField(10, 10, { x: 0, y: 0 }, test_values.filter(v => v === 9).length);
		mf3.forEach(c => {
			c.value = test_values[c.y * mf3.width + c.x];
		});
		expect(mf3.score3BV()).to.equal(20);
	});
});
