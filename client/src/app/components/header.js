import styles from './header.module.css';

export default function Header() {
    return (
        <div className={styles.headerOuterBox}>
            <div className={styles.row1}>
                <div className={styles.leftSection1}>
                    logo
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
                    userIcon and share button
                </div>
            </div>
            <div className={styles.row2}>
                <div className={styles.leftSection2}>
                    Search undo  redo print  100%   Normal Text  Arial    - 12 +   B   I  U  color 
                </div>
                <div className={styles.rightSection2}>
                    Text | Draw
                </div>
            </div>
        </div>
    );
}