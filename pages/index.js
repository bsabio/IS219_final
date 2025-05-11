import Head from 'next/head';
import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import About from '../components/About';
import Projects from '../components/Projects';
import Contact from '../components/Contact';
import Footer from '../components/Footer';

export default function Home() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div>
      <Head>
        <title>Brandon Sabio | Portfolio</title>
        <meta name="description" content="Personal portfolio website showcasing my skills, projects, and journey as a Full Stack Developer" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {isClient && (
        <>
          <Navbar />

          <main>
            <Hero />
            <About />
            <Projects />
            <Contact />
          </main>

          <Footer />
        </>
      )}

      {!isClient && (
        <div style={{
          padding: '50px',
          fontFamily: 'Arial',
          textAlign: 'center',
          backgroundColor: '#f8f9fa',
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <h1 style={{ color: '#a5c8e4', fontSize: '3rem', marginBottom: '20px' }}>
            Loading...
          </h1>
        </div>
      )}
    </div>
  );
}