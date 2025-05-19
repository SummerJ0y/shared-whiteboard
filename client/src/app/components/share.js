"use client"
import Image from 'next/image';
import { useState, useEffect } from 'react'
import axios from 'axios';
import { useSession } from 'next-auth/react';
import { usePageContext } from '../context/PageContext';
import styles from './share.module.css'

export default function SharePopup({ setShareWindow }) {
    const [showCopyMessage, setShowCopyMessage] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');
    const [accessLevel, setAccessLevel] = useState('restricted'); // initial
    const [authorizedUsers, setAuthorizedUsers] = useState([]);
    const { data: session } = useSession();
    const { whiteboardId } = usePageContext();
    const [currentURL, setCurrentURL] = useState('');

    const handleCopy = () => {
        if (navigator.clipboard) {
          navigator.clipboard.writeText(window.location.href).then(() => {
            setShowCopyMessage(true);
            setTimeout(() => {
              setShowCopyMessage(false);
            }, 5000); // 5 seconds
          });
        } else {
          console.warn("Clipboard API not available.");
        }
    };

    const fetchAccessInfo = async () => {
        try{
            const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/whiteboard/access/${whiteboardId}`);
            setAccessLevel(res.data.visibility);
            setAuthorizedUsers(res.data.users || []);
        } catch (err) {
            console.error("Failed to fetch access info", err);
        }
    };

    useEffect(() => {
        setCurrentURL(window.location.href);
    }, []);

    useEffect(() => {
        if (whiteboardId) {
            fetchAccessInfo();
        }
    }, [whiteboardId])

    const handleInvite = async () => {
        if (!inviteEmail) return;
        try {
            await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/whiteboard/invite`, {
                whiteboardId,
                email: inviteEmail,
            });
            setInviteEmail('');
            fetchAccessInfo();
        } catch (err) {
            console.error("Invite failed", err);
        }
    };

    const handleVisibilityChange = async (e) => {
        const newSetting = e.target.value === `Can't view unless authorized` ? 'restricted' : 'public';
        setAccessLevel(newSetting);
        try {
            await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/whiteboard/visibility`, {
                whiteboardId,
                visibility: newSetting,
            });
        } catch (err) {
            console.error("Failed to update visibility", err);
        }
    };

    const handleRoleChange = async (email, newRole) => {
        if (newRole === 'remove') {
            try {
                await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/whiteboard/removeUser`, {
                    whiteboardId,
                    email,
                });
            } catch (err) {
                console.error("Failed to remove user", err);
            }
        } else {
            try {
                await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/whiteboard/updateRole`, {
                    whiteboardId,
                    email,
                    role: newRole,
                });
            } catch (err) {
                console.error("Failed to update role", err);
            }
        }
        fetchAccessInfo();
    };

    return(
        <div className={styles.backdrop}>
            <div className={styles.mainContainer}>
                <div className={styles.urlContainer}>
                    <input 
                        type="text" 
                        value={currentURL} 
                        readOnly 
                        className={styles.urlBar}
                    />
                    <button className={styles.copyButton} onClick={handleCopy}>Copy</button>

                    {showCopyMessage && (
                        <div className={styles.copyMessage}>
                            Copied to your clipboard!
                        </div>
                    )}
                </div>

                <div style={{display: 'flex', frontSize: '16px', marginTop: '5px', justifyContent: 'start', width: '90%'}}>Invite by email:</div>

                <div style={{ display: 'flex', marginTop: '5px', gap: '10px', width: '90%' }}>
                    <input
                        type="email"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        placeholder="Enter email"
                        className={styles.urlBar}
                    />
                    <button onClick={handleInvite} className={styles.copyButton}>Invite</button>
                </div>

                <div style={{fontSize: '18px', marginTop: '40px'}}>General Access Setting</div>
                                
                <div style={{ display: 'flex', alignItems: 'center', marginTop: '15px', width: '90%' }}>
                    <span style={{ marginRight: '10px', fontSize: '16px' }}>Anyone with the link</span>
                    <select
                        style={{ flexGrow: 1, padding: '6px', borderRadius: '5px', fontSize: '16px' }}
                        value={accessLevel === 'public' ? 'Can View and edit' : `Can't view unless authorized`}
                        onChange={handleVisibilityChange}
                    >
                        <option>Can only view</option>
                        <option>Can View and edit</option>                        
                        <option>Can't view unless authorized</option>
                    </select>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', marginTop: '10px', width: '90%' }}>
                    <span style={{ marginRight: '10px', fontSize: '16px' }}>Authorized users</span>
                    <select style={{ flexGrow: 1, padding: '6px', borderRadius: '5px', fontSize: '16px' }}>
                        <option>Can view and edit</option>
                        <option>Can only view</option>
                    </select>
                </div>
                
                <div style={{ fontSize: '18px', marginTop: '30px', width: '90%' }}>Current Authorized Users</div>
                <div style={{ maxHeight: '200px', overflowY: 'auto', width: '90%', marginTop: '10px', border: '1px solid #ccc', borderRadius: '8px', padding: '10px' }}>
                    {authorizedUsers.map((user, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                            <div style={{ flex: 2 }}>
                                {/* <div style={{ fontWeight: 'bold' }}>{user.name || 'Unknown User'}</div> */}
                                <div>{user.email}</div>
                            </div>
                            {user.role === 'owner' ? (
                                <span style={{ flex: 1, padding: '5px', fontWeight: 'bold' }}>owner</span>
                            ) : (
                            <select
                                value={user.role}
                                onChange={(e) => handleRoleChange(user.email, e.target.value)}
                                style={{ flex: 1, padding: '5px', borderRadius: '5px' }}
                            >
                                <option value="read-only">read-only</option>
                                <option value="editor">editor</option>
                                <option value="remove">Remove</option>
                            </select>
                            )}
                        </div>
                    ))}
                </div>


                <div className={styles.closeButton}>
                    <Image
                      src="/icons/close.svg"
                      width={30}
                      height={30}
                      alt="close"
                      onClick={() => setShareWindow(false)}
                      priority
                    />
                </div>
            </div>
        </div>
    );
}