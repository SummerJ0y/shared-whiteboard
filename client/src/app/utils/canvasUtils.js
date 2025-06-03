// utils/canvasUtils.js
import getStroke from "perfect-freehand";
import { TOOL_CONFIG } from "./toolConfig";

export function getCanvasCoords(pointer, canvas) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: pointer.clientX - rect.left,
      y: pointer.clientY - rect.top
    };
  }


  export function drawRawLine(ctx, drawMode, x0, y0, x1, y1) {
    const {blendMode, color, size} = TOOL_CONFIG[drawMode];
    ctx.globalCompositeOperation = blendMode;
    ctx.strokeStyle = color;
    ctx.lineWidth = size;
  
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.stroke();
    ctx.closePath();
  
  }  

// const myStroke = {
//     id: "123", 
//     color: "black",
//     size: 4,
//     tool: "pen",
//     points: [ [x1, y1], [x2, y2], [x3, y3], ... ]
//   }
  
// const strokes = [stroke1, stroke2, stroke3, stroke4, stroke5];

  function getSvgPathFromStroke(points) {
    if (!points.length) return "";
    const d = points.map(([x, y], i) => {
      return `${i === 0 ? "M" : "L"} ${x} ${y}`;
    });
    return d.join(" ") + " Z";
  }

  export function drawStroke(ctx, stroke) {
    if (!ctx || !stroke || !stroke.points || stroke.points.length < 2) return;

    ctx.save();
    ctx.globalCompositeOperation = stroke.blendMode;
    ctx.strokeStyle = stroke.color;
    ctx.lineWidth = stroke.size;
    // if(stroke.tool === "eraser") {
    //   ctx.beginPath();
    //   ctx.moveTo(...stroke.points[0]);
    //   for (let i = 1; i < stroke.points.length; i++) {
    //     ctx.lineTo(...stroke.points[i]);
    //   }
      
    //   ctx.lineCap = "round";
    //   ctx.lineJoin = "round";
    //   ctx.stroke();
    //   ctx.restore();
    //   return;
    // }

    const path = getStroke(stroke.points, {
      size: stroke.size,
      thinning: 0,
      smoothing: 1,
      streamline: 0.7,
    });

    const pathData = getSvgPathFromStroke(path);
    const path2D = new Path2D(pathData);

    ctx.fillStyle = stroke.color || "black";
    ctx.fill(path2D);
  }


  export function redrawCanvas(ctx, strokes) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    strokes.forEach((stroke) => {
      drawStroke(ctx, stroke);
    });
  }

  