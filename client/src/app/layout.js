import { PageContextProvider } from './context/PageContext';
import Header from './components/header';
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
      <body className={styles.mainContainer}>
        <PageContextProvider>          
            <Header />
            <main className={styles.whiteboard}>{children}</main>          
        </PageContextProvider>
      </body>
    </html>
  );
}

