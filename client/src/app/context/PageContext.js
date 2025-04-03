// This is universal context that stores states used by header and canvas
"use client";
import { createContext, useContext, useState } from "react";

const PageContext = createContext();

export const PageContextProvider = ({ children }) => {
  const [mode, setMode] = useState("draw");
  const [format, setFormat] = useState("landscape");
  return (
    <PageContext.Provider value={{ mode, setMode, format, setFormat }}>
      {children}
    </PageContext.Provider>
  );
};

export const usePageContext = () => useContext(PageContext);