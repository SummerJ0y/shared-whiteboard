"use client"
import Image from 'next/image';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { format } from 'date-fns'
import { signOut, useSession } from 'next-auth/react';
import { usePageContext } from '../context/PageContext';
import styles from './userProfile.module.css'

export default function UserProfilePopup({ setUserProfileWindow }) {
    const [docs, setDocs] = useState([]);
    const { data: session, status } = useSession();

    if (status === 'loading') {
        return <div>Loading...</div>; // or a spinner component
    }

    const {
        editorHTML, setEditorHTML,
        strokes, setStrokes,
        textBoxes, setTextBoxes,
        whiteboardId, setWhiteboardId,
        title, setTitle 
    } = usePageContext();

    useEffect(() => {
        const fetchDocs = async () => {
            if (session?.user?.email) {
                const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/user/docs?email=${session.user.email}`);
                setDocs(res.data.historyDocs || []);
            }
        };
        fetchDocs();
    }, [session]);

    const handleLoadDoc = async (docId) => {
        try{
            // save current doc first
            await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/whiteboard/save`, {
                editorHTML, strokes, textBoxes, whiteboardId, userEmail: session.user.email, title,
            });
            // load new doc
            const res = await axios.get(`/api/whiteboard/load/${docId}?userEmail=${session.user.email}`);
            const { editorHTML, strokes, textBoxes, title} = res.data;
            setEditorHTML(editorHTML); setStrokes(strokes); setTextBoxes(textBoxes);
            setWhiteboardId(docId); setTitle(title); setUserProfileWindow(false);
        } catch (err) {
            console.error("Load failed", err);
        }
    };

    function formatDateTime (dateString) {
        if(!dateString) return '';
        return format(new Date(dateString), 'yyyy-MM-dd HH:mm:ss');
    }

    return (
        <div className={styles.backdrop}>
            <div className={styles.mainContainer}>
                <div className={styles.header}>
                    <h2>My whiteboards:</h2>
                </div>

                <div className={styles.docList}>
                    {docs.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).map(doc => (
                        <div key={doc.whiteboardId} className={styles.docItem} onClick={() => handleLoadDoc(doc.whiteboardId)}>
                            <div className={styles.docTitle}>{doc.title}</div>
                            <div className={styles.docMeta}>
                                <span>{doc.role}</span> · <span>{formatDateTime(doc.updatedAt)}</span>
                            </div>
                        </div>
                    ))}
                </div>

                <div className={styles.footer}>
                    <button className={styles.signOutButton} onClick={signOut}>Sign Out</button>
                </div>

                <div className={styles.closeButton}>
                    <Image
                        src="/icons/close.svg"
                        width={30}
                        height={30}
                        alt="close"
                        onClick={() => setUserProfileWindow(false)}
                        priority
                    />
                </div>
            </div>
        </div>
    );
};