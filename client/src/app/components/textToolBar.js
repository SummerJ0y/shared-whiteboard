"use client"
import { useState } from "react";
import { usePageContext } from '../context/PageContext';
import styles from './textToolBar.module.css'
export default function TextToolBar() {
    return(
        <div className={styles.row}>
            <div className={styles.leftSection}>
                place holder
            </div>
            <div className={styles.middleSection}>
                Normal Text  Arial    - 12 +   B   I  U  color
            </div>
            <div className={styles.rightSection}>
                place holder
            </div>
        </div>
    );
}