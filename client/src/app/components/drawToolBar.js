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
                <button className={styles.buttonType1} style={{ marginRight: '10px' }} onClick={() => setDrawMode("text")}>Text</button>
                <button className={styles.buttonType1} onClick={() => setDrawMode("draw")}>Draw</button>
            </div>
        </div>
    );
}