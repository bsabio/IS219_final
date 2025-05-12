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
const PORT = process.env.PORT || 3001; // Use a different port to avoid conflicts
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Middleware
app.use(express.static(__dirname));
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

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

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

    // For demonstration, use a simple function to simulate streaming responses
    const simulateResponse = async () => {
      const responses = {
        default: "I'm Alex Chen, an AI Research Specialist. That's an interesting question! As an AI Ethics researcher, I'd be happy to explore this topic with you further.",
        hello: "Hello there! I'm Alex Chen, the AI Research Specialist. It's nice to meet you! How can I assist you with AI research or ethics questions today?",
        ai: "Artificial Intelligence is a fascinating field that involves creating systems capable of performing tasks that typically require human intelligence. These include learning, reasoning, problem-solving, perception, and language understanding. As an AI Research Specialist, I focus on developing responsible AI systems with a focus on explainability and ethical considerations.",
        graph: "Graph-based AI approaches use graph structures to represent knowledge or model relationships between entities. Graph Neural Networks (GNNs) are particularly powerful for analyzing data with complex relationships. They can capture dependencies that traditional neural networks might miss, making them ideal for social networks, molecular structures, and recommendation systems.",
        ethical: "Ethical AI development is one of my core focuses. It involves ensuring AI systems are fair, transparent, accountable, and respect privacy. This includes mitigating bias in training data, making AI decision-making explainable, ensuring appropriate human oversight, and considering the broader societal impacts of AI systems.",
        streaming: "Streaming in AI interfaces refers to delivering content continuously as it's generated, rather than waiting for the complete response. This provides a more natural, conversational experience and reduces perceived latency. It's implemented using technologies like Server-Sent Events (SSE) or WebSockets to establish a continuous connection between server and client."
      };
      
      // Select response based on message content
      let responseText = responses.default;
      const lowercaseMessage = userMessage.toLowerCase();
      
      if (lowercaseMessage.includes('hello') || lowercaseMessage.includes('hi ') || lowercaseMessage.includes('hey')) {
        responseText = responses.hello;
      } else if (lowercaseMessage.includes('ai') || lowercaseMessage.includes('artificial intelligence')) {
        responseText = responses.ai;
      } else if (lowercaseMessage.includes('graph')) {
        responseText = responses.graph;
      } else if (lowercaseMessage.includes('ethic') || lowercaseMessage.includes('responsible')) {
        responseText = responses.ethical;
      } else if (lowercaseMessage.includes('stream') || lowercaseMessage.includes('real-time')) {
        responseText = responses.streaming;
      }
      
      // Stream each character with a small delay
      let fullContent = '';
      for (let i = 0; i < responseText.length; i++) {
        const char = responseText[i];
        fullContent += char;
        res.write(`data: ${JSON.stringify({ content: char })}\n\n`);
        await new Promise(resolve => setTimeout(resolve, 20)); // 20ms delay per character
      }
      
      // Add to conversation history
      conversationHistory.push({ role: 'assistant', content: fullContent });
      
      // Signal end of response
      res.write(`data: ${JSON.stringify({ content: '[DONE]' })}\n\n`);
      res.end();
    };

    try {
      // Decide whether to use the real API or simulate
      const useRealAPI = false; // Set to true to use the actual Groq API
      
      if (useRealAPI) {
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
      } else {
        // Use the simulation function instead
        await simulateResponse();
      }
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
});