type CellValue = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
type Coordinates = {x: number, y: number};
type Coordinate_t = [number, number];

class Cell {
  x: number;
  y: number;
  value: CellValue;
  status: "U" | "R" | "F";
  _marked: boolean;

  constructor(value: CellValue, x: number, y: number, status: "U" | "R" | "F" = "U") {
    this.x = x;
    this.y = y;
    this.value = value;
    this.status = status;
    this._marked = false;
  }
}

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
    let coords = Array() as Coordinates[];
    for (let y = 0; y < height; ++y) {
      for (let x = 0; x < width; ++x) {
        if (exclude.x === x && exclude.y === y) continue;
        coords.push({x, y});
      }
    }
    for (let m = 0; m < minecount; ++m) {
      let [mine_coord] = coords.splice(random_int(coords.length), 1);
      this.at(mine_coord).value = 9;
    }

    // Calculate values around mines
    for (let y = 0; y < height; ++y) {
      for (let x = 0; x < width; ++x) {
        if (this.at({x, y}).value === 9) continue;
        this.at({x, y}).value = this.surrounding({x, y}).map((x): number => x.value === 9 ? 1 : 0).reduce((a,b)=>a+b) as CellValue;
      }
    }
  }

  at(location: Coordinates): Cell {
    return this.field[location.y][location.x];
  }

  in_bounds(location: Coordinates): boolean {
    return location.x >= 0 && location.x < this.width && location.y >= 0 && location.y < this.height;
  }

  surrounding(location: Coordinates): Cell[] {
    let ret: Coordinate_t[] = Array() as Coordinate_t[];
    let {x, y} = location;

    ret.push([x - 1, y - 1]); // NW
    ret.push([x, y - 1]); // N
    ret.push([x + 1, y - 1]); // NE
    ret.push([x + 1, y]); // E
    ret.push([x + 1, y + 1]); // SE
    ret.push([x, y + 1]); // S
    ret.push([x - 1, y + 1]); // SW
    ret.push([x - 1, y]); // W

    ret.filter(c => this.in_bounds({x: c[0], y: c[1]}));

    return ret.map(c => this.at({x: c[0], y: c[1]}));
  }

  get width() {
    return this.field[0].length;
  }

  get height() {
    return this.field.length;
  }

  _floodFillEdges(cell: Cell | Coordinates): void {
    let location: Coordinates = {x: cell.x, y: cell.y};

    this.at(location)._marked = true;
    this.surrounding(location).forEach(c => {
      if (c.value === 0) {
        this._floodFillEdges(c);
      } else {
        c._marked = true;
      }
    });
  }

  score3BV(): number {
    let score = 0;
    
    this.field.flat().filter(cell => cell.value === 0).forEach(cell => {
      if (!cell._marked) {
        ++score;
        this._floodFillEdges(cell);
      }
    });

    score += this.field.flat().filter(c => !c._marked && c.value !== 9).length;
    // Who ever heard of .map().reduce()?
    return score;
  }
}

function random_int(max: number): number {
  return Math.floor(Math.random() * max);
}
