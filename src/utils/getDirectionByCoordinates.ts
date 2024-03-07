export const getDirectionByCoordinates = (
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): "top" | "bottom" | "left" | "right" => {
  if (x1 === x2) {
    if (y1 < y2 && y2 - y1 === 1) {
      return "bottom";
    } else if (y1 > y2 && y1 - y2 === 1) {
      return "top";
    } else if (y1 < y2) {
      return "top";
    } else if (y1 > y2) {
      return "bottom";
    }
  } else if (y1 === y2) {
    if (x1 < x2 && x2 - x1 === 1) {
      return "right";
    } else if (x1 > x2 && x1 - x2 === 1) {
      return "left";
    } else if (x1 < x2) {
      return "left";
    } else if (x1 > x2) {
      return "right";
    }
  }

  console.log("wtf?", x1, y1, x2, y2);
  return "top";
};
