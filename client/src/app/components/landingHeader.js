import Image from 'next/image';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useState } from "react";
import styles from './landingHeader.module.css';

export default function LandingHeader() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleOpenNewCanvas = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/whiteboard/create-canvas`);
      const canvasId = res.data.canvasId;
      router.push(`/id/${canvasId}`);
      // window.location.href = `/id/${canvasId}`;
    } catch (err) {
      console.error("Failed to create canvas:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.header}>
      <div className={styles.leftSection}>        
          <Image
            src="/favicon.ico"
            width={70}
            height={70}
            alt="logo"
            priority
            />        
      </div>

      <div className={styles.middleSection}>
        
          <div className={styles.menu}>About Us</div>
        
        
          <div className={styles.menu}>Projects</div>
        
        
          <div className={styles.menu}>Get Involved</div>
        
      </div>

      <div className={styles.rightSection}>
        
        <div
          className={styles.openButton}
          onClick={handleOpenNewCanvas}
          style={{ pointerEvents: loading ? 'none' : 'auto', opacity: loading ? 0.8 : 1 }}
        >
          {loading ? <div className={styles.spinner} /> : 'Try our whiteboard'}
        </div> 
      </div>
    </div>
  );
}