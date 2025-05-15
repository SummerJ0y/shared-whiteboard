// This is universal context that stores states used by header and canvas
"use client";

import { createContext, useContext, useState } from "react";

const PageContext = createContext();

export const PageContextProvider = ({ children }) => {
  const [drawMode, setDrawMode] = useState("draw");
  const [editorHTML, setEditorHTML] = useState("");
  const [strokes, setStrokes] = useState([]);
  const [textBoxes, setTextBoxes] = useState([]);
  const [whiteboardId, setWhiteboardId] = useState("");
  const [title, setTitle] = useState("Untitled document");

  return (
    <PageContext.Provider
      value={{
        drawMode, setDrawMode,
        editorHTML, setEditorHTML,
        strokes, setStrokes,
        textBoxes, setTextBoxes,
        whiteboardId, setWhiteboardId,
        title, setTitle,
      }}
    >
      {children}
    </PageContext.Provider>
  );
};

export const usePageContext = () => useContext(PageContext);