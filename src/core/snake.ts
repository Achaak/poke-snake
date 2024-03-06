import type { Map } from "./map";

export class Snake {
  private direction: "top" | "bottom" | "left" | "right" = "top";
  private map: Map;
  private firstNode: Node | null = null;
  private lastNode: Node | null = null;

  constructor({ map }: { map: Map }) {
    this.map = map;
    this.reset();
  }

  public initController() {
    console.log("initController");
  }

  public moveUp() {
    this.direction = "top";
    console.log("moveUp");
  }

  public moveDown() {
    this.direction = "bottom";
    console.log("moveDown");
  }

  public moveLeft() {
    this.direction = "left";
    console.log("moveLeft");
  }

  public moveRight() {
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
  }

  public grow() {
    if (!this.lastNode) {
      return;
    }

    const { x, y } = this.lastNode.getPosition();
    this.lastNode.nextNode = new Node({ x, y });
    this.lastNode = this.lastNode.nextNode;
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
    this.firstNode = new Node({ x: this.map.start.x, y: this.map.start.y });
    this.lastNode = this.firstNode;
  }
}

class Node {
  public x: number;
  public y: number;
  public nextNode: Node | null = null;
  public isNew = true;

  constructor({ x, y, nextNode }: { x: number; y: number; nextNode?: Node }) {
    this.x = x;
    this.y = y;
    this.nextNode = nextNode ?? null;
  }

  public getPosition() {
    return { x: this.x, y: this.y };
  }

  public setPosition({ x, y }: { x: number; y: number }) {
    if (this.nextNode) {
      this.nextNode.setPosition(this.getPosition());
    }

    this.x = x;
    this.y = y;

    this.isNew = false;
  }

  public setX(x: number) {
    this.setPosition({ x, y: this.y });
  }

  public setY(y: number) {
    this.setPosition({ x: this.x, y });
  }
}
