(function() {
  // Generate a unique session ID
  function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
  console.log("sending message")
  // Configuration (can be customized when embedding)
  const config = {
    title: "WordPressss Whisper",
    subtitle: "Got a question? Ask away!",
    primaryColor: "#e83e2f",
    initialMessage: "His there! 👋 How can I help you today?",
    position: "bottom-right", // "bottom-right" or "bottom-left"
    webhookUrl: "https://aisolv.app.n8n.cloud/webhook/6cf02e8f-eda1-4eaa-b931-d7e861eeb82f", // New configuration option for webhook URL
    sessionId: uuidv4() // Generate a unique session ID
  };

  // Create wrapper element for the widget
  const wrapper = document.createElement('div');
  wrapper.id = 'wordpress-whisper-widget';
  
  // Check if the widget already exists to prevent duplicates
  if (document.getElementById('wordpress-whisper-widget')) {
    console.warn('WordPress Whisper widget already exists on this page.');
    return;
  }
  
  wrapper.style.position = 'fixed';
  wrapper.style.zIndex = '9999';
  wrapper.style.bottom = '20px';
  wrapper.style[config.position === 'bottom-right' ? 'right' : 'left'] = '20px';

  // State
  let isOpen = false;
  let messages = [];

  // Create chat button
  function createChatButton() {
    const button = document.createElement('button');
    button.className = 'wp-whisper-chat-button';
    button.innerHTML = isOpen ? 
      '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>' :
      '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>';
    
    button.style.width = '56px';
    button.style.height = '56px';
    button.style.borderRadius = '50%';
    button.style.backgroundColor = config.primaryColor;
    button.style.color = 'white';
    button.style.border = 'none';
    button.style.cursor = 'pointer';
    button.style.display = 'flex';
    button.style.alignItems = 'center';
    button.style.justifyContent = 'center';
    button.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.15)';
    button.style.transition = 'transform 0.3s';
    
    button.addEventListener('mouseover', function() {
      button.style.transform = 'scale(1.1)';
    });
    
    button.addEventListener('mouseout', function() {
      button.style.transform = 'scale(1)';
    });
    
    button.addEventListener('click', toggleChat);
    
    return button;
  }

  // Create chat window
  function createChatWindow() {
    const chatWindow = document.createElement('div');
    chatWindow.className = 'wp-whisper-chat-window';
    
    chatWindow.style.width = '350px';
    chatWindow.style.maxHeight = '500px';
    chatWindow.style.backgroundColor = 'white';
    chatWindow.style.borderRadius = '10px';
    chatWindow.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.15)';
    chatWindow.style.display = isOpen ? 'flex' : 'none';
    chatWindow.style.flexDirection = 'column';
    chatWindow.style.marginBottom = '10px';
    chatWindow.style.overflow = 'hidden';
    
    // Chat header
    const header = document.createElement('div');
    header.className = 'wp-whisper-chat-header';
    header.style.backgroundColor = config.primaryColor;
    header.style.color = 'white';
    header.style.padding = '15px';
    header.style.display = 'flex';
    header.style.alignItems = 'center';
    header.style.justifyContent = 'space-between';
    header.style.fontFamily = 'Segoe UI';
    
    const headerTextDiv = document.createElement('div');
    
    const headerTitle = document.createElement('h3');
    headerTitle.textContent = config.title;
    headerTitle.style.margin = '0';
    headerTitle.style.fontSize = '16px';
    headerTitle.style.fontWeight = '600';
    headerTitle.style.fontFamily = 'Segoe UI';
    headerTitle.style.color = 'white';
    
    const headerSubtitle = document.createElement('p');
    headerSubtitle.textContent = config.subtitle;
    headerSubtitle.style.margin = '4px 0 0';
    headerSubtitle.style.fontSize = '12px';
    headerSubtitle.style.opacity = '0.9';
    headerSubtitle.style.fontFamily = 'Segoe UI';
    headerSubtitle.style.color = 'white';
    
    headerTextDiv.appendChild(headerTitle);
    headerTextDiv.appendChild(headerSubtitle);
    
    const closeButton = document.createElement('button');
    closeButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
    closeButton.style.backgroundColor = 'transparent';
    closeButton.style.border = 'none';
    closeButton.style.color = 'white';
    closeButton.style.cursor = 'pointer';
    closeButton.style.padding = '0';
    closeButton.style.opacity = '0.8';
    closeButton.addEventListener('mouseover', function() {
      closeButton.style.opacity = '1';
    });
    closeButton.addEventListener('mouseout', function() {
      closeButton.style.opacity = '0.8';
    });
    closeButton.addEventListener('click', toggleChat);
    
    header.appendChild(headerTextDiv);
    header.appendChild(closeButton);
    
    // Chat messages container
    const messagesContainer = document.createElement('div');
    messagesContainer.className = 'wp-whisper-chat-messages';
    messagesContainer.style.padding = '15px';
    messagesContainer.style.overflowY = 'auto';
    messagesContainer.style.flexGrow = '1';
    messagesContainer.style.backgroundColor = '#f9fafb';
    messagesContainer.style.height = '300px';

    // Add messages to container
    if (messages.length === 0) {
      // Add initial message
      
      //addBotMessage(config.initialMessage);
    }
    
    messages.forEach(message => {
      const messageElement = createMessageElement(message);
      messagesContainer.appendChild(messageElement);
    });
    
    // Chat input
    const inputContainer = document.createElement('div');
    inputContainer.className = 'wp-whisper-chat-input';
    inputContainer.style.padding = '10px';
    inputContainer.style.borderTop = '1px solid #e5e7eb';
    inputContainer.style.display = 'flex';
    inputContainer.style.alignItems = 'center';
    
    const inputDiv = document.createElement('div');
    inputDiv.style.display = 'flex';
    inputDiv.style.alignItems = 'center';
    inputDiv.style.backgroundColor = '#f3f4f6';
    inputDiv.style.borderRadius = '9999px';
    inputDiv.style.paddingRight = '8px';
    inputDiv.style.width = '100%';
    
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Type your message...';
    input.style.flex = '1';
    input.style.padding = '8px 12px';
    input.style.border = 'none';
    input.style.outline = 'none';
    input.style.backgroundColor = 'transparent';
    input.style.borderRadius = '9999px';
    
    const sendButton = document.createElement('button');
    sendButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>';
    sendButton.style.backgroundColor = 'transparent';
    sendButton.style.border = 'none';
    sendButton.style.color = config.primaryColor;
    sendButton.style.cursor = 'pointer';
    sendButton.style.display = 'flex';
    sendButton.style.alignItems = 'center';
    sendButton.style.justifyContent = 'center';
    sendButton.style.padding = '8px';
    sendButton.id = "sendButton";
    
    async function sendMessage() {
      const message = input.value.trim();
      if (!message) return;
      
      addUserMessage(message);
      input.value = '';

      
      // Simulate bot typing
      // Show typing indicator
      const messagesContainer = document.querySelector('.wp-whisper-chat-messages');
      const typingIndicator = createTypingIndicator();
      messagesContainer.appendChild(typingIndicator);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;

      console.log("sending message")

      await generateBotResponse(message);
      messagesContainer.removeChild(typingIndicator);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    
    sendButton.addEventListener('click', sendMessage);
    
    input.addEventListener('keypress', function(e) {
      if (e.key === 'Enter' && !sendButton.disabled) {
        sendMessage();
      }
    });
    
    inputDiv.appendChild(input);
    inputDiv.appendChild(sendButton);
    
    inputContainer.appendChild(inputDiv);
    
    // Assemble chat window
    chatWindow.appendChild(header);
    chatWindow.appendChild(messagesContainer);
    chatWindow.appendChild(inputContainer);
    
    // Focus input when chat opens
    if (isOpen) {
      setTimeout(() => input.focus(), 100);
    }
    
    return chatWindow;
  }

  // Create message element
  function createMessageElement(message) {
    const { text, isUser, timestamp } = message;
    
    const messageContainer = document.createElement('div');
    messageContainer.style.display = 'flex';
    messageContainer.style.flexDirection = 'column';
    messageContainer.style.alignItems = isUser ? 'flex-end' : 'flex-start';
    messageContainer.style.marginBottom = '15px';
    messageContainer.style.maxWidth = '100%';
    messageContainer.style.alignSelf = isUser ? 'flex-end' : 'flex-start';
    
    const messageBubble = document.createElement('div');
    // messageBubble.textContent = text;
    const dataHTML = marked.parse(text);
    // If it's just a single <p>...</p>, strip the wrapper
    if (dataHTML.startsWith('<p>') && dataHTML.endsWith('</p>')) {
      dataHTML = dataHTML.slice(3, -4);
    }
    console.log("datahtml", dataHTML)
    messageBubble.innerHTML = dataHTML;
    console.log("bubble inner 1", messageBubble.innerHTML)
    messageBubble.style.padding = '10px 14px';
    messageBubble.style.fontSize = '14px';
    messageBubble.style.padding = '6px 10px';
    messageBubble.style.borderRadius = '16px';
    messageBubble.style.maxWidth = '100%';
    messageBubble.style.wordBreak = 'break-word';
    console.log("bubble inner 2", messageBubble.innerHTML)
    
    if (isUser) {
      messageBubble.style.backgroundColor = config.primaryColor;
      messageBubble.style.color = 'white';
      messageBubble.style.borderBottomRightRadius = '4px';
      console.log("bubble inner 3", messageBubble.innerHTML)
    } else {
      messageBubble.style.backgroundColor = 'white';
      messageBubble.style.color = '#1f2937';
      messageBubble.style.borderBottomLeftRadius = '4px';
      messageBubble.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.1)';
      console.log("bubble inner 4", messageBubble.innerHTML)
    }
    
    const timeElement = document.createElement('span');
    const timeString = new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    timeElement.textContent = timeString;
    timeElement.style.fontSize = '11px';
    timeElement.style.color = '#6b7280';
    timeElement.style.marginTop = '4px';
    
    messageContainer.appendChild(messageBubble);
    console.log("bubble inner final", messageBubble.innerHTML)
    messageContainer.appendChild(timeElement);
    
    return messageContainer;
  }

  // Create typing indicator
  function createTypingIndicator() {
    const container = document.createElement('div');
    container.className = 'wp-whisper-typing-indicator';
    container.style.display = 'flex';
    container.style.alignItems = 'center';
    container.style.margin = '0 0 15px 0';
    
    const dotsContainer = document.createElement('div');
    dotsContainer.style.backgroundColor = '#e5e7eb';
    dotsContainer.style.borderRadius = '16px';
    dotsContainer.style.padding = '8px 14px';
    dotsContainer.style.display = 'flex';
    dotsContainer.style.alignItems = 'center';
    
    for (let i = 0; i < 3; i++) {
      const dot = document.createElement('div');
      dot.style.width = '6px';
      dot.style.height = '6px';
      dot.style.borderRadius = '50%';
      dot.style.backgroundColor = '#9ca3af';
      dot.style.margin = '0 2px';
      dot.style.animation = 'wp-whisper-bounce 1.4s infinite ease-in-out both';
      dot.style.animationDelay = `${i * 0.16}s`;
      dotsContainer.appendChild(dot);
    }
    
    container.appendChild(dotsContainer);
    return container;
  }

  // Toggle chat window
  function toggleChat() {
    isOpen = !isOpen;
    console.log("toggleChat")
    render();
  }

  // Add user message
  function addUserMessage(text) {
    const message = {
      text,
      isUser: true,
      timestamp: new Date()
    };
    
    
    messages.push(message);
    
    console.log("addUserMessage")
    render();
  }

  // Add bot message
  async function addBotMessage(text) {
    // Send message to webhook if configured
    if (config.webhookUrl) {
      const response = await sendToWebhook({
        text: text,
        isUser: false,
        timestamp: new Date().toISOString()
      });

      const responseMessage = {
        text: response.myField,
        isUser: false,
        timestamp: new Date().toISOString()
      };
      messages.push(responseMessage);
    }
    
    console.log("addBotMessage")
    render();
  }

  // Send message to webhook
  async function sendToWebhook(messageData) {
    console.log("sending webhook")
    if (!config.webhookUrl) {
      console.log("not config")
      return;
    }

    const sendButton = document.getElementById("sendButton");
    sendButton.style.cursor = 'default';
    sendButton.style.opacity = '0.5';
    sendButton.disabled = true;

    try {
      const response = await fetch(config.webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: messageData.text,
          isUser: messageData.isUser,
          timestamp: messageData.timestamp,
          pageUrl: window.location.href,
          pageTitle: document.title,
          sessionId: config.sessionId
        }),
      });

      const responseData = await response.json();
      console.log("Webhook response:", responseData);
      return responseData;
      
    } catch (error) {
      console.error("Failed to send message to webhook:", error);
    }
  }

  // Generate bot response
  async function generateBotResponse(userMessage) {
    const responses = [
      "Thanks for your message! How else can I help you with your WordPress site?",
      "Great question! WordPress has many features that can help with that.",
      "I understand what you're asking. Let me guide you through the solution...",
      "That's a common WordPress question. Here's what you need to know...",
      "I'm here to help with all your WordPress questions and concerns!",
    ];
    
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    await addBotMessage(userMessage);
  }

  // Render the widget
  function render() {
    // Clear existing content
    wrapper.innerHTML = '';
    
    // Add CSS for animations
    if (!document.getElementById('wp-whisper-styles')) {
      const styleElement = document.createElement('style');
      styleElement.id = 'wp-whisper-styles';
      styleElement.textContent = `
        @keyframes wp-whisper-bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }
      `;
      document.head.appendChild(styleElement);
    }
    
    // Add the chat window if open
    if (isOpen) {
      wrapper.appendChild(createChatWindow());
      // Scroll to bottom after rendering new messages
      const container = document.querySelector('.wp-whisper-chat-messages');
      container.scrollTop = container.scrollHeight;
      
    }
    
    // Add the chat button
    wrapper.appendChild(createChatButton());

    console.log("render func")
  }

  // Initialize widget with custom config
  function initWidget(customConfig = {}) {
    // Merge default config with custom config
    Object.assign(config, customConfig);
    
    // Add widget to the page
    document.body.appendChild(wrapper);
    
    // Initial render
    console.log("initWidget")
    render();
  }
  
  // Expose widget initialization function
  window.WordPressWhisper = {
    init: initWidget
  };
  
  // Auto-initialize with default config if script has data-autoload attribute
  const scriptTag = document.currentScript;
  if (scriptTag && scriptTag.getAttribute('data-autoload') === 'true') {
    // Get configuration from data attributes
    const dataConfig = {};
    if (scriptTag.getAttribute('data-title')) dataConfig.title = scriptTag.getAttribute('data-title');
    if (scriptTag.getAttribute('data-subtitle')) dataConfig.subtitle = scriptTag.getAttribute('data-subtitle');
    if (scriptTag.getAttribute('data-color')) dataConfig.primaryColor = scriptTag.getAttribute('data-color');
    if (scriptTag.getAttribute('data-message')) dataConfig.initialMessage = scriptTag.getAttribute('data-message');
    if (scriptTag.getAttribute('data-position')) dataConfig.position = scriptTag.getAttribute('data-position');
    if (scriptTag.getAttribute('data-webhook')) dataConfig.webhookUrl = scriptTag.getAttribute('data-webhook');
    
    // Initialize widget
    initWidget(dataConfig);
  }
})();
