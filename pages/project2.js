import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import styles from '../styles/DataVisualization.module.css';
import { useRouter } from 'next/router';

export default function Project2() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Create an iframe to load the chat application
    const handleIFrameLoad = () => {
      setLoading(false);
    };

    return () => {
      // Cleanup function
    };
  }, []);

  return (
    <div className={styles.container}>
      <Head>
        <title>AI Streaming Chat with Groq</title>
        <meta name="description" content="AI Streaming Chat application with real-time server-sent events powered by Groq" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main} style={{ padding: 0, margin: 0, height: '100vh', width: '100%' }}>
        {loading && (
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
            <h1 className={styles.title}>Loading AI Streaming Chat...</h1>
          </div>
        )}
        <iframe
          src="/project2/standalone-with-groq.html"
          style={{
            border: 'none',
            height: '100%',
            width: '100%'
          }}
          onLoad={() => setLoading(false)}
        />
      </main>
    </div>
  );
}