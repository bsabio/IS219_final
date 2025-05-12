import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

// Load environment variables
dotenv.config();

// Configure Express
const app = express();
const PORT = process.env.PORT || 3000;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
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

// Load character data
let character;
try {
  const characterData = await fs.readFile(path.join(__dirname, 'character.json'), 'utf8');
  character = JSON.parse(characterData);
} catch (error) {
  console.error('Error loading character data:', error);
  process.exit(1);
}

// Build system prompt from character data
function buildSystemPrompt() {
  return `You are ${character.name}, a ${character.age}-year-old ${character.gender} ${character.role}.
  
Biography: Born on ${character.background.birth_date}, you are ${character.background.nationality} currently located in ${character.background.location}. 
You have ${character.career.years_experience} years of experience and currently work as ${character.career.current_position}. 
Your specialty is ${character.career.specialty}.

Education: ${character.background.education.join(', ')}

Languages: ${character.background.languages.join(', ')}

Personality: You are ${character.personality.traits.join(', ')}. 
Your communication style is ${character.personality.communication_style}

Expertise: ${character.expertise.join(', ')}

Values: ${character.personality.values.join(', ')}

Personal Interests: ${character.interests.join(', ')}

Interaction Guidelines: Always maintain a ${character.interaction_guidelines.preferred_tone} tone. 
Provide ${character.interaction_guidelines.response_style}.
Avoid ${character.interaction_guidelines.avoid.join(', ')}.`;
}

// Store conversation history for each session
const conversationHistories = new Map();

// Chat endpoint with streaming response
app.post('/chat', async (req, res) => {
  try {
    const userMessage = req.body.message;
    const sessionId = req.body.sessionId || 'default';
    
    if (!userMessage) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Set up SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Get or initialize conversation history for this session
    if (!conversationHistories.has(sessionId)) {
      conversationHistories.set(sessionId, [
        { role: 'system', content: buildSystemPrompt() }
      ]);
    }
    
    // Get the current conversation history
    const conversationHistory = conversationHistories.get(sessionId);
    
    // Add the new user message to the conversation history
    conversationHistory.push({ role: 'user', content: userMessage });
    
    // Limit conversation history to last 10 messages to avoid token limits
    // But always keep the system prompt (first message)
    const systemPrompt = conversationHistory[0];
    const limitedHistory = conversationHistory.length > 11 
      ? [systemPrompt, ...conversationHistory.slice(-10)] 
      : [...conversationHistory];
    
    console.log('Calling Groq API with messages:', limitedHistory.map(m => ({ role: m.role, content_preview: m.content.substring(0, 20) })));

    // Function to process each chunk
    const processChunk = (chunk, res) => {
      try {
        const lines = chunk.split('\n').filter(line => line.trim());
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.substring(6);
            if (data === '[DONE]') continue;
            
            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices[0]?.delta?.content || '';
              if (content) {
                res.write(`data: ${JSON.stringify({ content })}\n\n`);
              }
              
              return content;
            } catch (e) {
              console.error('Error parsing JSON from chunk', e);
            }
          }
        }
        return '';
      } catch (e) {
        console.error('Error processing chunk', e);
        return '';
      }
    };

    try {
      // Call the Groq API directly
      const apiResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: 'llama3-8b-8192',
          messages: limitedHistory,
          stream: true,
          temperature: 0.7,
          max_tokens: 1024
        })
      });

      if (!apiResponse.ok) {
        const errorData = await apiResponse.text();
        console.error('API Error:', errorData);
        res.write(`data: ${JSON.stringify({ error: 'API error' })}\n\n`);
        return res.end();
      }

      // Use the text decoder
      const decoder = new TextDecoder();
      let fullResponse = '';
      
      // Handle streaming
      if (apiResponse.body) {
        const reader = apiResponse.body.getReader();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const content = processChunk(chunk, res);
          fullResponse += content;
        }
        
        if (fullResponse) {
          console.log('Adding AI response to conversation history:', fullResponse.substring(0, 30));
          conversationHistory.push({ role: 'assistant', content: fullResponse });
        }
      }

      // End the response
      res.write(`data: ${JSON.stringify({ content: '[DONE]' })}\n\n`);
      res.end();
      
    } catch (error) {
      console.error('API call error:', error);
      res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
      res.end();
    }
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Character loaded: ${character.name}, ${character.role}`);
  console.log(`Using Groq API with model: llama3-8b-8192`);
});