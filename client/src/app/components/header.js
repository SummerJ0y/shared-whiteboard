"use client"
import { useState, useEffect } from "react";
import Image from 'next/image';
import { signIn, useSession } from "next-auth/react";
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import SharePopup from "./share";
import UserProfilePopup from "./userProfile";
import { usePageContext } from "../context/PageContext";
import styles from './header.module.css';


export default function Header() {
    const [onlineToggle, setOnlineToggle] = useState(false);
    const [shareWindow, setShareWindow] = useState(false);
    const [userProfileWindow, setUserProfileWindow] = useState(false);
    const [editing, setEditing] = useState(false);
    const { data: session, status } = useSession();
    const {
        editorHTML, strokes, textBoxes, whiteboardId, title, setTitle
    } = usePageContext();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => setIsMounted(true), []);

    if (status === 'loading') {
        return null; // or a spinner component
    }

    const handleUserClick = () => {
        if (!session) {
            signIn("google");
        } else {
            setUserProfileWindow(true);
        }
    };

    const handleSave = async () => {
        if(!session) {
            toast.info("Please sign in to save your document.");
            signIn("google", { callbackUrl: window.location.href });
            return;
        }
        if (!whiteboardId) {
            toast.error("Missing whiteboard ID.");
            return;
        }

        try {
            await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/whiteboard/save`, {
                editorHTML,
                strokes,
                textBoxes,
                whiteboardId,
                userEmail: session.user.email,
                title,
            });
            toast.success("Document saved!");
        } catch (err) {
            toast.error("Save failed");
            console.error(err);
        }
    }

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
                            className={styles.fileInputBox}
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            onBlur={() => setEditing(false)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') setEditing(false);
                            }}
                            autoFocus
                        />
                        ) : (
                            <div className={styles.fileNameBox} onClick={() => setEditing(true)}>
                                {title}
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

                    <div className={styles.shareButton} style={{ marginRight: '10px' }} onClick={handleSave}>Save</div>

                    <div className={styles.shareButton} onClick={() => setShareWindow(!shareWindow)}>Share</div>
                        {shareWindow && (
                            <SharePopup setShareWindow={setShareWindow} />
                        )}

                    <div className={styles.userIcon} style={{ marginLeft: '10px', marginRight: '5px' }} onClick={handleUserClick}>  
                        {isMounted ? (
                            <Image
                                src={session?.user?.image || "/icons/userIcon.svg"}
                                width={40}
                                height={40}
                                alt="User"
                                style={{ borderRadius: "100%" }}
                                priority
                            />
                         ) : (
                            <div style={{ width: 40, height: 40, backgroundColor: "#ccc", borderRadius: "100%" }} />
                        )}                     
                    </div>


                        {userProfileWindow && (
                            <UserProfilePopup setUserProfileWindow={setUserProfileWindow} />
                        )}
                </div>
            </div>
        </div>
    );
}