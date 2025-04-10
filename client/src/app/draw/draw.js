// draw.js
import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { usePageContext } from "../context/PageContext";
import socket from "../utils/socket";
import {
    getCanvasCoords,
    drawRawLine,
    drawStroke,
    redrawCanvas,
} from "../utils/canvasUtils";  
import styles from './draw.module.css'

// drawMode: "draw" or "text" on canvas
export default function DrawPanel() {
  const { drawMode } = usePageContext();
  const { canvasId } = useParams();
  const FONT_SIZE = 16;
  const TEXT_OFFSET_Y = 17;

  // for draw
  const liveCanvasRef = useRef(null);
  const staticCanvasRef = useRef(null);
  const ctxRef = useRef({ live: null, static: null }); // pen

  const containerRef = useRef(null); //for locating the text box
  const isDrawing = useRef(false);
  const currentPoints = useRef([]); // points in the current stroke

  const [strokes, setStrokes] = useState([]); // all strokes

  // for text
  const inputRefs = useRef({}); // key-value pair: box.id -> box object
  const measureRef = useRef(null); // hidden span to measure the width of text box

  const [textBoxes, setTextBoxes] = useState([]); // { id, x, y, value }
  const [editingId, setEditingId] = useState(null); // box id in editting state

  useEffect(() => {
    socket.emit("join-canvas", canvasId);

    const liveCanvas = liveCanvasRef.current;
    const staticCanvas = staticCanvasRef.current;

    liveCanvas.width = staticCanvas.width = 674;
    liveCanvas.height = staticCanvas.height = 953;

    const liveCtx = liveCanvas.getContext("2d");
    const staticCtx = staticCanvas.getContext("2d");

    liveCtx.lineCap = staticCtx.lineCap = "round";
    liveCtx.strokeStyle = staticCtx.strokeStyle = "black";
    liveCtx.lineWidth = staticCtx.lineWidth = 3;
    ctxRef.current = { live: liveCtx, static: staticCtx };

    if (ctxRef.current.static) {
        redrawCanvas(ctxRef.current.static, strokes);
      }

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

        const el = inputRefs.current[id];
        if (el && measureRef.current) {
            measureRef.current.textContent = value || " ";
            el.style.width = measureRef.current.offsetWidth + 6 + "px";
        }
      });

    socket.on("delete-text", ({ id }) => {
        setTextBoxes(prev => prev.filter(tb => tb.id !== id));
    });
  
    socket.on("draw-segment", ({ x0, y0, x1, y1 }) => {
        drawLine(x0, y0, x1, y1, false); // false: not to broadcast again
    });

    socket.on("draw-stroke", (stroke) => {
        setStrokes(prev => [...prev, stroke]);
        drawStroke(ctxRef.current.static, stroke);
    });

    // tell the browser don't start to slide yet
    liveCanvas.addEventListener("touchstart", handleTouchStart, { passive: false });
    liveCanvas.addEventListener("touchmove", handleTouchMove, { passive: false });
    liveCanvas.addEventListener("touchend", handleTouchEnd, { passive: false });

    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      socket.off("draw-segment");
      socket.off("draw-stroke");
      socket.off("add-text");
      socket.off("update-text");
      socket.off("delete-text");
      liveCanvas.removeEventListener("touchstart", handleTouchStart);
      liveCanvas.removeEventListener("touchmove", handleTouchMove);
      liveCanvas.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("mouseup", handleMouseUp);
      socket.disconnect();
    };
  }, []);

//   useEffect(() => {
//     if (ctxRef.current.static) {
//       redrawCanvas(ctxRef.current.static, strokes);
//     }
//   }, [strokes]);

  const drawLine = (x0, y0, x1, y1, emit = true) => {
    const liveCtx = ctxRef.current.live;
    drawRawLine(liveCtx, x0, y0, x1, y1);
    if (emit) {
      socket.emit("draw-segment", { x0, y0, x1, y1 });
    }
  };

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
      size: 4,
      points: [...currentPoints.current],
    };
    drawStroke(ctxRef.current.static, newStroke);
    setStrokes(prev => [...prev, newStroke]);
    ctxRef.current.live.clearRect(0, 0, 674, 953);
    
    currentPoints.current = [];
    isDrawing.current = false;
    socket.emit("draw-stroke", newStroke);
  };

  const handleTouchStart = (e) => {
    if (drawMode !== "draw") return;
    const touch = e.touches[0];
    if (touch.touchType !== "stylus") return;
    e.preventDefault();
    const { x, y } = getCanvasCoords(touch, liveCanvasRef
.current);
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
    isDrawing.current = false;
    handleMouseUp();
  };

  const handleCanvasClick = (e) => {
    if (drawMode !== "text") return;
    const { x, y } = getCanvasCoords(e.nativeEvent, containerRef.current);
    const id = Date.now().toString() + "-" + Math.random().toString(36).slice(2, 6);
    const newBox = { id, x, y, value: "" };
    setTextBoxes(prev => [...prev, newBox]);
    setEditingId(id);
    // after rendering, .focus()
    setTimeout(() => {
        const el = inputRefs.current[id];
        if (el && measureRef.current) {
            measureRef.current.textContent = "";
            el.style.width = measureRef.current.offsetWidth + 6 + "px";
            el.focus();
        }
    }, 0);
    socket.emit("add-text", newBox);
  };

  const handleTextBoxChange = (id, newValue) => {
    if (newValue.length > 40) return;

    setTextBoxes(prev =>
      prev.map(tb => (tb.id === id ? { ...tb, value: newValue } : tb))
    );
    socket.emit("update-text", { id, value: newValue });

    const el = inputRefs.current[id];
    if (el && measureRef.current) {
        measureRef.current.textContent = newValue || " "; 
        el.style.width = measureRef.current.offsetWidth + 6 + "px";
    }
  };

  return (
    <div className={styles.canvasContainer} ref={containerRef}>
        <canvas
            ref={liveCanvasRef}
            className={styles.liveCanvas}
            // style={{zIndex: 1, backgroundColor: "transparent" }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onClick={handleCanvasClick}
        />
      <canvas
            ref={staticCanvasRef}
            className={styles.staticCanvas}
            // style={{zIndex: 0 }}
        />

    <span
        ref={measureRef}
        style={{
          position: "absolute",
          visibility: "hidden",
          whiteSpace: "pre",
          fontSize: `${FONT_SIZE}px`,
          fontFamily: "Arial"
        }}
    />

      {textBoxes.map((box) => (
        <input
          key={box.id}
          value={box.value}
          type="text"
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
            width: "10px",
            top: box.y - TEXT_OFFSET_Y,
            left: box.x - 2,
            fontSize: `${FONT_SIZE}px`,
            lineHeight: `${FONT_SIZE}px`,
            padding: "2px",
            border: editingId === box.id ? "1px solid blue" : "1px solid transparent",
            background: "transparent",
            zIndex: 15
          }}
        />
      ))}
    </div>
  );
}