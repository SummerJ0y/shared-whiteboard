"use client";
import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import axios from "axios";
import Tiptap from "@/app/components/tiptap";
import DrawToolBar from "@/app/components/drawToolBar";
import TextToolBar from "@/app/components/textToolBar";
import { EditorProviderWrapper } from "@/app/context/EditorContext";
import DrawPanel from "@/app/components/drawPanel";
import { usePageContext } from "@/app/context/PageContext";
import styles from "./page.module.css";

export default function Home() {
  const { canvasId } = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const { setWhiteboardId, setEditorHTML, setStrokes, setTextBoxes, setTitle } = usePageContext();

  const leftPanelRef = useRef(null);
  const rightPanelRef = useRef(null);
  const [hoveringHandle, setHoveringHandle] = useState(false);
  const [leftSize, setLeftSize] = useState(50);
  const [rightSize, setRightSize] = useState(50);

  useEffect(() => {
    const loadDocs = async () => {
      if (!canvasId) return;
      const userEmail = session?.user?.email || '';
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/whiteboard/load/${canvasId}`, {
          params: { userEmail }
        });
        const { editorHTML, strokes, textBoxes, title } = res.data;
        setWhiteboardId(canvasId);
        setEditorHTML(editorHTML);
        setStrokes(strokes);
        setTextBoxes(textBoxes);
        setTitle(title);
      } catch (error) {
        const status = error.response?.status;
        if (status === 403) {
          alert("You do not have access to this document.");
        } else if (status === 401) {
          alert("This document is restricted. Please log in to view it.");
          router.push(`/api/auth/signin?callbackUrl=/id/${canvasId}`);
        } else if (status === 404) {
          alert("Document not found.");
        } else {
          console.error("Unknown error loading document:", error);
        }
      }
    };

    if (status !== 'loading') {
      loadDocs();
    }
  }, [canvasId, status, session]);

  const handleClickLeft = () => {
    if (rightSize === 0) {
      rightPanelRef.current?.resize(50);
      setRightSize(50);
    } else {
      leftPanelRef.current?.resize(0);
      setLeftSize(0);
    }
  };

  const handleClickRight = () => {
    if (leftSize === 0) {
      leftPanelRef.current?.resize(50);
      setLeftSize(50);
    } else {
      rightPanelRef.current?.resize(0);
      setRightSize(0);
    }
  };

  return (
    <EditorProviderWrapper>
      <div className={styles.main}>
        <PanelGroup direction="horizontal">
          <Panel
            defaultSize={50}
            ref={leftPanelRef}
            onResize={(size) => setLeftSize(size)}
          >
            <div className={styles.grid}>
              <TextToolBar />
              <div className={styles.canvasContainer}>
                <div style={{ margin: "auto", display: "flex", flexDirection: "column" }}>
                  <Tiptap />
                </div>
              </div>
            </div>
          </Panel>

          <PanelResizeHandle className={styles.handleWrapper}>
            <div
              className={styles.handleArea}
              onMouseEnter={() => setHoveringHandle(true)}
              onMouseLeave={() => setHoveringHandle(false)}
            >
              {hoveringHandle && (
                <div className={styles.buttonContainer}>
                  {leftSize !== 0 && (
                    <button className={styles.arrowButton} onClick={handleClickLeft}>◀</button>
                  )}
                  {rightSize !== 0 && (
                    <button className={styles.arrowButton} onClick={handleClickRight}>▶</button>
                  )}
                </div>
              )}
            </div>
          </PanelResizeHandle>

          <Panel
            defaultSize={50}
            ref={rightPanelRef}
            onResize={(size) => setRightSize(size)}
          >
            <div className={styles.grid}>
              <DrawToolBar />
              <div className={styles.canvasContainer}>
                <div style={{ margin: "auto", display: "flex", flexDirection: "column" }}>
                  <DrawPanel />
                </div>
              </div>
            </div>
          </Panel>
        </PanelGroup>
      </div>
    </EditorProviderWrapper>
  );
}