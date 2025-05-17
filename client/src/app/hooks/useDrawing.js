import { useEffect, useRef, useState } from "react";
import socket from "../utils/socket";
import { usePageContext } from "../context/PageContext";
import {
  getCanvasCoords,
  drawRawLine,
  drawStroke,
  redrawCanvas,
} from "../utils/canvasUtils";

export default function useDrawing(drawMode, canvasId) {
  const liveCanvasRef = useRef(null);
  const staticCanvasRef = useRef(null);
  const ctxRef = useRef({ live: null, static: null });

  const isDrawing = useRef(false);
  const currentPoints = useRef([]);
  const initDraw = useRef(false);
  const { strokes, setStrokes } = usePageContext();

  function clearLiveCanvas() {
    const ctx = ctxRef.current?.live;
    if (ctx) {
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    }
  }

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

    window.addEventListener("mouseup", handleMouseUp);

    liveCtx.lineCap = staticCtx.lineCap = "round";
    liveCtx.strokeStyle = staticCtx.strokeStyle = "black";
    liveCtx.lineWidth = staticCtx.lineWidth = 2;

    ctxRef.current = { live: liveCtx, static: staticCtx };
    redrawCanvas(staticCtx, strokes);

    socket.on("draw-segment", ({ x0, y0, x1, y1 }) => {
      const ctx = ctxRef.current.live;
      if (ctx) drawRawLine(ctx, x0, y0, x1, y1);
    });

    socket.on("draw-stroke", (stroke) => {
      clearLiveCanvas();
      setStrokes(prev => [...prev, stroke]);
      drawStroke(ctxRef.current.static, stroke);
    });

    socket.on("clear-live-canvas", () => {
      clearLiveCanvas();
    });

    return () => {
      socket.off("draw-segment");
      socket.off("draw-stroke");
      socket.off("clear-live-canvas");
      liveCanvas.removeEventListener("touchstart", handleTouchStart);
        liveCanvas.removeEventListener("touchmove", handleTouchMove);
        liveCanvas.removeEventListener("touchend", handleTouchEnd);
        window.removeEventListener("mouseup", handleMouseUp);
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
    if (drawMode !== "draw") return;
    const { x, y } = getCanvasCoords(e.nativeEvent, liveCanvasRef.current);
    currentPoints.current = [[x, y]];
    isDrawing.current = true;
  };

  const handleMouseMove = (e) => {
    if (drawMode !== "draw" || !isDrawing.current) return;
    const { x, y } = getCanvasCoords(e.nativeEvent, liveCanvasRef.current);
    const points = currentPoints.current;
    points.push([x, y]);

    if (points.length >= 2) {
      const [prevX, prevY] = points.at(-2);
      const [currX, currY] = points.at(-1);
      drawRawLine(ctxRef.current.live, prevX, prevY, currX, currY);
      socket.emit("draw-segment", { x0: prevX, y0: prevY, x1: currX, y1: currY });
    }
  };

  const handleMouseUp = () => {
    if (!isDrawing.current || currentPoints.current.length < 2) return;
    const newStroke = {
      id: Date.now().toString(),
      color: "black",
      size: 2.5,
      points: [...currentPoints.current],
    };
    drawStroke(ctxRef.current.static, newStroke);
    setStrokes(prev => [...prev, newStroke]);
    clearLiveCanvas();
    socket.emit("clear-live-canvas", { canvasId });

    currentPoints.current = [];
    isDrawing.current = false;
    socket.emit("draw-stroke", newStroke);
  };

  const handleTouchStart = (e) => {
    if (drawMode !== "draw") return;
    const touch = e.touches[0];
    if (touch.touchType !== "stylus") return;
    e.preventDefault();
    const { x, y } = getCanvasCoords(touch, liveCanvasRef.current);
    currentPoints.current = [[x, y]];
    isDrawing.current = true;
  };

  const handleTouchMove = (e) => {
    if (drawMode !== "draw") return;
    const touch = e.touches[0];
    if (touch.touchType !== "stylus" || !isDrawing.current) return;
    e.preventDefault();
    const { x, y } = getCanvasCoords(touch, liveCanvasRef.current);
    const points = currentPoints.current;
    points.push([x, y]);

    if (points.length >= 2) {
      const [prevX, prevY] = points.at(-2);
      const [currX, currY] = points.at(-1);
      drawRawLine(ctxRef.current.live, prevX, prevY, currX, currY);
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
