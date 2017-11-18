import randomColor from "randomcolor";

export const AMOUNT_IN_LINE_TO_WIN = 5;
export const BOARD_SIZE = 6;
export const QUADRANT_SIZE = 3;
export const NUM_QUADRANTS = Math.floor(BOARD_SIZE / QUADRANT_SIZE, 10);

const colors = [];
const hues = ["red", "orange", "yellow", "green", "blue", "purple", "pink"];
hues.forEach(hue => colors.push(randomColor({ hue, luminosity: "bright" })));

export const COLORS = colors;
