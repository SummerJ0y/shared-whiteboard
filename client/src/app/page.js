// import styles from "./page.module.css";
"use client";
import { useEffect, useRef } from "react";
import socket from "./utils/socket";

export default function Home() {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const isDrawing = useRef(false);

  useEffect(() => {
    const canvasId = new URLSearchParams(window.location.search).get("canvas") || "default";
    
    // Join canvas room
    socket.emit("join-canvas", canvasId);

    const canvas = canvasRef.current;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const ctx = canvas.getContext("2d");
    ctx.lineCap = "round";
    ctx.strokeStyle = "black";
    ctx.lineWidth = 3;
    ctxRef.current = ctx;

    // Debug all incoming events from server
    socket.onAny((event, ...args) => {
      console.log("Socket event received:", event, args);
    });
    // Listen for incoming draw events
    socket.on("draw", ({ x0, y0, x1, y1 }) => {
      drawLine(x0, y0, x1, y1, false);
    });

    // tell the browser don't start to slide yet
    canvas.addEventListener("touchstart", handleTouchStart, { passive: false });
    canvas.addEventListener("touchmove", handleTouchMove, { passive: false });
    canvas.addEventListener("touchend", handleTouchEnd, { passive: false });

    return () => {
      socket.off("draw");
      canvas.removeEventListener("touchstart", handleTouchStart);
      canvas.removeEventListener("touchmove", handleTouchMove);
      canvas.removeEventListener("touchend", handleTouchEnd);
    };
  }, []);

  const getCanvasCoords = (touch, canvas) => {
    const rect = canvas.getBoundingClientRect();
    return {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top
    };
  };
  

  const drawLine = (x0, y0, x1, y1, emit = true) => {
    const ctx = ctxRef.current;
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.stroke();
    ctx.closePath();

    if (emit) {
      socket.emit("draw", { x0, y0, x1, y1 });
    }
  };

  const handleMouseDown = (e) => {
    isDrawing.current = { x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY };
  };

  const handleMouseMove = (e) => {
    if (!isDrawing.current) return;
    const x = e.nativeEvent.offsetX;
    const y = e.nativeEvent.offsetY;
    const { x: prevX, y: prevY } = isDrawing.current;

    drawLine(prevX, prevY, x, y, true);
    isDrawing.current = { x, y };
  };

  const handleMouseUp = () => {
    isDrawing.current = null;
  };

  const handleTouchStart = (e) => {
    const touch = e.touches[0];
  
    // only response to apple pencil, not finger
    if (touch.touchType !== "stylus") return;
  
    e.preventDefault(); // disable the default sliding
  
    const { x, y } = getCanvasCoords(touch, canvasRef.current);
    isDrawing.current = { x, y };
  };
  
  const handleTouchMove = (e) => {
    const touch = e.touches[0];
    if (touch.touchType !== "stylus" || !isDrawing.current) return;
  
    e.preventDefault();
  
    const { x, y } = getCanvasCoords(touch, canvasRef.current);
    const { x: prevX, y: prevY } = isDrawing.current;
    
    drawLine(prevX, prevY, x, y, true);
    isDrawing.current = { x, y };
  };
  
  const handleTouchEnd = (e) => {
    const touch = e.changedTouches[0];
    if (touch.touchType !== "stylus") return;
  
    e.preventDefault();
    isDrawing.current = null;
  };
  

  return (
    <canvas
      ref={canvasRef}
      style={{
        display: "block",
        border: "1px solid #ccc",
        width: "100vw",
        height: "100vh",
        touchAction: "manipulation" // 
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    />

  );
}