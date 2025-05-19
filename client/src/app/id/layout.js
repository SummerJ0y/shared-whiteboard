import { PageContextProvider } from '../context/PageContext';
import Header from '../components/header';
import AuthProvider from '../AuthProvider';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // You already imported this in Header, but it's safe here too
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
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            closeOnClick
            pauseOnHover
            draggable
          />
        </PageContextProvider>
      </AuthProvider>
    </div>
  );
}