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