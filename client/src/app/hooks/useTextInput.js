import { useEffect, useRef, useState } from "react";
import { usePageContext } from "../context/PageContext";
import socket from "../utils/socket";

export default function useTextInput(drawMode, canvasId) {
  const FONT_SIZE = 16;
  const TEXT_OFFSET_Y = 17;

  const inputRefs = useRef({});
  const measureRef = useRef(null);

  // const [textBoxes, setTextBoxes] = useState([]);
  const { textBoxes, setTextBoxes } = usePageContext();
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
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

    return () => {
      socket.off("add-text");
      socket.off("update-text");
      socket.off("delete-text");
    };
  }, []);

  // const handleCanvasClick = (e, containerRef) => {
  //   if (drawMode !== "text") return;
  //   const rect = containerRef.current.getBoundingClientRect();
  //   const x = e.clientX - rect.left;
  //   const y = e.clientY - rect.top;

  //   const id = Date.now().toString() + "-" + Math.random().toString(36).slice(2, 6);
  //   const newBox = { id, x, y, value: "" };
  //   setTextBoxes(prev => [...prev, newBox]);
  //   setEditingId(id);

  //   setTimeout(() => {
  //     const el = inputRefs.current[id];
  //     if (el && measureRef.current) {
  //       measureRef.current.textContent = "";
  //       el.style.width = measureRef.current.offsetWidth + 6 + "px";
  //       el.focus();
  //     }
  //   }, 0);
  //   socket.emit("add-text", newBox);
  // };

  const handleCanvasClick = (e, containerRef) => {
    if (drawMode !== "text") return;
  
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
  
    // Check if the click was inside an existing text box
    for (const box of textBoxes) {
      const el = inputRefs.current[box.id];
      if (!el) continue;
  
      const boxX = box.x - 2;
      const boxY = box.y - TEXT_OFFSET_Y;
      const boxWidth = el.offsetWidth;
      const boxHeight = FONT_SIZE + 6;
  
      const clickedInside =
        x >= boxX &&
        x <= boxX + boxWidth &&
        y >= boxY &&
        y <= boxY + boxHeight;
  
      if (clickedInside) {
        // Focus the existing input box for editing
        setEditingId(box.id);
        el.focus();
        return;
      }
    }
  
    // If click was not on an existing box, create a new one
    const id = Date.now().toString() + "-" + Math.random().toString(36).slice(2, 6);
    const newBox = { id, x, y, value: "" };
    setTextBoxes(prev => [...prev, newBox]);
    setEditingId(id);
  
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

  const renderTextInputs = (containerRef) => (
    <>
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
    </>
  );

  return {
    textBoxes,
    handleCanvasClick,
    renderTextInputs
  };
}