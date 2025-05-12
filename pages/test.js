import Head from 'next/head';

export default function Test() {
  return (
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
      <Head>
        <title>Test Page | Portfolio</title>
        <meta name="description" content="Test page" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <h1 style={{ color: '#a5c8e4', fontSize: '3rem', marginBottom: '20px' }}>
        Test Page
      </h1>
      <p style={{ color: '#5a6e7d', fontSize: '1.2rem', maxWidth: '600px' }}>
        This is a test page to ensure Next.js is working properly. If you can see this page,
        the basic rendering functionality is working.
      </p>
      <div style={{ 
        marginTop: '30px', 
        padding: '15px 30px', 
        backgroundColor: '#a5c8e4', 
        color: 'white',
        borderRadius: '30px',
        cursor: 'pointer'
      }}>
        Test Button
      </div>
    </div>
  );
}