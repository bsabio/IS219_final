import '../styles/globals.css';
import { useEffect } from 'react';

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    // Fix for SSR hydration
    if (typeof window !== 'undefined') {
      const style = document.getElementById('server-side-styles');
      if (style) {
        style.parentNode.removeChild(style);
      }
    }
  }, []);

  return <Component {...pageProps} />;
}

export default MyApp;