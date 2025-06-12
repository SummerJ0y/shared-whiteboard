'use client';
import Image from 'next/image';

import LandingHeader from './components/landingHeader';
import styles from './page.module.css';

export default function HomePage() {
  
  return (
    <div className={styles.main}>
      <LandingHeader />
      <h1>Shared Whiteboard</h1>
      <h2>Free online freeform collaborative workspace.</h2>
      <div className={styles.textBox}>
        <p>
          Shared Whiteboard is a real-time online collaboration tool that lets you sketch ideas, co-edit documents, and brainstorm visually — all in one place. Whether you are working solo or with a team, it’s fast, flexible, and completely free to use.
        </p>
      </div>
      <div className={styles.demo}>
        <div className={styles.row1}>
          <div className={styles.demoImage}>
            <Image src="/pic1.jpg" width={1071} height={600} alt="pic1" priority />
          </div>
          <div className={styles.demoText}>
            <p>
              Experience seamless collaboration with live updates across users. Draw freeform sketches, add text, or type structured notes — all changes appear instantly for everyone. Our rich text editor and intuitive canvas are designed to help teams ideate visually and document simultaneously, without friction.
            </p>
          </div>
        </div>

        <div className={styles.row1}>
          <div className={styles.demoImage}>
            <Image src="/pic2.jpg" width={1071} height={600} alt="pic2" priority/>
          </div>
          <div className={styles.demoText}>
            <p>
              Invite teammates by email and assign them roles like owner, editor, or read-only. Documents can be set to public or restricted, giving you complete control over who can view or edit. Sharing is as simple as sending a link, with flexible permissions built in for secure collaboration.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}