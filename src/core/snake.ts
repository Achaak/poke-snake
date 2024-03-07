import { getDirectionByCoordinates } from "~/utils/getDirectionByCoordinates";
import type { Map } from "./map";
import type { Direction } from "./types";

export class Snake {
  public direction: Direction = "top";
  private map: Map;
  private firstNode: Node | null = null;
  private lastNode: Node | null = null;
  private tempNode: Node | null = null;

  constructor({ map }: { map: Map }) {
    this.map = map;
    this.reset();
  }

  public moveUp() {
    if (!this.firstNode?.nextNode) return;
    if (
      getDirectionByCoordinates(
        this.firstNode.nextNode.x,
        this.firstNode.nextNode.y,
        this.firstNode.x,
        this.firstNode.y,
      ) === "bottom"
    )
      return;

    this.direction = "top";
    console.log("moveUp");
  }

  public moveDown() {
    if (!this.firstNode?.nextNode) return;
    if (
      getDirectionByCoordinates(
        this.firstNode.nextNode.x,
        this.firstNode.nextNode.y,
        this.firstNode.x,
        this.firstNode.y,
      ) === "top"
    )
      return;

    this.direction = "bottom";
    console.log("moveDown");
  }

  public moveLeft() {
    if (!this.firstNode?.nextNode) return;
    if (
      getDirectionByCoordinates(
        this.firstNode.nextNode.x,
        this.firstNode.nextNode.y,
        this.firstNode.x,
        this.firstNode.y,
      ) === "right"
    )
      return;

    this.direction = "left";
    console.log("moveLeft");
  }

  public moveRight() {
    if (!this.firstNode?.nextNode) return;
    if (
      getDirectionByCoordinates(
        this.firstNode.nextNode.x,
        this.firstNode.nextNode.y,
        this.firstNode.x,
        this.firstNode.y,
      ) === "left"
    )
      return;

    this.direction = "right";
    console.log("moveRight");
  }

  public move() {
    if (!this.firstNode) return;

    switch (this.direction) {
      case "top":
        if (this.firstNode.y === 0) {
          this.firstNode.setY(this.map.height - 1);
        } else {
          this.firstNode.setY(this.firstNode.y - 1);
        }
        break;
      case "bottom":
        if (this.firstNode.y === this.map.height - 1) {
          this.firstNode.setY(0);
        } else {
          this.firstNode.setY(this.firstNode.y + 1);
        }
        break;
      case "left":
        if (this.firstNode.x === 0) {
          this.firstNode.setX(this.map.width - 1);
        } else {
          this.firstNode.setX(this.firstNode.x - 1);
        }
        break;
      case "right":
        if (this.firstNode.x === this.map.width - 1) {
          this.firstNode.setX(0);
        } else {
          this.firstNode.setX(this.firstNode.x + 1);
        }
        break;
    }

    this.grow();

    this.updateAllDirections();
  }

  private updateAllDirections() {
    let node: Node | null = this.firstNode;
    while (node) {
      node.updateDirections();
      node = node.nextNode;
    }
  }

  public prepareGrow() {
    if (!this.lastNode) {
      return;
    }

    const { x, y } = this.lastNode.getPosition();
    this.tempNode = new Node({ x, y, prevNode: this.lastNode });
  }

  private grow() {
    if (!this.tempNode || !this.lastNode) {
      return;
    }

    this.lastNode.setNextNode(this.tempNode);
    this.lastNode = this.tempNode;
    this.tempNode = null;
  }

  public getSnake() {
    const snake = [];

    let node = this.firstNode;
    while (node) {
      snake.push(node);
      node = node.nextNode;
    }

    return snake;
  }

  public reset() {
    const firstNode = new Node({
      x: this.map.start.x,
      y: this.map.start.y,
    });
    const secondNode = new Node({
      x: this.map.start.x,
      y: this.map.start.y + 1,
      prevNode: firstNode,
    });
    const thirdNode = new Node({
      x: this.map.start.x,
      y: this.map.start.y + 2,
      prevNode: secondNode,
    });
    secondNode.setNextNode(thirdNode);
    firstNode.setNextNode(secondNode);

    this.firstNode = firstNode;
    this.lastNode = thirdNode;
  }
}

class Node {
  public x: number;
  public y: number;
  public prevNode: Node | null = null;
  public nextNode: Node | null = null;
  public part: "head" | "body" | "tail" | null = null;
  public directions: {
    prev?: Direction;
    next?: Direction;
  } = {};

  constructor({
    x,
    y,
    nextNode,
    prevNode,
  }: {
    x: number;
    y: number;
    nextNode?: Node;
    prevNode?: Node;
  }) {
    this.x = x;
    this.y = y;
    this.nextNode = nextNode ?? null;
    this.prevNode = prevNode ?? null;
    this.updatePart();
    this.updateDirections();
  }

  private updatePart() {
    if (this.prevNode && !this.nextNode) {
      this.part = "tail";
    } else if (!this.prevNode && this.nextNode) {
      this.part = "head";
    } else if (this.prevNode && this.nextNode) {
      this.part = "body";
    }
  }

  public getPosition() {
    return { x: this.x, y: this.y };
  }

  public setPosition({ x, y }: { x: number; y: number }): void {
    if (this.nextNode) {
      this.nextNode.setPosition(this.getPosition());
    }

    this.x = x;
    this.y = y;
  }

  public updateDirections() {
    if (this.prevNode && !this.nextNode) {
      this.directions = {
        prev: getDirectionByCoordinates(
          this.prevNode.x,
          this.prevNode.y,
          this.x,
          this.y,
        ),
        next: undefined,
      };
    } else if (!this.prevNode && this.nextNode) {
      this.directions = {
        prev: undefined,
        next: getDirectionByCoordinates(
          this.x,
          this.y,
          this.nextNode.x,
          this.nextNode.y,
        ),
      };
    } else if (this.prevNode && this.nextNode) {
      this.directions = {
        prev: getDirectionByCoordinates(
          this.x,
          this.y,
          this.prevNode.x,
          this.prevNode.y,
        ),
        next: getDirectionByCoordinates(
          this.x,
          this.y,
          this.nextNode.x,
          this.nextNode.y,
        ),
      };
    }
  }

  public setX(x: number) {
    this.setPosition({ x, y: this.y });
  }

  public setY(y: number) {
    this.setPosition({ x: this.x, y });
  }

  public setNextNode(node: Node) {
    this.nextNode = node;
    this.updatePart();
  }
  public setPrevNode(node: Node) {
    this.prevNode = node;
    this.updatePart();
  }
}
