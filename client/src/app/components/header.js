"use client"
import Image from 'next/image';
import { usePageContext } from '../context/PageContext';
import styles from './header.module.css';

export default function Header() {
    const { mode, setMode, setFormat } = usePageContext();
    return (
        <div className={styles.headerOuterBox}>
            <div className={styles.row1}>
                <div className={styles.leftSection1}>
                    <Image
                     src="/favicon.ico"
                     width={80}
                     height={80}
                     alt="logo"
                     />
                </div>
                <div className={styles.middleSection1}>
                    <div className={styles.fileNameBox}>
                        Sample Doc Name
                    </div>
                    <div className={styles.docMenuBar}>
                        File  Edit  View  Insert  Format  Tools  Extensions Help
                    </div>
                </div>
                <div className={styles.rightSection1}>
                    <div className={styles.shareButton}>
                        Share
                    </div>
                    <div className={styles.userIcon} style={{ marginLeft: '10px' }}>
                        
                    </div>
                </div>
            </div>
            <div className={styles.row2}>
                <div className={styles.leftSection2}>
                    undo  redo print  100%    
                    <button onClick={() => setFormat("landscape")}>Landscape</button>
                    <button onClick={() => setFormat("portrait")}>Portrait</button>
                </div>
                {mode === "text" ? (
                    <div className={styles.middleSection2ForText}>
                        Normal Text  Arial    - 12 +   B   I  U  color
                    </div>
                ) : (
                    <div className={styles.middleSection2ForDraw}>
                        color thickness opacity
                    </div>
                )}
                <div className={styles.rightSection2}>
                    <button className={styles.buttonType1} style={{ marginRight: '10px' }} onClick={() => setMode("text")}>Text</button>
                    <button className={styles.buttonType1} onClick={() => setMode("draw")}>Draw</button>
                </div>
            </div>
        </div>
    );
}