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

const content = `
  <h2>Hi there,</h2>
  <p>This is a <em>basic</em> example of <strong>Tiptap</strong>.</p>
  <ul><li>List item 1</li><li>List item 2</li></ul>
  <pre><code class="language-css">body { display: none; }</code></pre>
  <blockquote>Wow, that’s amazing. — Mom</blockquote>
`
const Tiptap = () => {
  const { setEditor } = useEditorContext();
  const { setEditorHTML } = usePageContext();
  const { canvasId } = useParams();
  const isRemoteUpdate = useRef(false);
  const editor = useEditor({
    extensions,
    // content,
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