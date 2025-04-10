"use client"
import { usePageContext } from '../context/PageContext';
import styles from './drawToolBar.module.css'
export default function DrawToolBar() {
    const { drawMode, setDrawMode } = usePageContext();
    return(
        <div className={styles.row}>
            <div className={styles.leftSection}>
                place holder
            </div>
            <div className={styles.middleSection}>
                color thickness opacity
            </div>
            <div className={styles.rightSection}>
                <button className={styles.buttonType1} style={{ marginRight: '5px' }} onPointerDown={() => setDrawMode("text")}>Text</button>
                <button className={styles.buttonType1} onPointerDown={() => setDrawMode("draw")}>Draw</button>
            </div>
        </div>
    );
}