// utils/toolConfig.js

export const TOOL_CONFIG = {
    draw: {
        color: "black",
        size: 2.5,
        blendMode: "source-over",
    },
    eraser: {
        // color:"transparent", // logically not gonna use
        color:"red",
        size: 18,
        blendMode: "destination-out",
        // blendMode: "source-over",
    },
    highlighter: {
        color: "rgba(255, 255, 0, 0.4)",
        size: 8,
        blendMode: "multiply",
    },
};
  