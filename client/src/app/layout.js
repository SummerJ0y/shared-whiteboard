import './globals.css';
import styles from './layout.module.css';

export const metadata = {
  title: 'shared whiteboard',
  description: 'A online real-time shared whiteboard that is free to use!',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <main className={styles.main}>{children}</main>
      </body>
    </html>
  );
}

