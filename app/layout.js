import './globals.css';

export const metadata = {
  title: 'Hour Management App',
  description: 'Track and manage your daily hours and activities'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Preload Material Icons font */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}