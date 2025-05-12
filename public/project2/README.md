# Streaming Chat with Groq AI

This project implements a streaming chat application with a customizable AI character persona using the Groq AI API. The application features:

- Real-time streaming responses from the AI using Llama 3 8B model
- Customizable AI character persona via JSON configuration
- Clean, responsive user interface
- Server-Sent Events (SSE) for efficient streaming

## Prerequisites

Before running this application, you'll need:

- Node.js (v14 or higher)
- A Groq AI API key (already included in the .env file)

## Installation

1. Clone the repository
2. Navigate to the project directory
3. Install dependencies:

```bash
npm install
```

4. The environment variables are already configured with a Groq API key

## Running the Application

For development:

```bash
npm run dev
```

For production:

```bash
npm start
```

The application will be available at `http://localhost:3000` (or the port specified in your `.env` file).

## Customizing the AI Character

You can customize the AI character by modifying the `character.json` file. This file contains the personality, background, and interaction style of the AI assistant.

## Project Structure

```
/project2
├── public/           # Static assets and client-side code
│   ├── index.html    # Main HTML file
│   ├── style.css     # CSS styles
│   └── client.js     # Client-side JavaScript
├── .env              # Environment variables
├── character.json    # AI character configuration
├── package.json      # Project dependencies
├── server.js         # Express server and API integration
└── README.md         # Project documentation
```

## How It Works

1. The server loads a character definition from `character.json`
2. When a user sends a message, it's sent to the server via a POST request
3. The server forwards the message to the GraphAI API with streaming enabled
4. As responses arrive from the API, they're streamed back to the client
5. The client displays each chunk of the response as it arrives

## About Groq AI

This project uses Groq AI, which provides fast and efficient AI model inference. The implementation uses the Llama 3 8B model for generating chat responses.

Key features of the Groq integration:
1. Extremely fast response times compared to other providers
2. Streaming support for real-time responses
3. High-quality responses from Llama 3 8B
4. Simple API compatible with OpenAI's chat format

You can learn more about Groq at [https://groq.com/](https://groq.com/)

## License

MIT