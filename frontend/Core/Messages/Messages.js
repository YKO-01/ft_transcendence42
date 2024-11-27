class Messages extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.chatSockets = {};
        this.target = null;
        this.init();
    }

    init() {
        const container = document.createElement('div');
        container.className = "container"
        container.innerHTML = `
            <div class="chat-container">
                <div class="sidebar">
                    <div class="sidebar-header">
                        <h2 class="text-dark">Messages</h2>
                    </div>
                    <div class="chat-list">
                        <!-- Chat list items will be inserted here -->
						
                    </div>
                </div>
                
                <div class="chat-empty">
                    <div class="empty-state">
                        <svg class="chat-icon" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M20,2H4A2,2 0 0,0 2,4V22L6,18H20A2,2 0 0,0 22,16V4A2,2 0 0,0 20,2M6,9H18V11H6M14,14H6V12H14M18,8H6V6H18" />
                        </svg>
                        <h3>Your Messages</h3>
                        <p>Select a conversation to start chatting</p>
                    </div>
                </div>

                <div class="chat-main hidden">
                    <div class="chat-header">
                        <div class="chat-header-info">
                            <!-- Chat header will be inserted here -->
							
                        </div>
                    </div>
                    
                    <div class="messages-container">
                        <div class="messages-list">
						
                            <!-- Messages will be inserted here -->
                        </div>
                    </div>
                    
                    <div class="chat-input">
                        <div class="input-container">
                            <input type="text" placeholder="Type a message...">
                            <button class="emoji-button">😊</button>
                            <button class="send-button">
                                <svg viewBox="0 0 24 24" width="24" height="24">
                                    <path fill="currentColor" d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                                </svg>
                            </button>
                        </div>
                        <div class="emoji-picker hidden"></div>
                    </div>
                </div>
            </div>
        `;
        const style = document.createElement('style');
        style.textContent = `
            
        @import url('https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css');
            .chat-container {
                background: #020D14 !important;
                display: flex;
                height: 80vh;
                position: relative;
            }

            /* Sidebar Styles */
            .sidebar {
                width: 320px;
                border-right: 1px solid #fff;
                display: flex;
                flex-direction: column;
                background: #E0EDF2;
            }

            .sidebar-header {
                padding: 16px;
                border-bottom: 1px solid var(--divider-color);
            }

            .sidebar-header h2 {
                margin: 0;
                font-size: 24px;
                font-weight: 600;
            }

            .chat-list {
                flex: 1;
                overflow-y: auto;
                padding: 8px;
            }

            /* Chat List Item Styles */
            .chat-list-item {
                padding: 12px;
                border-radius: var(--border-radius);
                cursor: pointer;
                transition: background-color 0.2s;
                margin-bottom: 4px;
            }

            .chat-list-item:hover {
                background-color: var(--hover-color);
            }

            .chat-list-item.active {
                background-color: var(--secondary-color);
            }

            /* Empty State Styles */
            .chat-empty {
                flex: 1;
                display: flex;
                align-items: center;
                justify-content: center;
                background: var(--background-white);
            }

            .empty-state {
                text-align: center;
                color: var(--text-secondary);
            }

            .chat-icon {
                width: 64px;
                height: 64px;
                margin-bottom: 16px;
                color: var(--text-secondary);
            }

            .empty-state h3 {
                margin: 0 0 8px;
                font-size: 20px;
                font-weight: 600;
                color: var(--text-primary);
            }

            .empty-state p {
                margin: 0;
                font-size: 14px;
            }

            /* Main Chat Area Styles */
            .chat-main {
                flex: 1;
                display: flex;
                flex-direction: column;
                background: var(--background-white);
            }

            .chat-main.hidden {
                display: none;
            }

            .chat-header {
                padding: 16px;
                border-bottom: 1px solid var(--divider-color);
                background: var(--background-white);
            }

            .chat-header-info h3 {
                margin: 0;
                font-size: 16px;
                font-weight: 600;
            }

            /* Messages Container Styles */
            .messages-container {
                flex: 1;
                overflow-y: auto;
                padding: 16px;
                background: var(--background-white);
            }

            .messages-list {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }

            /* Message Styles */
            .message {
                max-width: 60%;
                padding: 12px 16px;
                border-radius: 18px;
                font-size: 14px;
                line-height: 1.4;
            }

            .message.received {
                align-self: flex-start;
                background: var(--message-received);
                color: var(--text-primary);
                border-bottom-left-radius: 4px;
            }

            .message.sent {
                align-self: flex-end;
                background: var(--message-sent);
                color: white;
                border-bottom-right-radius: 4px;
            }

            /* Input Area Styles */
            .chat-input {
                padding: 16px;
                border-top: 1px solid var(--divider-color);
                background: var(--background-white);
            }

            .input-container {
                display: flex;
                align-items: center;
                gap: 8px;
                background: var(--secondary-color);
                padding: 8px;
                border-radius: 24px;
            }

            input {
                flex: 1;
                border: none;
                background: none;
                padding: 8px;
                font-size: 14px;
                outline: none;
                color: var(--text-primary);
            }

            input::placeholder {
                color: var(--text-secondary);
            }

            button {
                background: none;
                border: none;
                padding: 8px;
                cursor: pointer;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: background-color 0.2s;
            }

            button:hover {
                background: var(--hover-color);
            }

            .send-button {
                color: var(--primary-color);
            }

            .emoji-button {
                font-size: 18px;
            }

            .emoji-picker {
                position: absolute;
                bottom: 80px;
                right: 16px;
            }

            .emoji-picker.hidden {
                display: none;
            }

            /* Scrollbar Styles */
            ::-webkit-scrollbar {
                width: 6px;
            }

            ::-webkit-scrollbar-track {
                background: transparent;
            }

            ::-webkit-scrollbar-thumb {
                background: var(--divider-color);
                border-radius: 3px;
            }

            ::-webkit-scrollbar-thumb:hover {
                background: var(--text-secondary);
            }
        `;

        this.shadowRoot.appendChild(style);
        this.shadowRoot.appendChild(container);
        
        this.initializeElements();
        this.setupEventListeners();
        this.fetchConversations();
    }

    initializeElements() {
        this.elements = {
            chatList: this.shadowRoot.querySelector('.chat-list'),
            chatEmpty: this.shadowRoot.querySelector('.chat-empty'),
            chatMain: this.shadowRoot.querySelector('.chat-main'),
            messagesList: this.shadowRoot.querySelector('.messages-list'),
            chatHeaderInfo: this.shadowRoot.querySelector('.chat-header-info'),
            messageInput: this.shadowRoot.querySelector('input'),
            sendButton: this.shadowRoot.querySelector('.send-button'),
            emojiButton: this.shadowRoot.querySelector('.emoji-button'),
            emojiPicker: this.shadowRoot.querySelector('.emoji-picker')
        };

        // Initialize emoji picker
        const picker = document.createElement('emoji-picker');
        this.elements.emojiPicker.appendChild(picker);
    }

    setupEventListeners() {
        this.elements.messageInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });

        this.elements.sendButton.addEventListener('click', () => {
            this.sendMessage();
        });

        this.elements.emojiButton.addEventListener('click', () => {
            this.elements.emojiPicker.classList.toggle('hidden');
        });

        this.elements.emojiPicker.querySelector('emoji-picker').addEventListener('emoji-click', (event) => {
            this.elements.messageInput.value += event.detail.unicode;
        });
    }

    async fetchConversations() {
        try {
            const conversations = await fetchChat();
            this.renderConversations(conversations);
        } catch (error) {
            console.error('Error fetching conversations:', error);
        }
    }

    renderConversations(conversations) {
        if (!conversations?.length) {
            this.elements.chatEmpty.style.display = 'flex';
            return;
        }

        conversations.forEach(conversation => {
            const chatListItem = this.createChatListItem(conversation);
            const chatSocket = this.createChatSocket(conversation.target.username, chatListItem);
            this.chatSockets[conversation.target.username] = chatSocket;
            this.elements.chatList.appendChild(chatListItem);
        });
    }

    createChatListItem(conversation) {
        const item = document.createElement('div');
        item.className = 'chat-list-item';
        item.innerHTML = `
            <div class="chat-list-item-content">
                <h4>${conversation.target.username}</h4>
                <p>${conversation.last_message?.content || 'No messages yet'}</p>
            </div>
        `;

        item.addEventListener('click', () => {
            this.handleChatItemClick(item, conversation);
        });

        return item;
    }

    handleChatItemClick(item, conversation) {
        this.target = conversation.target.username;
        
        // Update UI
        this.shadowRoot.querySelector('.chat-list-item.active')?.classList.remove('active');
        item.classList.add('active');
        
        this.elements.chatEmpty.style.display = 'none';
        this.elements.chatMain.classList.remove('hidden');
        
        // Update header
        this.elements.chatHeaderInfo.innerHTML = `
			<div class=" d-flex justify-content-between align-items-center">
            	<h3 id="" class="mb-0 fs-4 text-light">${conversation.target.username}</h3>
				<button id="block-btn" class="text-light bg-danger fw-semibold fs-6 px-4 rounded">Block</button>
			</div>
        `;

        // Clear and load messages
        this.elements.messagesList.innerHTML = '';
        this.loadConversationMessages(conversation.id);
    }

    async loadConversationMessages(conversationId) {
        try {
            const messages = await getConversation(conversationId);
            if (messages?.length) {
                this.renderMessages(messages);
            }
        } catch (error) {
            console.error('Error loading messages:', error);
        }
    }

    renderMessages(messages) {
        messages.forEach(message => {
            this.addMessage(message);
        });
        this.scrollToBottom();
    }

    addMessage(message) {
        const messageElement = document.createElement('div');
        messageElement.className = `text-light bg-primary message ${message.sender === 'me' ? 'sent' : 'received'}`;
        messageElement.textContent = message.content;
        this.elements.messagesList.appendChild(messageElement);
    }

    sendMessage() {
        const content = this.elements.messageInput.value.trim();
        if (content && this.target) {
            this.chatSockets[this.target].send(JSON.stringify({
                'message': content,
            }));
            this.elements.messageInput.value = '';
        }
    }

    createChatSocket(target, chatListItem) {
        const ws = new WebSocket(
            `ws://localhost:8000/ws/chat/${target}/?token=${localStorage.getItem('access_token')}`
        );

        ws.onmessage = (e) => {
            const data = JSON.parse(e.data);
            this.addMessage(data);
            this.scrollToBottom();
        };

        ws.onclose = () => console.error('Chat socket closed unexpectedly');
        
        return ws;
    }

    scrollToBottom() {
        this.elements.messagesList.scrollTop = this.elements.messagesList.scrollHeight;
    }
}

customElements.define('messages-page', Messages);