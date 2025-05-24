"use client"
import { useState } from "react";
import { usePageContext } from '../context/PageContext';
import { useEditorContext } from "../context/EditorContext";
import styles from './textToolBar.module.css'
export default function TextToolBar() {
    const { editor } = useEditorContext();

    if (!editor) return null;

    return (
        <div className={styles.row}>
            <div className={styles.leftSection}>
                <button onClick={() => editor.chain().focus().undo().run()} className={styles.buttonType1} style={{ marginRight: '5px' }}>Undo</button>
                <button onClick={() => editor.chain().focus().redo().run()} className={styles.buttonType1}>Redo</button>
            </div>
            <div className={styles.middleSection}>
                <button onClick={() => editor.chain().focus().toggleBold().run()} className={styles.buttonType1} style={{ marginRight: '5px' }}>Bold</button>
                <button onClick={() => editor.chain().focus().toggleItalic().run()} className={styles.buttonType1} style={{ marginRight: '5px' }}>Italic</button>
                <button onClick={() => editor.chain().focus().setColor('#958DF1').run()} className={styles.buttonType1}>Color</button>
            </div>
            <div className={styles.rightSection}>
                <button onClick={() => editor.chain().focus().toggleStrike().run()} className={styles.buttonType1} style={{ marginRight: '5px' }}>Strike</button>
                <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={styles.buttonType1} style={{ marginRight: '5px' }}>Bullet List</button>
                <button onClick={() => editor.chain().focus().toggleOrderedList().run()} className={styles.buttonType1}>Ordered List</button>
            </div>
        </div>
    );
}