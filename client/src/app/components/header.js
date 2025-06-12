"use client"
import { useState, useLayoutEffect, useEffect } from "react";
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
        editorHTML, strokes, textBoxes, whiteboardId, title, setTitle,
        setEditorHTML, setStrokes, setTextBoxes, setWhiteboardId,
    } = usePageContext();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => setIsMounted(true), []);

    // Restore the unsaved data after logiin
    useLayoutEffect(() => {
        if(session) {
            const saved = localStorage.getItem("unsavedData");
            if(saved){
                const { editorHTML, strokes, textBoxes, title, whiteboardId } = JSON.parse(saved);
                localStorage.removeItem("unsavedData");
                setEditorHTML(editorHTML); 
                setStrokes(strokes); 
                setTextBoxes(textBoxes); 
                console.log("BEFORE: title in context", title);
                setTitle(title); 
                console.log("AFTER: title in context", title);
                setWhiteboardId(whiteboardId);
                axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/whiteboard/save`, {
                    editorHTML,
                    strokes,
                    textBoxes,
                    whiteboardId,
                    userEmail: session.user.email,
                    title,
                }).then(() => {
                    toast.success("Document auto-saved after login!");
                }).catch((err) => {
                    toast.error("Auto-save failed");
                    console.error(err);
                });
            }
        }
    }, [session]);

    if (status === 'loading') {
        return null; // or a spinner component
    }

    const handleClickUserIcon = async() => {
        if (!session) {
            localStorage.setItem("unsavedData", JSON.stringify({
                editorHTML,
                strokes,
                textBoxes,
                title,
                whiteboardId
            }));
            await signIn("google");
            return;
        } else {
            setUserProfileWindow(true);
        }
    };

    const handleClickSave = async() => {
        if (!whiteboardId) {
            toast.error("Missing whiteboard ID.");
            return;
        }
        else if(!session) {
            toast.info("Please sign in to save your document.");
            localStorage.setItem("unsavedData", JSON.stringify({
                editorHTML,
                strokes,
                textBoxes,
                title,
                whiteboardId
            }));
            await signIn("google");
            return;
        }
        else {
            handleSave();
        }
    }

    const handleSave = async () => {
        try {
            console.log(editorHTML);
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
                    <div className={styles.online} onClick={() => setOnlineToggle(!onlineToggle)}>2 online</div>
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

                    <div className={styles.shareButton} style={{ marginRight: '10px' }} onClick={handleClickSave}>Save</div>

                    <div className={styles.shareButton} onClick={() => setShareWindow(!shareWindow)}>Share</div>
                        {shareWindow && (
                            <SharePopup setShareWindow={setShareWindow} />
                        )}

                    <div className={styles.userIcon} style={{ marginLeft: '10px', marginRight: '5px' }} onClick={handleClickUserIcon}>  
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