"use client";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import DrawToolBar from "./components/drawToolBar";
import TextToolBar from "./components/textToolBar";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.main}>
      <PanelGroup direction="horizontal">
          <Panel defaultSize={50}>
            <div className={styles.grid}>
              <TextToolBar />
              <div className={styles.canvasContainer} style={{overflow: "auto"}}>
                <div className={styles.canvasText}></div> {/* text canvas here */}
              </div>      
            </div>
          </Panel>
          <PanelResizeHandle />
          <Panel defaultSize={50}>
            <div className={styles.grid}>
              <DrawToolBar />
              <div className={styles.canvasContainer} style={{overflow: "auto"}}>
                  <div className={styles.canvasDraw}></div> {/* draw canvas here */}
              </div>
            </div>
          </Panel>      
      </PanelGroup>
    </div>
  );
}