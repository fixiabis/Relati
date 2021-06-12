import Board from './Board';
import { CLASSIC_PATHS, MODERN_PATHS } from './constants/paths';
import CannonAttack from './interfaces/CannonAttack';
import CannonChange from './interfaces/CannonChange';
import JudgeOptions from './interfaces/JudgeOptions';
import Link from './interfaces/Link';
import Placement from './interfaces/Placement';
import Player from './Player';

class Judge {
  protected paths: Coordinate[][];

  constructor(protected options: JudgeOptions) {
    this.paths = options.linkMode === 'classic' ? CLASSIC_PATHS : MODERN_PATHS;
  }

  public checkGridEmpty(board: Board, [x, y]: Coordinate): boolean {
    return board.marks[x][y] === null;
  }

  public checkGridHasSameMark(board: Board, mark: Mark, [x, y]: Coordinate): boolean {
    return board.marks[x][y] === mark;
  }

  public checkGridCanBeSource(board: Board, [x, y]: Coordinate) {
    const { isMissingNode, isCannonNode, isDeadNode } = board.extraMarks[x][y];
    return !(isMissingNode || isCannonNode || isDeadNode);
  }

  public checkGridCanBeTarget(board: Board, [x, y]: Coordinate) {
    const { isDeadNode } = board.extraMarks[x][y];
    return !isDeadNode;
  }

  public checkGridCanPass(board: Board, [x, y]: Coordinate): boolean {
    return board.marks[x][y] === null || board.extraMarks[x][y].isDeadNode;
  }

  public checkGridCanBeCannon(board: Board, [x, y]: Coordinate) {
    const { isMissingNode, isCannonNode, isDeadNode, isRoot } = board.extraMarks[x][y];
    return !(isMissingNode || isCannonNode || isDeadNode || isRoot);
  }

  public checkGridCanFireCannon(board: Board, [x, y]: Coordinate) {
    const { isCannonNode, isUsedCannonNode } = board.extraMarks[x][y];
    return isCannonNode && !isUsedCannonNode;
  }

  public checkPlacementConditionReached(placement: Placement): boolean {
    const { board, coordinate, mark } = placement;
    const isGridEmpty = this.checkGridEmpty(board, coordinate);
    const isAnySameMarkOnBoard = mark in board.rootCoordinates;
    const isReachedLinkCondition = this.checkLinkConditionReached.bind(this, placement);
    return isGridEmpty && (isReachedLinkCondition() || !isAnySameMarkOnBoard);
  }

  public checkPlayerCanTakeAction(board: Board, player: Player): boolean {
    const toPlacement = player.takePlacement.bind(player, board);
    const isPlacementConditionReached = this.checkPlacementConditionReached.bind(this);
    return board.coordinates.map(toPlacement).some(isPlacementConditionReached);
  }

  public getMovedCoordinate([x, y]: Coordinate, [dx, dy]: Coordinate): Coordinate {
    return [x + dx, y + dy];
  }

  public checkLinkConditionReached(link: Link): boolean {
    const { board, coordinate, mark } = link;
    const isPathValid = this.checkPathValid.bind(this, board);
    const isPathAvailable = this.checkPathAvailableToSource.bind(this, board, mark);
    const toMovedPath = this.getMovedPath.bind(this, coordinate);
    return this.paths.map(toMovedPath).filter(isPathValid).some(isPathAvailable);
  }

  public checkPathAvailableToSource(board: Board, mark: Mark, path: Coordinate[]): boolean {
    const [coordinate, ...otherCoordinates] = path;

    return (
      this.checkGridCanBeSource(board, coordinate) &&
      this.checkGridHasSameMark(board, mark, coordinate) &&
      otherCoordinates.every(this.checkGridCanPass.bind(this, board))
    );
  }

  public checkPathAvailableToTarget(board: Board, mark: Mark, path: Coordinate[]): boolean {
    const [coordinate, ...otherCoordinates] = path;

    return (
      this.checkGridCanBeTarget(board, coordinate) &&
      this.checkGridHasSameMark(board, mark, coordinate) &&
      otherCoordinates.every(this.checkGridCanPass.bind(this, board))
    );
  }

  public checkPathValid(board: Board, path: Coordinate[]): boolean {
    return path.every(board.checkCoordinateValid.bind(board));
  }

  public getMovedPath(coordinate: Coordinate, path: Coordinate[]): Coordinate[] {
    return path.map((direction) => this.getMovedCoordinate(coordinate, direction));
  }

  public getLinkConditionReachedPathsForTarget(link: Link): Coordinate[][] {
    const { board, coordinate, mark } = link;
    const isPathValid = this.checkPathValid.bind(this, board);
    const isPathAvailable = this.checkPathAvailableToTarget.bind(this, board, mark);
    const toMovedPath = this.getMovedPath.bind(this, coordinate);
    return this.paths.map(toMovedPath).filter(isPathValid).filter(isPathAvailable);
  }

  public getMarkedCoordinates(board: Board): Coordinate[] {
    return board.coordinates.filter(([x, y]) => board.marks[x][y] !== null);
  }

  public updateBoardExtraMarks(board: Board): void {
    if (this.options.linkMode === 'classic') {
      return;
    }

    const sourceCoordinates = this.getInitialSourceCoordinates(board);
    const markedCoordinates = this.getMarkedCoordinates(board);

    for (const [x, y] of markedCoordinates) {
      board.extraMarks[x][y].isMissingNode = false;
      board.extraMarks[x][y].isMissingNodeMaybe = true;
    }

    for (const sourceCoordinate of sourceCoordinates) {
      const [sourceX, sourceY] = sourceCoordinate;
      const mark = board.marks[sourceX][sourceY] as string;
      const link = { board, coordinate: sourceCoordinate, mark };
      const paths = this.getLinkConditionReachedPathsForTarget(link);
      const targetPaths = paths.filter(([[x, y]]) => board.extraMarks[x][y].isMissingNodeMaybe);

      board.extraMarks[sourceX][sourceY].isMissingNodeMaybe = false;

      for (const [coordinate] of targetPaths) {
        const [x, y] = coordinate;
        board.extraMarks[x][y].isMissingNodeMaybe = false;

        if (this.checkGridCanBeSource(board, coordinate)) {
          sourceCoordinates.push(coordinate);
        }
      }
    }

    for (const [x, y] of markedCoordinates) {
      const extraMark = board.extraMarks[x][y];

      extraMark.isMissingNode = extraMark.isMissingNodeMaybe;
      delete extraMark.isMissingNodeMaybe;

      if (extraMark.isCannonNode && extraMark.isMissingNode) {
        extraMark.isDeadNode = true;
      }
    }
  }

  public getInitialSourceCoordinates(board: Board): Coordinate[] {
    const coordinates = [];

    for (const mark in board.rootCoordinates) {
      const coordinate = board.rootCoordinates[mark];
      const [x, y] = coordinate;

      if (!board.extraMarks[x][y].isDeadNode) {
        coordinates.push(coordinate);
      }
    }

    return coordinates;
  }

  public updatePlayerActionsRemaining(board: Board, prevBoard: Board, player: Player): void {
    if (!this.options.canUseComboAction) {
      return;
    }

    const missingNodesChanged = this.getMissingNodesChanged(board, prevBoard);
    const extraActionsRemaining = this.calcExtraActionsRemaining(missingNodesChanged, player.mark);

    player.actionsRemaining += -1 + extraActionsRemaining;
  }

  public calcExtraActionsRemaining(missingNodesChanged: Record<Mark, number>, playerMark: Mark) {
    let extraActionsRemaining = 0;

    for (const mark in missingNodesChanged) {
      if (mark !== playerMark && missingNodesChanged[mark] > 0) {
        extraActionsRemaining++;
      }
    }

    if (missingNodesChanged[playerMark] < 0) {
      extraActionsRemaining++;
    }

    return extraActionsRemaining;
  }

  public getMissingNodesChanged(board: Board, prevBoard: Board): Record<Mark, number> {
    const missingNodesChanged: Record<Mark, number> = {};

    for (const mark in board.rootCoordinates) {
      missingNodesChanged[mark] = 0;
    }

    const prevMarkedCoordinates = this.getMarkedCoordinates(prevBoard);

    for (const [x, y] of prevMarkedCoordinates) {
      const mark = prevBoard.marks[x][y]!;
      const isMissingNode = prevBoard.extraMarks[x][y].isMissingNode;

      if (isMissingNode) {
        missingNodesChanged[mark]--;
      }
    }

    const markedCoordinates = this.getMarkedCoordinates(board);

    for (const [x, y] of markedCoordinates) {
      const mark = board.marks[x][y]!;
      const isMissingNode = board.extraMarks[x][y].isMissingNode;

      if (isMissingNode) {
        missingNodesChanged[mark]++;
      }
    }

    return missingNodesChanged;
  }

  public checkCannonChangeConditionReached(cannonChange: CannonChange): boolean {
    if (!this.options.canUseCannon) {
      return false;
    }

    const { board, coordinate, mark } = cannonChange;
    const isGridHasSameMark = this.checkGridHasSameMark(board, mark, coordinate);
    const isGridCanBeCannon = this.checkGridCanBeCannon(board, coordinate);
    return isGridHasSameMark && isGridCanBeCannon;
  }

  public getCannonAttackTargetCoordinate(cannonAttack: CannonAttack): Coordinate | null {
    if (!this.options.canUseCannon) {
      return null;
    }

    const { board, coordinate, direction, mark } = cannonAttack;
    const isGridHasSameMark = this.checkGridHasSameMark(board, mark, coordinate);
    const isGridCanFireCannon = this.checkGridCanFireCannon(board, coordinate);

    if (!isGridHasSameMark || !isGridCanFireCannon) {
      return null;
    }

    let targetCoordinate = this.getMovedCoordinate(coordinate, direction);

    while (board.checkCoordinateValid(targetCoordinate)) {
      if (!this.checkGridCanPass(board, targetCoordinate)) {
        if (this.checkGridHasSameMark(board, mark, targetCoordinate)) {
          return null;
        }

        return targetCoordinate;
      }

      targetCoordinate = this.getMovedCoordinate(targetCoordinate, direction);
    }

    return null;
  }
}

export default Judge;
