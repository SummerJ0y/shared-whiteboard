"use client";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import DrawPanel from "./draw/draw";
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
              <div className={styles.canvasContainer} style={{borderRight: '1px solid lightgray'}}>
                <div style={{ margin: "auto", display: "flex", flexDirection: "column" }}>
                  <div className={styles.canvasText}></div> {/* text canvas here */}
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
  );
}