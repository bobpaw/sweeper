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
			expect(mf.field[6][7].status).to.equal("U");
			mf.at({ x: 7, y: 6 }).status = "R";
			expect(mf.field[6][7].status).to.equal("R");
			mf.at({ x: 7, y: 6 }).status = "U";
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
});
