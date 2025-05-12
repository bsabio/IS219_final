import express from 'express';

const app = express();
const PORT = 3000;

// Middleware
app.use(express.static('public'));
app.use(express.json());

// Add CORS headers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'GET, POST');
    return res.status(200).json({});
  }
  next();
});

// Simple chat endpoint that just echoes back the message
app.post('/chat', (req, res) => {
  const userMessage = req.body.message;
  
  // Set up SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  
  // Echo back the message character by character with a delay
  const sendResponse = async () => {
    const response = `I received your message: "${userMessage}". This is just a test server that echoes back your messages to verify the streaming functionality is working correctly.`;
    
    for (let i = 0; i < response.length; i++) {
      // Send one character at a time
      res.write(`data: ${JSON.stringify({ content: response[i] })}\n\n`);
      
      // Add a small delay to simulate streaming
      await new Promise(resolve => setTimeout(resolve, 20));
    }
    
    // End the response
    res.write(`data: ${JSON.stringify({ content: '[DONE]' })}\n\n`);
    res.end();
  };
  
  sendResponse().catch(err => {
    console.error('Error sending response:', err);
    res.write(`data: ${JSON.stringify({ error: 'Error sending response' })}\n\n`);
    res.end();
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Test server running on http://localhost:${PORT}`);
});