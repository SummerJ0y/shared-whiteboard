import './globals.css';

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
      <body>{children}</body>
    </html>
  );
}

