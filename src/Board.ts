class Board {
  public coordinates: Coordinate[];
  public extraMarks: Record<string, boolean>[][];
  public marks: (Mark | null)[][];
  public rootCoordinates: Record<Mark, Coordinate> = {};

  constructor(public readonly width: number, public readonly height: number) {
    this.marks = Array<null[]>(width)
      .fill(Array<null>(height).fill(null))
      .map((marks) => [...marks]);

    this.extraMarks = this.marks.map((marks) => marks.map(() => ({})));

    this.coordinates = this.marks.reduce<Coordinate[]>(
      (coordinates, marks, x) => coordinates.concat(marks.map((_, y) => [x, y])),
      []
    );
  }

  public checkCoordinateValid([x, y]: Coordinate): boolean {
    return x > -1 && x < this.width && y > -1 && y < this.height;
  }

  public getMark([x, y]: Coordinate): Mark | null {
    return this.marks[x][y];
  }

  public setMark([x, y]: Coordinate, mark: Mark): void {
    this.marks[x][y] = mark;
  }
}

export default Board;
