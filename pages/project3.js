import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

export default function Project3() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  return (
    <div>
      <Head>
        <title>Productivity Goal Tracker</title>
        <meta name="description" content="Track your productivity and visualize your progress towards your goals" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main style={{ padding: 0, margin: 0, height: '100vh', width: '100vw', overflow: 'hidden', position: 'fixed', top: 0, left: 0 }}>
        {loading && (
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 100 }}>
            <h1 style={{ color: '#5a6e7d', fontFamily: 'sans-serif' }}>Loading Productivity Tracker...</h1>
          </div>
        )}
        <iframe
          src="/project3/index.html"
          style={{
            border: 'none',
            height: '100vh',
            width: '100vw',
            position: 'absolute',
            top: 0,
            left: 0
          }}
          onLoad={() => setLoading(false)}
        />
      </main>
    </div>
  );
}