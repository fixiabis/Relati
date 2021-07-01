import ClassicJudge from '../classic/Judge';
import Board from '../shared/Board/Board';
import SquareOfBoard from '../shared/Board/SquareOfBoard';
import { PATHS } from '../shared/constants/directional';

class Judge extends ClassicJudge {
  public getSquaresByPaths(square: SquareOfBoard): SquareOfBoard[][] {
    return PATHS.map((path) => path.map((coordinate) => square.to(coordinate))).filter(
      (squares): squares is SquareOfBoard[] => squares.every((square) => square !== null)
    );
  }

  public getSquaresOfRoot(board: Board): SquareOfBoard[] {
    return Object.keys(board.marks)
      .map((mark) => board.marks[mark as Mark].squareOfRoot)
      .filter((squareOfRoot) => squareOfRoot);
  }

  public getSquaresMayBeUnlinked(board: Board): SquareOfBoard[] {
    return this.getSquares(board).filter(
      (square) => square.mark !== ' ' && !square.stateOfMark.isRoot
    );
  }

  public judgeSquareCanBeSender(square: SquareOfBoard, mark: Mark): boolean {
    return square.mark === mark && !square.stateOfMark.isUnlinked;
  }

  public judgeSquareCanBeReceiver(square: SquareOfBoard, mark: Mark): boolean {
    return square.mark === mark;
  }

  public judgeSquareIsUnBlocked(square: SquareOfBoard): boolean {
    return square.mark === ' ';
  }

  public judgeSquareCanLink(square: SquareOfBoard, mark: Mark): boolean {
    const squares = this.getSquaresByPaths(square);
    return squares.some((squares) => this.judgeSquaresOfPathCanSend(squares, mark));
  }

  public judgeSquaresOfPathCanSend(squares: SquareOfBoard[], mark: Mark): boolean {
    const [square, ...otherSquares] = squares;

    return (
      this.judgeSquareCanBeSender(square, mark) &&
      otherSquares.every((square) => this.judgeSquareIsUnBlocked(square))
    );
  }

  public judgeSquaresOfPathCanReceive(squares: SquareOfBoard[], mark: Mark): boolean {
    const [square, ...otherSquares] = squares;

    return (
      this.judgeSquareCanBeReceiver(square, mark) &&
      otherSquares.every((square) => this.judgeSquareIsUnBlocked(square))
    );
  }

  public findSquaresOfPathCanSend(squares: SquareOfBoard[][], mark: Mark): SquareOfBoard[][] {
    return squares.filter((squares) => this.judgeSquaresOfPathCanSend(squares, mark));
  }

  public findSquaresOfPathCanReceive(squares: SquareOfBoard[][], mark: Mark): SquareOfBoard[][] {
    return squares.filter((squares) => this.judgeSquaresOfPathCanReceive(squares, mark));
  }
}

export default Judge;
