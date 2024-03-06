import { Map } from "./map";
import { Snake } from "./snake";

export class Core {
  private speed = 1000;
  private isRunning = false;
  private lastRender = 0;
  private map = new Map();
  public snake = new Snake({
    map: this.map,
  });
  private food: { x: number; y: number } | null = null;
  private score = 0;

  private loop(timestamp = 0) {
    if (!this.isRunning) return;

    if (timestamp - this.lastRender > this.speed) {
      this.snake.move();
      this.verifyCollision();

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

  private generateFood() {
    if (this.food) {
      return;
    }

    const x = Math.floor(Math.random() * this.map.width);
    const y = Math.floor(Math.random() * this.map.height);

    this.food = { x, y };
  }

  private inCreaseSpeed() {
    this.speed *= 0.9;
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
        this.snake.grow();
        this.inCreaseSpeed();
        this.generateFood();
      }
    }

    // Verify collision with snake
    const snake = this.snake.getSnake().filter((i) => !i.isNew);
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

  private render() {
    const canvas = document.getElementById("game") as HTMLCanvasElement;
    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const boxSize = canvas.width / this.map.width;

    for (let i = 0; i < this.map.width; i++) {
      for (let j = 0; j < this.map.height; j++) {
        ctx.strokeRect(i * boxSize, j * boxSize, boxSize, boxSize);
      }
    }

    // Render food
    if (this.food) {
      const { x, y } = this.food;
      ctx.fillStyle = "green";
      ctx.fillRect(x * boxSize, y * boxSize, boxSize, boxSize);
    }

    // Render snake
    const snake = this.snake.getSnake();
    ctx.fillStyle = "black";
    snake.forEach(({ x, y }) => {
      ctx.fillRect(x * boxSize, y * boxSize, boxSize, boxSize);
    });
  }
}
