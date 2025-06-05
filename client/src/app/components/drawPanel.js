import { useRef } from "react";
import useDrawing from "../hooks/useDrawing";
import useTextInput from "../hooks/useTextInput";
import { usePageContext } from "../context/PageContext";
import { useParams } from "next/navigation";
import styles from './drawPanel.module.css';

export default function DrawPanel() {
  const { drawMode, staticCanvasRef } = usePageContext();
  const { canvasId } = useParams();
  const containerRef = useRef(null);

  const {
    drawRefs: { liveCanvasRef },
    handleDrawEvents
  } = useDrawing(drawMode, canvasId);

  const {
    handleCanvasClick,
    renderTextInputs
  } = useTextInput(drawMode, canvasId);

  return (
    <div
      ref={containerRef}
      className={styles.canvasContainer}
      onClick={(e) => handleCanvasClick(e, containerRef)}
    >
      <canvas
        ref={liveCanvasRef}
        className={styles.liveCanvas}
        onMouseDown={handleDrawEvents.handleMouseDown}
        onMouseMove={handleDrawEvents.handleMouseMove}
        onMouseUp={handleDrawEvents.handleMouseUp}
        // onTouchStart={handleDrawEvents.handleTouchStart}
        // onTouchMove={handleDrawEvents.handleTouchMove}
        // onTouchEnd={handleDrawEvents.handleTouchEnd}
      />
      <canvas 
        ref={staticCanvasRef} 
        className={styles.staticCanvas} 
        // onMouseUp={handleDrawEvents.handleMouseUp}
      />
      {renderTextInputs(containerRef)}
    </div>
  );
}
