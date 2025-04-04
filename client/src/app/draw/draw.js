// draw.js
import React, { useEffect, useRef, useState } from "react";
import socket from "../utils/socket";
import { getCanvasCoords, drawLineOnCanvas } from "../utils/canvasUtils";
import "./draw.css";

// mode: "draw" or "text" on canvas
export default function DrawPanel({ mode }) {
  const FONT_SIZE = 16;
  const TEXT_OFFSET_Y = 17;

  // for draw
  const canvasRef = useRef(null);
  const containerRef = useRef(null); //for locating the text box
  const ctxRef = useRef(null); // pen
  const isDrawing = useRef(false);
  const inputRefs = useRef({}); // key-value pair: box.id -> box object

  // for text
  const [textBoxes, setTextBoxes] = useState([]); // { id, x, y, value }
  const [editingId, setEditingId] = useState(null); // box id in editting state

  useEffect(() => {
    // TODO: generate url
    const canvasId = new URLSearchParams(window.location.search).get("canvas") || "default";
    socket.emit("join-canvas", canvasId);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    canvas.width = 674;
    canvas.height = 953;

    ctx.lineCap = "round";
    ctx.strokeStyle = "black";
    ctx.lineWidth = 3;
    ctxRef.current = ctx;

    // Debug all incoming events from server
    socket.onAny((event, ...args) => {
      console.log("Socket event received:", event, args);
    });

    // Listen for incoming add-text events
    socket.on("add-text", ({ id, x, y, value }) => {
      setTextBoxes(prev => [...prev, { id, x, y, value }]);
    });

    socket.on("update-text", ({ id, value }) => {
        setTextBoxes(prev =>
          prev.map(tb => (tb.id === id ? { ...tb, value } : tb))
        );
      });

    socket.on("delete-text", ({ id }) => {
        setTextBoxes(prev => prev.filter(tb => tb.id !== id));
    });
  
    socket.on("draw", ({ x0, y0, x1, y1 }) => {
        drawLine(x0, y0, x1, y1, false); // false: not to broadcast again
    });

    // tell the browser don't start to slide yet
    canvas.addEventListener("touchstart", handleTouchStart, { passive: false });
    canvas.addEventListener("touchmove", handleTouchMove, { passive: false });
    canvas.addEventListener("touchend", handleTouchEnd, { passive: false });

    return () => {
      socket.off("draw");
      socket.off("add-text");
      socket.off("update-text");
      socket.off("delete-text");
      canvas.removeEventListener("touchstart", handleTouchStart);
      canvas.removeEventListener("touchmove", handleTouchMove);
      canvas.removeEventListener("touchend", handleTouchEnd);
      socket.disconnect();
    };
  }, []);

  const drawLine = (x0, y0, x1, y1, emit = true) => {
    const ctx = ctxRef.current;
    drawLineOnCanvas(ctx, x0, y0, x1, y1);
    if (emit) {
      socket.emit("draw", { x0, y0, x1, y1 });
    }
  };

  const handleMouseDown = (e) => {
    if (mode !== "draw") return;
    const { x, y } = getCanvasCoords(e.nativeEvent, canvasRef.current);
    isDrawing.current = { x, y };
  };

  const handleMouseMove = (e) => {
    if (mode !== "draw" || !isDrawing.current) return;
    const { x, y } = getCanvasCoords(e.nativeEvent, canvasRef.current);
    const { x: prevX, y: prevY } = isDrawing.current;
    drawLine(prevX, prevY, x, y, true);
    isDrawing.current = { x, y };
  };

  // TODO: outside our canvas, mouse up doesn't work
  const handleMouseUp = () => {
    isDrawing.current = null;
  };

  const handleTouchStart = (e) => {
    if (mode !== "draw") return;
    const touch = e.touches[0];
    if (touch.touchType !== "stylus") return;
    e.preventDefault();
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
    const { x, y } = getCanvasCoords(e.nativeEvent, containerRef.current);
    const id = Date.now().toString() + "-" + Math.random().toString(36).slice(2, 6);
    const newBox = { id, x, y, value: "" };
    setTextBoxes(prev => [...prev, newBox]);
    setEditingId(id);
    // after rendering, .focus()
    setTimeout(() => {
      inputRefs.current[id]?.focus();
    }, 0);
    socket.emit("add-text", newBox);
  };

  const handleTextBoxChange = (id, newValue) => {
    setTextBoxes(prev =>
      prev.map(tb => (tb.id === id ? { ...tb, value: newValue } : tb))
    );
    socket.emit("update-text", { id, value: newValue });
  };

  return (
    <div className="canvas-container" ref={containerRef}>
      <canvas
        ref={canvasRef}
        width={674}
        height={953}
        className="drawing-canvas"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={handleCanvasClick}
      />

      {textBoxes.map((box) => (
        <input
          key={box.id}
          value={box.value}
          // dynamic binding : ref takes a callback function, to add box.id : box object key-value pair to our {}
          ref={(el) => {
            if (el) inputRefs.current[box.id] = el;
          }}
          onChange={(e) => handleTextBoxChange(box.id, e.target.value)}
          onFocus={() => setEditingId(box.id)}
          onBlur={() => {
            if (!box.value.trim()) {
              setTextBoxes(prev => prev.filter(tb => tb.id !== box.id));
              socket.emit("delete-text", { id: box.id });
            }
            setEditingId(null);
          }}
          style={{
            position: "absolute",
            top: box.y - TEXT_OFFSET_Y,
            left: box.x - 2,
            fontSize: `${FONT_SIZE}px`,
            lineHeight: `${FONT_SIZE}px`,
            padding: "2px",
            border: editingId === box.id ? "1px solid blue" : "1px solid transparent",
            background: "white",
            zIndex: 15
          }}
        />
      ))}
    </div>
  );
}