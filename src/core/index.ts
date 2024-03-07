import { Map } from "./map";
import { Snake } from "./snake";

const assetsUrl = new Image();
assetsUrl.src = "/snake-graphics.png";
const assets = {
  head: {
    bottom: { x: 3 * 64, y: 0, width: 64, height: 64 },
    left: { x: 4 * 64, y: 0, width: 64, height: 64 },
    top: { x: 4 * 64, y: 1 * 64, width: 64, height: 64 },
    right: { x: 3 * 64, y: 1 * 64, width: 64, height: 64 },
  },
  tail: {
    bottom: { x: 3 * 64, y: 2 * 64, width: 64, height: 64 },
    left: { x: 4 * 64, y: 2 * 64, width: 64, height: 64 },
    top: { x: 4 * 64, y: 3 * 64, width: 64, height: 64 },
    right: { x: 3 * 64, y: 3 * 64, width: 64, height: 64 },
  },
  section: {
    vertical: { x: 2 * 64, y: 1 * 64, width: 64, height: 64 },
    horizontal: { x: 1 * 64, y: 0, width: 64, height: 64 },
    bottomRight: { x: 0, y: 0, width: 64, height: 64 },
    bottomLeft: { x: 2 * 64, y: 0, width: 64, height: 64 },
    topRight: { x: 0, y: 1 * 64, width: 64, height: 64 },
    topLeft: { x: 2 * 64, y: 2 * 64, width: 64, height: 64 },
  },
  apple: { x: 0, y: 3 * 64, width: 64, height: 64 },
};

type Options = {
  enableCollision?: boolean;
  callback?: {
    onMove?: () => void;
  };
};

export class Core {
  private speed = 500;
  private isRunning = false;
  private lastRender = 0;
  private map = new Map();
  public snake = new Snake({
    map: this.map,
  });
  private food: { x: number; y: number } | null = null;
  public score = 0;
  public distances: {
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
  } = {
    top: undefined,
    bottom: undefined,
    left: undefined,
    right: undefined,
  };
  public options: Options;

  constructor(options: Options = {}) {
    this.options = {
      enableCollision: true,
      ...options,
    };
  }

  private loop(timestamp = 0) {
    if (!this.isRunning) return;

    if (timestamp - this.lastRender > this.speed) {
      this.snake.move();
      this.getDistancesToFood();
      this.verifyCollision();
      this.options.callback?.onMove?.();

      // Render game
      this.render();

      this.lastRender = timestamp;
    }

    window.requestAnimationFrame(this.loop.bind(this));
  }

  public start() {
    this.generateFood();
    this.isRunning = true;
    this.loop();
  }

  public stop() {
    this.isRunning = false;
  }

  private generateFood(): void {
    if (this.food) {
      return;
    }

    const x = Math.floor(Math.random() * this.map.width);
    const y = Math.floor(Math.random() * this.map.height);

    if (this.snake.getSnake().some((i) => i.x === x && i.y === y)) {
      return this.generateFood();
    } else {
      this.food = { x, y };
    }
  }

  private inCreaseSpeed() {
    this.speed *= 0.9;
  }

  public getDistanceToFood(x: number, y: number) {
    if (!this.food) return 0;

    return Math.min(
      Math.abs(x - this.food.x) + Math.abs(y - this.food.y),
      Math.abs(x - this.food.x + this.map.width) + Math.abs(y - this.food.y),
      Math.abs(x - this.food.x) + Math.abs(y - this.food.y + this.map.height),
      Math.abs(x - this.food.x - this.map.width) + Math.abs(y - this.food.y),
      Math.abs(x - this.food.x) + Math.abs(y - this.food.y - this.map.height),
    );
  }

  public getDistancesToFood() {
    if (!this.food) return;

    const snake = this.snake.getSnake();
    const head = snake[0];

    if (!head) return;

    const snakeDirections = this.snake.direction;

    this.distances = {
      top:
        snakeDirections === "bottom"
          ? undefined
          : this.getDistanceToFood(head.x, head.y - 1),
      bottom:
        snakeDirections === "top"
          ? undefined
          : this.getDistanceToFood(head.x, head.y + 1),
      left:
        snakeDirections === "right"
          ? undefined
          : this.getDistanceToFood(head.x - 1, head.y),
      right:
        snakeDirections === "left"
          ? undefined
          : this.getDistanceToFood(head.x + 1, head.y),
    };
  }

  private verifyCollision() {
    // Verify collision with food
    if (this.food) {
      const snake = this.snake.getSnake();

      const head = snake[0];

      if (!head) return;

      if (head.x === this.food.x && head.y === this.food.y) {
        this.food = null;
        this.score += 1;
        this.snake.prepareGrow();
        this.inCreaseSpeed();
        this.generateFood();
      }
    }

    // Verify collision with snake
    if (this.options.enableCollision) {
      const snake = this.snake.getSnake();
      const head = snake[0];

      if (!head) return;

      for (let i = 1; i < snake.length; i++) {
        const part = snake[i]!;

        if (head.x === part.x && head.y === part.y) {
          this.stop();
          alert("Game Over");
        }
      }
    }
  }

  private render() {
    const canvas = document.getElementById("game") as HTMLCanvasElement;
    const boxSize = canvas.width / this.map.width;
    const ctx = canvas.getContext("2d", {
      alpha: false,
    });

    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < this.map.width; i++) {
      for (let j = 0; j < this.map.height; j++) {
        if ((i + j) % 2 === 0) {
          ctx.fillStyle = "#add05a";
          ctx.fillRect(i * boxSize, j * boxSize, boxSize, boxSize);
        } else {
          ctx.fillStyle = "#a1c750";
          ctx.fillRect(i * boxSize, j * boxSize, boxSize, boxSize);
        }
      }
    }

    // Render food
    if (this.food) {
      const { x, y } = this.food;
      ctx.drawImage(
        assetsUrl,
        assets.apple.x,
        assets.apple.y,
        assets.apple.width,
        assets.apple.height,
        x * boxSize,
        y * boxSize,
        boxSize,
        boxSize,
      );
    }

    // Render snake
    const snake = this.snake.getSnake();
    [...snake].reverse().forEach(({ x, y, directions, part }) => {
      if (part === "head") {
        const direction = directions.next ?? "top";
        ctx.drawImage(
          assetsUrl,
          assets.head[direction].x,
          assets.head[direction].y,
          assets.head[direction].width,
          assets.head[direction].height,
          x * boxSize,
          y * boxSize,
          boxSize,
          boxSize,
        );
      } else if (part === "tail") {
        const direction = directions.prev ?? "top";
        ctx.drawImage(
          assetsUrl,
          assets.tail[direction].x,
          assets.tail[direction].y,
          assets.tail[direction].width,
          assets.tail[direction].height,
          x * boxSize,
          y * boxSize,
          boxSize,
          boxSize,
        );
      } else {
        if (
          (directions.prev === "top" && directions.next === "bottom") ||
          (directions.prev === "bottom" && directions.next === "top")
        ) {
          ctx.drawImage(
            assetsUrl,
            assets.section.vertical.x,
            assets.section.vertical.y,
            assets.section.vertical.width,
            assets.section.vertical.height,
            x * boxSize,
            y * boxSize,
            boxSize,
            boxSize,
          );
        } else if (
          (directions.prev === "left" && directions.next === "right") ||
          (directions.prev === "right" && directions.next === "left")
        ) {
          ctx.drawImage(
            assetsUrl,
            assets.section.horizontal.x,
            assets.section.horizontal.y,
            assets.section.horizontal.width,
            assets.section.horizontal.height,
            x * boxSize,
            y * boxSize,
            boxSize,
            boxSize,
          );
        } else if (
          (directions.prev === "top" && directions.next === "right") ||
          (directions.prev === "right" && directions.next === "top")
        ) {
          ctx.drawImage(
            assetsUrl,
            assets.section.topRight.x,
            assets.section.topRight.y,
            assets.section.topRight.width,
            assets.section.topRight.height,
            x * boxSize,
            y * boxSize,
            boxSize,
            boxSize,
          );
        } else if (
          (directions.prev === "top" && directions.next === "left") ||
          (directions.prev === "left" && directions.next === "top")
        ) {
          ctx.drawImage(
            assetsUrl,
            assets.section.topLeft.x,
            assets.section.topLeft.y,
            assets.section.topLeft.width,
            assets.section.topLeft.height,
            x * boxSize,
            y * boxSize,
            boxSize,
            boxSize,
          );
        } else if (
          (directions.prev === "bottom" && directions.next === "right") ||
          (directions.prev === "right" && directions.next === "bottom")
        ) {
          ctx.drawImage(
            assetsUrl,
            assets.section.bottomRight.x,
            assets.section.bottomRight.y,
            assets.section.bottomRight.width,
            assets.section.bottomRight.height,
            x * boxSize,
            y * boxSize,
            boxSize,
            boxSize,
          );
        } else if (
          (directions.prev === "bottom" && directions.next === "left") ||
          (directions.prev === "left" && directions.next === "bottom")
        ) {
          ctx.drawImage(
            assetsUrl,
            assets.section.bottomLeft.x,
            assets.section.bottomLeft.y,
            assets.section.bottomLeft.width,
            assets.section.bottomLeft.height,
            x * boxSize,
            y * boxSize,
            boxSize,
            boxSize,
          );
        }
      }
    });

    // Draw distance to food
    if (snake[0]) {
      ctx.fillStyle = "black";
      ctx.font = "20px Arial";
      ctx.fillText(`Top: ${this.distances.top}`, 10, 30);
      ctx.fillText(`Bottom: ${this.distances.bottom}`, 10, 60);
      ctx.fillText(`Left: ${this.distances.left}`, 10, 90);
      ctx.fillText(`Right: ${this.distances.right}`, 10, 120);
    }
  }
}
