"use client"
import { useState } from "react";
import Image from 'next/image';
import SharePopup from "./share";
import styles from './header.module.css';

export default function Header() {
    const [onlineToggle, setOnlineToggle] = useState(false);
    const [shareWindow, setShareWindow] = useState(false);
    return (
        <div className={styles.headerOuterBox}>
            <div className={styles.row1}>
                <div className={styles.leftSection1}>
                    <Image
                     src="/favicon.ico"
                     width={70}
                     height={70}
                     alt="logo"
                     priority
                    />
                </div>
                <div className={styles.middleSection1}>
                    <div className={styles.fileNameBox}>
                        Sample Doc Name
                    </div>
                    <div className={styles.docMenuBar}>
                        <div className={styles.buttonType0} onClick={() => console.log("File clicked")} >File</div>
                        <div className={styles.buttonType0} onClick={() => console.log("Edit clicked")} >Edit</div>
                        <div className={styles.buttonType0} onClick={() => console.log("View clicked")} >View</div>
                        <div className={styles.buttonType0} onClick={() => console.log("Insert clicked")} >Insert</div>
                        <div className={styles.buttonType0} onClick={() => console.log("Format clicked")} >Format</div>
                        <div className={styles.buttonType0} onClick={() => console.log("Tools clicked")} >Tools</div>
                        <div className={styles.buttonType0} onClick={() => console.log("Extensions clicked")} >Extensions</div>
                        <div className={styles.buttonType0} onClick={() => console.log("Help clicked")} >Help</div>
                    </div>
                </div>
                <div className={styles.rightSection1}>
                    <div className={styles.online} onClick={() => setOnlineToggle(!onlineToggle)}>8 online</div>
                    {onlineToggle && (
                        <div className={styles.onlinePannel}>
                            <ul>Yingjia Liu</ul>
                            <ul>Xin Xia</ul>
                            <ul>Yingjia Liu2</ul>
                            <ul>Yingjia Liu3</ul>
                            <ul>Yingjia Liu4</ul>
                            <ul>Yingjia Liu5</ul>
                            <ul>Yingjia Liu6</ul>
                            <ul>Yingjia Liu7</ul>
                        </div>
                    )}
                    <div className={styles.shareButton} onClick={() => setShareWindow(!shareWindow)}>Share</div>
                        {shareWindow && (
                            <SharePopup setShareWindow={setShareWindow} />
                        )}
                    <div className={styles.userIcon} style={{ marginLeft: '10px' }}>                       
                    </div>
                </div>
            </div>
        </div>
    );
}