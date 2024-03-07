import * as tf from "@tensorflow/tfjs";
import type { Direction } from "./types";

const DIRECTIONS = ["top", "bottom", "left", "right"];

export class Brain {
  model: tf.Sequential;
  data: {
    direction: Direction;
    distances: {
      top?: number;
      bottom?: number;
      left?: number;
      right?: number;
    };
    score: number;
  }[] = [];

  constructor() {
    this.model = tf.sequential();

    this.model.add(tf.layers.dense({ units: 4, inputShape: [4] }));
    this.model.add(tf.layers.dense({ units: 4 }));
  }

  async train() {
    const x = this.data.map((item) => [
      item.distances.top ?? 0,
      item.distances.bottom ?? 0,
      item.distances.left ?? 0,
      item.distances.right ?? 0,
    ]);
    const y = this.data.map((item) => DIRECTIONS.indexOf(item.direction));

    const xTensor = tf.tensor2d(x, [this.data.length, 4]);
    const yTensor = tf.oneHot(tf.tensor1d(y, "int32"), 4);

    const xMax = xTensor.max();
    const xMin = xTensor.min();
    const yMax = yTensor.max();
    const yMin = yTensor.min();

    const normalizedX = xTensor.sub(xMin).div(xMax.sub(xMin));
    const normalizedY = yTensor.sub(yMin).div(yMax.sub(yMin));

    this.model.compile({
      optimizer: tf.train.adam(),
      loss: tf.losses.meanSquaredError,
      metrics: ["mse"],
    });

    return await this.model.fit(normalizedX, normalizedY, {
      batchSize: 32,
      epochs: 50,
      shuffle: true,
      callbacks: {
        onEpochEnd: (epoch, logs) => {
          console.log("Epoch: " + epoch + " Loss: " + logs?.loss);
        },
      },
    });
  }

  predict({
    direction,
    distances,
    score,
  }: {
    direction: Direction;
    distances: {
      top?: number;
      bottom?: number;
      left?: number;
      right?: number;
    };
    score: number;
  }) {
    this.data.push({ direction, distances, score });

    const distancesTensor = tf.tensor2d(
      [
        distances.top ?? 0,
        distances.bottom ?? 0,
        distances.left ?? 0,
        distances.right ?? 0,
      ],
      [1, 4],
    );
    const distanceMax = distancesTensor.max();
    const distanceMin = distancesTensor.min();
    const normalizedDistances = distancesTensor
      .sub(distanceMin)
      .div(distanceMax.sub(distanceMin));

    const result = this.model.predict(normalizedDistances) as tf.Tensor;
    const res = result.dataSync();

    console.log(res);
    const index = res.indexOf(Math.max(...res));
    console.log(index, DIRECTIONS[index]! as Direction);
    return DIRECTIONS[index]! as Direction;
  }
}
