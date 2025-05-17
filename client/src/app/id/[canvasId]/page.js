"use client";
import { useEffect } from "react";
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

  useEffect(() => {
    const loadDocs = async () => {
      if (!canvasId) return;
      const userEmail = session?.user?.email || '';
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/whiteboard/load/${canvasId}`, { params: { userEmail } });
        const { editorHTML, strokes, textBoxes, title } = res.data;
        // console.log(res);
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

    if (status !== 'loading'){
      loadDocs();
    }
  }, [canvasId, status, session]);

  return (
    <EditorProviderWrapper>
    <div className={styles.main}>
      <PanelGroup direction="horizontal">
          <Panel defaultSize={50}>
            <div className={styles.grid}>
              <TextToolBar />
              <div className={styles.canvasContainer} style={{borderRight: '1px solid lightgray'}}>
                <div style={{ margin: "auto", display: "flex", flexDirection: "column" }}>
                  <Tiptap /> {/* text canvas here */}
                </div>
              </div>      
            </div>
          </Panel>
          <PanelResizeHandle />
          <Panel defaultSize={50}>
            <div className={styles.grid}>
              <DrawToolBar />
              <div className={styles.canvasContainer} style={{borderLeft: '1px solid lightgray'}}>
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