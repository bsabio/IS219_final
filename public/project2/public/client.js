document.addEventListener('DOMContentLoaded', () => {
    // Get DOM elements
    const chatForm = document.getElementById('chat-form');
    const messageInput = document.getElementById('message-input');
    const chatbox = document.getElementById('chatbox');
    const sendButton = document.getElementById('send-button');

    // Track if we're currently processing a message
    let isProcessing = false;

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
            // Start SSE connection to stream the response
            const response = await fetch('/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message }),
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            // Handle streaming response
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let aiResponse = '';
            
            // Remove typing indicator
            if (typingIndicator.parentNode) {
                typingIndicator.parentNode.removeChild(typingIndicator);
            }
            
            // Process the stream
            while (true) {
                const { value, done } = await reader.read();
                
                if (done) {
                    break;
                }
                
                // Decode the chunk
                const chunk = decoder.decode(value, { stream: true });
                
                // Parse the SSE format (data: {...})
                const lines = chunk.split('\n\n');
                
                for (const line of lines) {
                    if (line.startsWith('data:')) {
                        try {
                            const eventData = JSON.parse(line.slice(5));
                            
                            // Check if this is the end marker
                            if (eventData.content === '[DONE]') {
                                continue;
                            }
                            
                            // Append the content
                            if (eventData.content) {
                                aiResponse += eventData.content;
                                aiMessageContent.innerHTML = aiResponse;
                                
                                // Scroll to the bottom as new content arrives
                                chatbox.scrollTop = chatbox.scrollHeight;
                            }
                            
                            // Handle error
                            if (eventData.error) {
                                throw new Error(eventData.error);
                            }
                        } catch (parseError) {
                            console.error('Error parsing SSE data:', parseError);
                        }
                    }
                }
            }
            
        } catch (error) {
            console.error('Error:', error);
            aiMessageContent.innerHTML = `<p class="error">Sorry, there was an error processing your request. Please try again later.</p>`;
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