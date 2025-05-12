"use client"
import { useState } from "react";
import Image from 'next/image';
import { signIn, signOut, useSession } from "next-auth/react";
import SharePopup from "./share";
import styles from './header.module.css';

export default function Header() {
    const [onlineToggle, setOnlineToggle] = useState(false);
    const [shareWindow, setShareWindow] = useState(false);
    const [fileName, setFileName] = useState("Untitled document");
    const [editing, setEditing] = useState(false);
    const { data: session } = useSession();

    const handleUserClick = () => {
        if (!session) {
            signIn("google");
        } else {
            signOut(); // toggle logout for now
        }
    };

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
                    
                    {editing ? (
                        <input
                            className={styles.fileNameInput}
                            value={fileName}
                            onChange={(e) => setFileName(e.target.value)}
                            onBlur={() => setEditing(false)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') setEditing(false);
                            }}
                            autoFocus
                        />
                        ) : (
                            <div className={styles.fileNameBox} onClick={() => setEditing(true)}>
                                {fileName}
                            </div>
                        )
                    }

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
                    <div className={styles.userIcon} style={{ marginLeft: '10px' }} onClick={handleUserClick}>  
                        <Image
                            src={session?.user?.image || "/icons/userIcon.svg"}
                            width={40}
                            height={40}
                            alt="User"
                            style={{ borderRadius: "100%" }}
                            priority
                        />                     
                    </div>
                </div>
            </div>
        </div>
    );
}