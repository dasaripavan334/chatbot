// Event listener for the send button (chatbot functionality)
document.getElementById('send-btn').addEventListener('click', () => {
  sendMessage();
});

// Event listener for the Enter key in the chat input
document.getElementById('chat-input').addEventListener('keydown', (event) => {
  if (event.key === 'Enter' && !event.shiftKey) { // Check if Enter key is pressed without Shift key
    event.preventDefault(); // Prevent the default behavior (e.g., adding a new line)
    sendMessage();
  }
});

// Function to send a message (both via button click and Enter key)
function sendMessage() {
  const userInput = document.getElementById('chat-input').value;
  if (userInput.trim()) { // Check if the input is not empty
    // Add user message to chat log
    addMessage('user', userInput);
    // Clear the input field
    document.getElementById('chat-input').value = '';
    // Get the chatbot response
    getResponse(userInput.toLowerCase());
  }
}

// Function to add a message to the chat log
function addMessage(user, message) {
  const chatLog = document.getElementById('chat-log');
  const messageElement = document.createElement('div');
  messageElement.classList.add('chat-message', user);
  messageElement.textContent = message;
  chatLog.appendChild(messageElement);
  // Ensure that the latest message is visible
  scrollToBottom();
  // Update background position
  updateBackgroundPosition();
}

// Function to get a response from the chatbot server
function getResponse(userInput) {
  fetch('http://localhost:5000/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message: userInput }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then((data) => {
      // Add bot response to chat log
      addMessage('bot', data.message);
      // Ensure the bot's response is the last visible message
      scrollToBottom();
    })
    .catch((error) => {
      console.error('Error fetching response:', error);
      // Handle errors by displaying a fallback message
      addMessage('bot', "I'm sorry, something went wrong.");
      scrollToBottom(); // Ensure error message is visible too
    });
}

// Function to update the background position
function updateBackgroundPosition() {
  const chatLog = document.getElementById('chat-log');
  // Get the scroll percentage
  const scrollPercentage = chatLog.scrollTop / (chatLog.scrollHeight - chatLog.clientHeight);
  // Calculate the background position based on scroll percentage
  const xOffset = Math.floor(scrollPercentage * 100);
  const yOffset = Math.floor(scrollPercentage * 100);
  document.body.style.backgroundPosition = `${xOffset}px ${yOffset}px`;
}

// Function to scroll to the bottom of the chat log
function scrollToBottom() {
  const chatLog = document.getElementById('chat-log');
  chatLog.scrollTop = chatLog.scrollHeight; // Scroll to the bottom
}
