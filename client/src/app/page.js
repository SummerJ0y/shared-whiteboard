"use client";
import styles from "./page.module.css";
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
    // canvas.width = window.innerWidth;
    // canvas.height = window.innerHeight;
    const style = getComputedStyle(canvas);
    canvas.width = parseInt(style.width);
    canvas.height = parseInt(style.height)

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

    return () => {
      socket.off("draw");
    };
  }, []);

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

  return (
    <div className={styles.main}>
      <div className={styles.canvasContainer}>
        <canvas
          ref={canvasRef}
          className={styles.drawingCanvas}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        />
      </div>    
    </div>
  );
}