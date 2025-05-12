document.addEventListener('DOMContentLoaded', () => {
    // Get DOM elements
    const chatForm = document.getElementById('chat-form');
    const messageInput = document.getElementById('message-input');
    const chatbox = document.getElementById('chatbox');
    const sendButton = document.getElementById('send-button');

    // Track if we're currently processing a message
    let isProcessing = false;
    
    // Generate a unique session ID for this browser session
    // This helps maintain separate conversation histories for different users
    const sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

    // Add a new message to the chatbox
    function addMessage(content, isUser = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = isUser ? 'message user-message' : 'message ai-message';
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        
        messageDiv.appendChild(messageContent);
        chatbox.appendChild(messageDiv);
        
        if (isUser) {
            messageContent.textContent = content;
        } else {
            // This will be empty at first for AI messages and filled during streaming
            messageContent.innerHTML = content || '';
            
            // Return the message content element for streaming updates
            return messageContent;
        }
        
        // Scroll to the bottom of the chatbox
        chatbox.scrollTop = chatbox.scrollHeight;
    }

    // Process a text chunk from the stream
    function processStreamChunk(text, container) {
        // Work with a fresh copy of the text that has consistent line endings
        const normalizedText = text.replace(/\r\n/g, '\n');

        // Split the text by newlines and filter out empty lines
        const lines = normalizedText.split('\n').filter(line => line.trim() !== '');

        let responseText = '';

        for (const line of lines) {
            // Check if the line starts with "data:"
            if (line.startsWith('data:')) {
                // Extract the JSON payload
                const jsonStr = line.slice(5).trim();

                // Skip "[DONE]" markers
                if (jsonStr === '[DONE]') {
                    console.log('Stream completed');
                    continue;
                }

                try {
                    // Parse the JSON
                    const data = JSON.parse(jsonStr);

                    // Extract content if present
                    if (data.content) {
                        responseText += data.content;
                    }

                    // Check for errors
                    if (data.error) {
                        console.error('Error in stream:', data.error);
                        container.innerHTML = `<p class="error">Error: ${data.error}</p>`;
                        return false;
                    }
                } catch (err) {
                    // Continue even if parsing fails for one chunk
                    console.error('Error parsing JSON:', err);
                }
            }
        }

        // Update the message container if we got any content
        if (responseText) {
            const currentContent = container.innerHTML;
            container.innerHTML = currentContent + responseText;

            // Scroll to the bottom
            chatbox.scrollTop = chatbox.scrollHeight;
        }

        return true;
    }

    // Handle form submission
    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const message = messageInput.value.trim();
        if (!message || isProcessing) return;
        
        // Display user message
        addMessage(message, true);
        messageInput.value = '';
        
        // Disable input while processing
        isProcessing = true;
        messageInput.disabled = true;
        sendButton.disabled = true;
        
        // Create AI message container that will be filled during streaming
        const aiMessageContent = addMessage('');
        
        // Add typing indicator
        const typingIndicator = document.createElement('div');
        typingIndicator.className = 'typing-indicator';
        typingIndicator.innerHTML = '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>';
        aiMessageContent.appendChild(typingIndicator);
        
        try {
            console.log('Sending message:', message);
            
            // Make the fetch request to our server endpoint (using relative URL)
            const response = await fetch('/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    message,
                    sessionId
                }),
            });
            
            // Remove typing indicator
            if (typingIndicator.parentNode) {
                typingIndicator.parentNode.removeChild(typingIndicator);
            }
            
            // Check if the request was successful
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status}, ${errorText}`);
            }
            
            console.log('Response received, processing stream...');
            
            // Set up a text decoder
            const decoder = new TextDecoder();
            
            // Get a reader from the response body
            const reader = response.body.getReader();
            
            // Process the stream
            try {
                while (true) {
                    // Read a chunk
                    const { done, value } = await reader.read();
                    
                    // If we're done, break the loop
                    if (done) {
                        console.log('Stream complete');
                        break;
                    }
                    
                    // Decode the chunk
                    const chunk = decoder.decode(value, { stream: true });
                    
                    // Process the chunk
                    const success = processStreamChunk(chunk, aiMessageContent);
                    
                    // If there was an error, stop processing
                    if (!success) {
                        break;
                    }
                }
            } catch (error) {
                console.error('Error reading stream:', error);
                aiMessageContent.innerHTML = `<p class="error">Error reading response: ${error.message}</p>`;
            }
        } catch (error) {
            console.error('Error:', error);
            aiMessageContent.innerHTML = `<p class="error">Error: ${error.message}</p>`;
        } finally {
            // Re-enable input
            isProcessing = false;
            messageInput.disabled = false;
            sendButton.disabled = false;
            messageInput.focus();
            
            // Scroll to the bottom
            chatbox.scrollTop = chatbox.scrollHeight;
        }
    });

    // Focus the input field on page load
    messageInput.focus();
});