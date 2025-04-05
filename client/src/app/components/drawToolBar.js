"use client"
import { useState } from "react";
import { usePageContext } from '../context/PageContext';
import styles from './drawToolBar.module.css'
export default function DrawToolBar() {
    return(
        <div className={styles.row}>
            <div className={styles.leftSection}>
                place holder
            </div>
            <div className={styles.middleSection}>
                color thickness opacity
            </div>
            <div className={styles.rightSection}>
                place holder
            </div>
        </div>
    );
}