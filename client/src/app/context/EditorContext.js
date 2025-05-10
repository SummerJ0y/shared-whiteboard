'use client'
import { createContext, useContext, useState } from 'react';

const EditorContext = createContext();

export const EditorProviderWrapper = ({ children }) => {
  const [editor, setEditor] = useState(null);

  return (
    <EditorContext.Provider value={{ editor, setEditor }}>
      {children}
    </EditorContext.Provider>
  );
};

export const useEditorContext = () => useContext(EditorContext);
