import { useEffect, useRef, useState } from "react";
import socket from "../utils/socket";
import { usePageContext } from "../context/PageContext";
import {
  getCanvasCoords,
  drawRawLine,
  drawStroke,
  redrawCanvas,
} from "../utils/canvasUtils";
import { TOOL_CONFIG } from "../utils/toolConfig";


export default function useDrawing(drawMode, canvasId) {
  const liveCanvasRef = useRef(null);
  const ctxRef = useRef({ live: null, static: null });

  const isDrawing = useRef(false);
  const currentPoints = useRef([]);
  const initDraw = useRef(false);
  const { staticCanvasRef, strokes, setStrokes } = usePageContext();

  const isDrawingMode = drawMode === "draw" || drawMode === "eraser";

  function clearLiveCanvas() {
    const ctx = ctxRef.current?.live;
    if (ctx) {
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    }
  }

  //————————————————————————————————————————————————————
  useEffect(() => {
    const handleGlobalMouseUp = () => {
        if (isDrawing.current) {
            handleMouseUp();
        }
    };
    window.addEventListener("mouseup", handleGlobalMouseUp);
    return () => {
        window.removeEventListener("mouseup", handleGlobalMouseUp);
        };
    }, [drawMode]); 
    //————————————————maybe need global mouse up listener——————————————

  useEffect(() => {
    socket.emit("join-canvas", canvasId);

    const liveCanvas = liveCanvasRef.current;
    const staticCanvas = staticCanvasRef.current;

    liveCanvas.width = staticCanvas.width = 674;
    liveCanvas.height = staticCanvas.height = 953;

    const liveCtx = liveCanvas.getContext("2d");
    const staticCtx = staticCanvas.getContext("2d");

    liveCanvas.addEventListener("touchstart", handleTouchStart, { passive: false });
    liveCanvas.addEventListener("touchmove", handleTouchMove, { passive: false });
    liveCanvas.addEventListener("touchend", handleTouchEnd, { passive: false });

    liveCtx.lineCap = staticCtx.lineCap = "round";
    liveCtx.strokeStyle = staticCtx.strokeStyle = "black";
    liveCtx.lineWidth = staticCtx.lineWidth = 2;

    ctxRef.current = { live: liveCtx, static: staticCtx };
    redrawCanvas(staticCtx, strokes);

    socket.on("draw-segment", ({drawMode, x0, y0, x1, y1 }) => {
        const ctx =
        drawMode === "eraser" ? ctxRef.current.static : ctxRef.current.live;
  
        drawRawLine(ctx, drawMode, x0, y0, x1, y1);
    });

    socket.on("draw-stroke", (stroke) => {
      clearLiveCanvas();
      setStrokes(prev => [...prev, stroke]);
      drawStroke(ctxRef.current.static, stroke);
    });

    socket.on("clear-live-canvas", () => {
      clearLiveCanvas();
    });

    socket.on("clear-canvas", () => {
      const ctx = ctxRef.current.static;
      if (ctx) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        redrawCanvas(ctx, []);
      }
      setStrokes([]);
    });

    return () => {
        socket.off("draw-segment");
        socket.off("draw-stroke");
        socket.off("clear-live-canvas");
        socket.off("clear-canvas");
        liveCanvas.removeEventListener("touchstart", handleTouchStart);
        liveCanvas.removeEventListener("touchmove", handleTouchMove);
        liveCanvas.removeEventListener("touchend", handleTouchEnd);
        window.removeEventListener("mouseup", handleGlobalMouseUp);
    };
  }, [canvasId]);

  // NEW: handles the first render of the database's saving drawing
  useEffect(() => {
  if (!initDraw.current && strokes.length > 0 && ctxRef.current.static) {
    redrawCanvas(ctxRef.current.static, strokes);
    initDraw.current = true; // Ensure this runs only once
  }
  }, [strokes]);


  const handleMouseDown = (e) => {
    console.log("mouseDown: ",drawMode);
    if (!isDrawingMode) return;
    const { x, y } = getCanvasCoords(e.nativeEvent, liveCanvasRef.current);
    currentPoints.current = [[x, y]];
    isDrawing.current = true;
  };

  const handleMouseMove = (e) => {
    if (!isDrawing.current) return;
    const { x, y } = getCanvasCoords(e.nativeEvent, liveCanvasRef.current);
    const points = currentPoints.current;
    points.push([x, y]);

    if (points.length >= 2) {
      const [prevX, prevY] = points.at(-2);
      const [currX, currY] = points.at(-1);

      const ctx =
      drawMode === "eraser" ? ctxRef.current.static : ctxRef.current.live;

      drawRawLine(ctx, drawMode, prevX, prevY, currX, currY);
        //emit要改
      socket.emit("draw-segment", {drawMode:drawMode, x0: prevX, y0: prevY, x1: currX, y1: currY });
    }
    console.log("mouseMove: ",drawMode);
  };

  const handleMouseUp = () => {
    console.log("mouseUp: ",drawMode);
      if (drawMode === "eraser") {
          console.log("here!")
        isDrawing.current = false;
        return;
      } 
    if (!isDrawing.current || currentPoints.current.length < 2) return;
    // console.log("mouseUp: ",drawMode);
    const { color, size, blendMode } = TOOL_CONFIG[drawMode];
    const newStroke = {
        id: Date.now().toString(),
        color,
        size,
        blendMode,
        points: [...currentPoints.current],
    };

    drawStroke(ctxRef.current.static, newStroke);
    // console.log(TOOL_CONFIG[drawMode]);
    setStrokes(prev => [...prev, newStroke]);
    clearLiveCanvas();
    socket.emit("clear-live-canvas", { canvasId });

    currentPoints.current = [];
    isDrawing.current = false;
    socket.emit("draw-stroke", newStroke);
  };

  const handleTouchStart = (e) => {
    if (!isDrawingMode) return;
    const touch = e.touches[0];
    if (touch.touchType !== "stylus") return;
    e.preventDefault();
    const { x, y } = getCanvasCoords(touch, liveCanvasRef.current);
    currentPoints.current = [[x, y]];
    isDrawing.current = true;
  };

  const handleTouchMove = (e) => {
    if (!isDrawingMode) return;
    const touch = e.touches[0];
    if (touch.touchType !== "stylus" || !isDrawing.current) return;
    e.preventDefault();
    const { x, y } = getCanvasCoords(touch, liveCanvasRef.current);
    const points = currentPoints.current;
    points.push([x, y]);

    if (points.length >= 2) {
      const [prevX, prevY] = points.at(-2);
      const [currX, currY] = points.at(-1);
      drawRawLine(ctxRef.current.live, drawMode, prevX, prevY, currX, currY);
      socket.emit("draw-segment", { x0: prevX, y0: prevY, x1: currX, y1: currY });
    }
  };

  const handleTouchEnd = (e) => {
    const touch = e.changedTouches[0];
    if (touch.touchType !== "stylus") return;
    e.preventDefault();
    handleMouseUp();
    isDrawing.current = false;
  };

  return {
    drawRefs: { liveCanvasRef, staticCanvasRef, ctxRef },
    handleDrawEvents: {
      handleMouseDown,
      handleMouseMove,
      handleMouseUp,
      handleTouchStart,
      handleTouchMove,
      handleTouchEnd
    },
    clearLiveCanvas,
  };
}
