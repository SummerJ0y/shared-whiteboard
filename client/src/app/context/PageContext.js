// This is universal context that stores states used by header and canvas
"use client";
import { createContext, useContext, useState } from "react";

const PageContext = createContext();

export const PageContextProvider = ({ children }) => {
  const [drawMode, setDrawMode] = useState("draw");
  return (
    <PageContext.Provider value={{ drawMode, setDrawMode }}>
      {children}
    </PageContext.Provider>
  );
};

export const usePageContext = () => useContext(PageContext);