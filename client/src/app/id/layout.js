import { PageContextProvider } from '../context/PageContext';
import Header from '../components/header';
import AuthProvider from '../AuthProvider';
import styles from './layout.module.css';

export const metadata = {
  title: 'shared whiteboard',
  description: 'A online real-time shared whiteboard that is free to use!',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function IdLayout({ children }) {
  return (
      <div className={styles.mainContainer}>
        <AuthProvider>
          <PageContextProvider>          
              <Header />
              <div className={styles.whiteboard}>{children}</div>          
          </PageContextProvider>
        </AuthProvider>
      </div>
  );
}