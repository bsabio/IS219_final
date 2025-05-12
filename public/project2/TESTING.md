# Testing the Streaming Chat Application

To test this application, follow these steps:

## Prerequisites
1. Make sure you have Node.js installed (v14 or higher)
2. Obtain a valid API key from your AI provider
3. Update the `.env` file with your API key and endpoint

## Installation
1. Install the dependencies:
```bash
npm install
```

## Running the Application
1. Start the development server:
```bash
npm run dev
```

2. Open your browser and navigate to `http://localhost:3000`

## Testing Scenarios

### 1. Basic Functionality
- Verify that the chat interface loads correctly
- Send a simple message like "Hello" and check if the response streams in real-time
- Confirm that the AI's response matches the character persona defined in `character.json`

### 2. Error Handling
- Test with an invalid API key in the `.env` file
- Verify that appropriate error messages appear in the UI
- Check server logs for detailed error information

### 3. UI/UX
- Test on different devices and screen sizes to ensure responsive design
- Verify that typing indicators work correctly
- Ensure the chat scrolls to the bottom when new messages arrive

### 4. Performance
- Test with long conversations to ensure continued functionality
- Monitor memory usage during extended use

## Debugging

If you encounter issues:

1. Check the browser console for client-side errors
2. Review the terminal output for server-side errors
3. Verify your API key and URL in the `.env` file
4. Ensure the response format in `server.js` matches what your AI provider expects

## Modifying for Different AI Providers

If you're using an AI provider other than GraphAI, you may need to:

1. Update the API endpoint format in the `.env` file
2. Modify the request structure in `server.js` to match the provider's API
3. Adjust how the streaming response is processed based on the provider's format

## Known Limitations

- The current implementation assumes a specific response format from the AI provider
- Customization is done through `character.json` and may need adjustments for different AI models
- The streaming implementation may require modifications for different AI providers