"use client"
import Image from 'next/image';
import { useState, useEffect } from 'react'
import styles from './share.module.css'
export default function SharePopup({ setShareWindow }) {
    const [showCopyMessage, setShowCopyMessage] = useState(false);

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

    return(
        <div className={styles.backdrop}>
            <div className={styles.mainContainer}>
                <div className={styles.urlContainer}>
                    <input 
                      type="text" 
                      value={typeof window !== "undefined" ? window.location.href : ""} 
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

                <div style={{fontSize: '18px', marginTop: '40px'}}>General Access Setting</div>
                                
                <div style={{ display: 'flex', alignItems: 'center', marginTop: '15px', width: '90%' }}>
                    <span style={{ marginRight: '10px', fontSize: '16px' }}>People with the link can:</span>
                    <select style={{ flexGrow: 1, padding: '6px', borderRadius: '5px', fontSize: '16px' }}>
                        <option>Can only view</option>
                        <option>Can View and edit</option>                        
                        <option>Can't view unless authorized</option>
                    </select>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', marginTop: '10px', width: '90%' }}>
                    <span style={{ marginRight: '10px', fontSize: '16px' }}>Authorized user can:</span>
                    <select style={{ flexGrow: 1, padding: '6px', borderRadius: '5px', fontSize: '16px' }}>
                        <option>Can only view</option>
                        <option>Can view and edit</option>
                    </select>
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