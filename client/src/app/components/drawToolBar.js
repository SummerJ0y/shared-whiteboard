"use client"
import { usePageContext } from '../context/PageContext';
import styles from './drawToolBar.module.css'
import socket from '../utils/socket';

export default function DrawToolBar() {
    const { staticCanvasRef, drawMode, setDrawMode, setStrokes, setTextBoxes } = usePageContext();

    const handleClear = () => {
        setStrokes([]);
        setTextBoxes([]);

        if (staticCanvasRef.current) {
        const ctx = staticCanvasRef.current.getContext("2d");
        ctx.clearRect(0, 0, staticCanvasRef.current.width, staticCanvasRef.current.height);
        }

        socket.emit("clear-canvas");
    };

    return(
        <div className={styles.row}>
            <div className={styles.leftSection}>
                <button className={styles.buttonType1} style={{ marginRight: '5px' }} onClick={handleClear}>Clear</button>
                <button className={styles.buttonType1} style={{ marginRight: '5px' }} >Undo</button>
                <button className={styles.buttonType1} style={{ marginRight: '5px' }} >Redo</button>
            </div>
            <div className={styles.middleSection}>
                <button className={styles.buttonType1} style={{ marginRight: '5px' }} >Color</button>
                <button className={styles.buttonType1} style={{ marginRight: '5px' }} >Thickness</button>
            </div>
            <div className={styles.rightSection}>
                <button className={styles.buttonType1} style={{ marginRight: '5px' }} onClick={() => setDrawMode("eraser")}>Eraser</button>
                <button className={styles.buttonType1} style={{ marginRight: '5px' }} onClick={() => setDrawMode("text")}>Text</button>
                <button className={styles.buttonType1} onClick={() => setDrawMode("draw")}>Draw</button>
            </div>
        </div>
    );
}