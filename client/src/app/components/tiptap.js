'use client'
import { useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { Color } from '@tiptap/extension-color';
import ListItem from '@tiptap/extension-list-item';
import TextStyle from '@tiptap/extension-text-style';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

import { useEditorContext } from '../context/EditorContext';
import { usePageContext } from "../context/PageContext";
import socket from "../utils/socket";
import styles from './tiptap.module.css';

const extensions = [
  Color.configure({ types: [TextStyle.name, ListItem.name] }),
  TextStyle.configure({ types: [ListItem.name] }),
  StarterKit.configure({
    bulletList: { keepMarks: true, keepAttributes: false },
    orderedList: { keepMarks: true, keepAttributes: false },
  }),
]

const Tiptap = () => {
  const { setEditor } = useEditorContext();
  const { editorHTML, setEditorHTML } = usePageContext();
  const { canvasId } = useParams();
  const isRemoteUpdate = useRef(false);
  const hasInitialized = useRef(false);

  console.log(editorHTML);

  const editor = useEditor({
    extensions,
    content: editorHTML || "",
    immediatelyRender: false,
    onCreate: ({ editor }) => {
      setEditor(editor);
      socket.emit("join-editor", canvasId);
    },
    onUpdate: ({ editor }) => {
      if (!isRemoteUpdate.current) {
        const html = editor.getHTML();
        setEditorHTML(html);
        socket.emit("editor-update", { editorId: canvasId, content: html });
      }
    },
  });

  // NEW: handles the first render of the database's saving editor html
  useEffect(() => {
    if (!editor || hasInitialized.current) return;

    if (editorHTML) {
      isRemoteUpdate.current = true;
      editor.commands.setContent(editorHTML, false);
      isRemoteUpdate.current = false;
      hasInitialized.current = true;
    }
    
  }, [editor, editorHTML]);

  useEffect(() => {
    if(!editor) return;

    const handleRemoteUpdate = ({ content }) => {
      isRemoteUpdate.current = true;
      editor.commands.setContent(content, false); // false = do not emit update again
      isRemoteUpdate.current = false;
    };

    socket.on("editor-update", handleRemoteUpdate);

    return () => {
      socket.off("editor-update", handleRemoteUpdate);
    };
  }, [editor]);
  return (
    <div className={styles.editorWrapper}>
      <EditorContent editor={editor} className={styles.editorContent} />
    </div>
  );
};

export default Tiptap