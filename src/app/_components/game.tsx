"use client";

import type { FC } from "react";
import { Core } from "~/core";
import { Brain } from "~/core/brain";
import { useKeyPress } from "~/hooks/useKeyPress";

const brain = new Brain();
const coreGame = new Core({
  enableCollision: false,
  callback: {
    onMove: () => {
      const t = brain.predict({
        distances: coreGame.distances,
        direction: coreGame.snake.direction,
        score: coreGame.score,
      });

      switch (t) {
        case "top":
          coreGame.snake.moveUp();
          break;
        case "bottom":
          coreGame.snake.moveDown();
          break;
        case "left":
          coreGame.snake.moveLeft();
          break;
        case "right":
          coreGame.snake.moveRight();
          break;
      }
    },
  },
});

export const Game: FC = () => {
  useKeyPress("ArrowUp", {
    callback: () => coreGame.snake.moveUp(),
  });
  useKeyPress("ArrowDown", {
    callback: () => coreGame.snake.moveDown(),
  });
  useKeyPress("ArrowLeft", {
    callback: () => coreGame.snake.moveLeft(),
  });
  useKeyPress("ArrowRight", {
    callback: () => coreGame.snake.moveRight(),
  });

  return (
    <div>
      <canvas
        id="game"
        width={64 * 11}
        height={64 * 11}
        className="border border-black"
      />
      <button onClick={() => coreGame.start()}>Start</button>
      <button onClick={() => brain.train()}>Start train</button>
    </div>
  );
};
