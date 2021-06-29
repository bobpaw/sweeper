/**
 * @file MineField class and private methods.
 * @author Aiden Woodruff
 */

/** @module MineField.js */

type CellValue = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
type Coordinates = {x: number, y: number};

class Cell {
	x: number;
	y: number;
	value: CellValue;
	status: "U" | "R" | "F";

	constructor(value: CellValue, x: number, y: number, status: "U" | "R" | "F" = "U") {
		this.x = x;
		this.y = y;
		this.value = value;
		this.status = status;
	}
}

/**
 * @class 
 */
class MineField {
	field: Cell[][];
	mines: number;

	constructor(width: number, height: number, exclude: Coordinates, minecount: number) {
		this.mines = minecount;

		this.field = Array(height);
		for (let y = 0; y < height; ++y) {
			this.field[y] = Array(width);
			for (let x = 0; x < width; ++x) {
				this.field[y][x] = new Cell(0, x, y);
			}
		}

		// Add mines to the field
		const coords = [] as Coordinates[];
		for (let y = 0; y < height; ++y) {
			for (let x = 0; x < width; ++x) {
				if (exclude.x === x && exclude.y === y) continue;
				coords.push({ x, y });
			}
		}
		for (let m = 0; m < minecount; ++m) {
			const [mine_coord] = coords.splice(random_int(coords.length), 1);
			this.at(mine_coord).value = 9;
		}

		// Calculate values around mines
		this.forEach(cell => {
			if (cell.value !== 9)
				cell.value = this.surrounding(cell).filter(c => c.value === 9).length as CellValue;
		});
	}

	at(location: Coordinates): Cell {
		return this.field[location.y][location.x];
	}

	in_bounds(location: Coordinates): boolean {
		return location.x >= 0 && location.x < this.width && location.y >= 0 && location.y < this.height;
	}

	surrounding(location: Coordinates): Cell[] {
		const ret = [] as Coordinates[];
		const { x, y } = location;

		ret.push({ x: x - 1, y: y - 1 }); // NW
		ret.push({ x, y: y - 1 }); // N
		ret.push({ x: x + 1, y: y - 1 }); // NE
		ret.push({ x: x + 1, y }); // E
		ret.push({ x: x + 1, y: y + 1 }); // SE
		ret.push({ x, y: y + 1 }); // S
		ret.push({ x: x - 1, y: y + 1 }); // SW
		ret.push({ x: x - 1, y }); // W

		return ret.filter(c => this.in_bounds(c)).map(c => this.at(c));
	}

	get width(): number {
		return this.field[0].length;
	}

	get height(): number {
		return this.field.length;
	}

	floodToNumbers(cell: Cell, func: (c: Cell) => void): void {
		const visited = [] as Cell[];

		const _flood = (c: Cell) => {
			visited.push(c);
			func(c);

			if (c.value === 0)
				this.surrounding(c).forEach(x => {
					if (!visited.includes(x))	_flood(x);
				});
		};

		_flood(cell);
	}

	/**
	 * Calculate the 3BV board score.
	 * 
	 * Caches value for later use.
	 * 
	 * @returns This board's score.
	 */
	score3BV(): number {
		let score = 0;
		
		const marked_list: boolean[] = Array(this.width * this.height);

		const marker = (c: Coordinates) => c.y * this.width + c.x;
		const marked = (c: Coordinates) => marked_list[marker(c)];
		const mark = (c: Coordinates) => marked_list[marker(c)] = true;

		this.forEach(c => marked_list[marker(c)] = false);
		this.forEach(cell => {
			if (cell.value === 0 && !marked(cell)) {
				++score;
				this.floodToNumbers(cell, c => { mark(c); });
			}
		});

		score += this.count(c => !marked(c) && c.value !== 9);
		return score;
	}

	/**
	 * Execute a function for each cell.
	 * 
	 * @param func A function taking the cell as an argument.
	 */
	forEach(func: (cell: Cell) => void): void {
		// TODO: Implement a thisArg if necessary.
		for (let y = 0; y < this.height; ++y) {
			for (let x = 0; x < this.width; ++x) {
				func(this.at({ x, y }));
			}
		}
	}

	/**
	 * Test if an expression is true for every cell.
	 * 
	 * @param pred A function taking a cell that returns a boolean value.
	 * @returns A boolean indicating if pred() was true for each cell.
	 */
	every(pred: (cell: Cell) => boolean): boolean {
		let ret = true;
		for (let y = 0; ret && y < this.height; ++y) {
			for (let x = 0; ret && x < this.width; ++x) {
				ret = pred(this.at({ x, y }));
			}
		}
		return ret;
	}

	count(pred: (cell: Cell) => boolean): number {
		let count = 0;
		this.forEach(c => { if (pred(c)) ++count; });
		return count;
	}
}

/**
 * Get a random integer from [0, max).
 *
 * @param max The maximum value in the distribution. Exclusive.
 * @returns A random integer.
 */
function random_int(max: number): number {
	return Math.floor(Math.random() * max);
}

export { Cell, Coordinates, MineField };
