"use client";
import { useEffect, useRef, useState } from "react";
import socket from "./utils/socket";
import { usePageContext } from "./context/PageContext";
import styles from "./page.module.css";
export default function Home() {  
  const { mode } = usePageContext(); // import the state that records the "draw" and "text" mode
  const { format } = usePageContext(); // import the state that records the "landscape" and "portrait" page format
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const isDrawing = useRef(false);

  // for text
  const [textInput, setTextInput] = useState(null); // { x, y, value }
  const inputRef = useRef(null);

  useEffect(() => {
    // TODO: generate url
    const canvasId = new URLSearchParams(window.location.search).get("canvas") || "default";
    // Join canvas room
    socket.emit("join-canvas", canvasId);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    if (format === "portrait") {
      canvas.width = 674;
      canvas.height = 953;
      canvas.style.width = "674px";
      canvas.style.height = "953px";
    } else {
      canvas.width = 953;
      canvas.height = 674;
      canvas.style.width = "953px";
      canvas.style.height = "674px";
    }
    console.log("format changed to:", format);
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

    socket.on("add-text", ({ x, y, value }) => {
      drawText(x, y, value);
    });

    // tell the browser don't start to slide yet
    canvas.addEventListener("touchstart", handleTouchStart, { passive: false });
    canvas.addEventListener("touchmove", handleTouchMove, { passive: false });
    canvas.addEventListener("touchend", handleTouchEnd, { passive: false });

    return () => {
      socket.off("draw");
      socket.off("add-text");
      canvas.removeEventListener("touchstart", handleTouchStart);
      canvas.removeEventListener("touchmove", handleTouchMove);
      canvas.removeEventListener("touchend", handleTouchEnd);
    };
  }, [format]);

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
    if (mode !== "draw") return;

    isDrawing.current = { x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY };
  };

  const handleMouseMove = (e) => {
    if (mode !== "draw" || !isDrawing.current) return;
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
    if (mode !== "draw") return;

    const touch = e.touches[0];
  
    // only response to apple pencil, not finger
    if (touch.touchType !== "stylus") return;
  
    e.preventDefault(); // disable the default sliding
  
    const { x, y } = getCanvasCoords(touch, canvasRef.current);
    isDrawing.current = { x, y };
  };
  
  const handleTouchMove = (e) => {
    if (mode !== "draw") return;

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

  const handleCanvasClick = (e) => {
    if (mode !== "text") return; 
  
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
  
    setTextInput({ x, y, value: "" });
  
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  const drawText = (x, y, text) => {
    const ctx = ctxRef.current;
    ctx.font = "16px Arial";
    ctx.fillStyle = "black";
    ctx.fillText(text, x, y);
  };
  
  
  return (
<div className={styles.main}>
  <div className={styles.canvasContainer}>
    <div style={{ position: "relative" }}>  
      <canvas
        ref={canvasRef}
        className={styles.drawingCanvas}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={handleCanvasClick}
      />
  
      {textInput && (
        <input
          ref={inputRef}
          value={textInput.value}
          onChange={(e) => setTextInput({ ...textInput, value: e.target.value })}
          onKeyDown={(e) => {
            if (e.key === "Enter" && textInput.value.trim()) {
              drawText(textInput.x, textInput.y, textInput.value);
              socket.emit("add-text", {
                x: textInput.x,
                y: textInput.y,
                value: textInput.value
              });
              setTextInput(null);
            }
          }}
          style={{
            position: "absolute",
            top: textInput.y,
            left: textInput.x,
            fontSize: "16px",
            padding: "2px",
            border: "1px solid #aaa",
            background: "white",
            zIndex: 15
          }}
        />
      )}
      </div>
    </div>
    </div>
  );  
}