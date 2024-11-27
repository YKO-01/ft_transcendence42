import ChatListItem from "../component/chat/ChatListItem.js";
import ChatHeader from "../component/chat/ChatHeader.js"
import Message from "../component/chat/Message.js"
import { fetchChat, getConversation } from "../services/chatService.js";


function markMessageAsViewed(chatSocket) {
    chatSocket.send(JSON.stringify({
        'event': 'seen',
    }))
}

function createChatSocket(target, chatListItem) {
    const chatSocket = new WebSocket(
        'ws://localhost:8000/ws/chat/'
        + target
        + '/'
        + `?token=${localStorage.getItem('access_token')}`
    )

    chatSocket.onmessage = function (e) {
        const chatBody = document.querySelector(".msg-body ul")
        const data = JSON.parse(e.data)
        const messageItem = new Message()

        // if (data.sender != user.id) {
        //     if (chatListItem.chatListItemElement.classList.contains("active-chat")) {
        //         markMessageAsViewed(chatSocket)
        //         data.seen_at = new Date()
        //     }
        // } else {
        //     data.seen_at = new Date()
        // }
        messageItem.config = data
        chatBody.appendChild(messageItem)
        messageItem.scrollIntoView()

        if (chatBody.firstElementChild == messageItem) {
            chatBody.nextElementSibling.style.display = 'none'
        }
        chatListItem.update(data)
    }

    chatSocket.onclose = function (e) {
        console.error('Chat socket closed unexpectedly');
    }

    return chatSocket
}


{/* <div class="msg-search">
<input type="text" class="form-control" id="inlineFormInputGroup"
    placeholder="Search" aria-label="search">
</div> */}

function Chat() {
    const container = document.createElement('section')
    container.classList.add('message-area')
    container.innerHTML = `
        <div class="main-content">
            <div class="row">
                <div class="col-12">
                    <div class="chat-area">
                        <div class="chatlist">
                            <div class="modal-dialog-scrollable">
                                <div class="modal-content">
                                    <div class="chat-header">
                                        <ul class="nav nav-tabs" id="myTab" role="tablist">
                                            <li class="nav-item" role="presentation">
                                                <button class="nav-link active" id="Open-tab" data-bs-toggle="tab"
                                                    data-bs-target="#Open" type="button" role="tab" aria-controls="Open"
                                                    aria-selected="true">Conversations</button>
                                            </li>
                                        </ul>
                                    </div>
                                    <div class="modal-body">
                                        <div class="chat-lists">
                                            <div class="tab-content" id="myTabContent">
                                                <div class="tab-pane fade show active" id="Open" role="tabpanel"
                                                    aria-labelledby="Open-tab">
                                                    <div class="chat-list"></div>
                                                    <!-- <p class="chat-list-empty">No friends yet. Start adding some!</p> -->
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="chatbox-empty">
                            <svg class="chat-icon" xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="bi bi-chat"
                                viewBox="0 0 16 16">
                                <path
                                    d="M2.678 11.894a1 1 0 0 1 .287.801 11 11 0 0 1-.398 2c1.395-.323 2.247-.697 2.634-.893a1 1 0 0 1 .71-.074A8 8 0 0 0 8 14c3.996 0 7-2.807 7-6s-3.004-6-7-6-7 2.808-7 6c0 1.468.617 2.83 1.678 3.894m-.493 3.905a22 22 0 0 1-.713.129c-.2.032-.352-.176-.273-.362a10 10 0 0 0 .244-.637l.003-.01c.248-.72.45-1.548.524-2.319C.743 11.37 0 9.76 0 8c0-3.866 3.582-7 8-7s8 3.134 8 7-3.582 7-8 7a9 9 0 0 1-2.347-.306c-.52.263-1.639.742-3.468 1.105" />
                            </svg>
                            <p>Your Messages</p>
                            <span>Send a message to start a chat.</span>
                        </div>
                        <div class="chatbox">
                            <div class="modal-dialog-scrollable">
                                <div class="modal-content">
                                    <div class="msg-head">
                                    </div>
                                    <div class="modal-body">
                                        <div class="msg-body">
                                            <ul></ul>
                                            <p class="msg-body-empty">No messages yet. Start the conversation now!</p>
                                        </div>
                                    </div>
                                    <div class="send-box">
                                        <div class="send-form">
                                            <div class="input-wrapper">
                                            <input type="text" class="form-control" aria-label="message…" placeholder="Write message…">
                                            <button id="emoji-button" type="button">🙂</button>
                                            </div>
                                            <button class="mb-1" id="message-button" type="button"><i class="fa-solid fa-paper-plane"></i></button>
                                        </div>
                                        <div id="emoji-picker" class="hidden"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `

    container.querySelector(".chat-list div")?.addEventListener('click', function () {
        container.querySelector(".chatbox").classList.add('showbox');
        return false;
    });

    const emptyChatBox = container.querySelector(".chatbox-empty")
    const chatBox = container.querySelector(".chatbox")
    const chatBody = container.querySelector(".msg-body ul")
    const chatList = container.querySelector(".chat-list")
    const chatHeader = container.querySelector(".msg-head")

    const messageInput = container.querySelector(".send-box input")
    const sendButton = container.querySelector("#message-button")
    const emojiButton = container.querySelector('#emoji-button');
    const emojiPicker = container.querySelector('#emoji-picker');

    const picker = document.createElement('emoji-picker');
    emojiPicker.appendChild(picker)

    const chatSockets = {}
    let target = null

    fetchChat()
        .then(conversations => {
            if (!conversations?.length) {
                emptyChatBox.style.display = 'flex'
                return;
            }
            conversations.forEach(conversation => {
                const chatListItem = new ChatListItem()
                const chatSocket = createChatSocket(conversation.target.username, chatListItem)
                chatSockets[conversation.target.username] = chatSocket
                chatListItem.config = conversation
                chatListItem.addEventListener('click', () => {
                    target = conversation.target.username
                    markMessageAsViewed(chatSockets[target])
                    chatListItem.mute()
                    const conversationHeader = new ChatHeader()
                    conversationHeader.config = conversation
                    chatList.querySelector('.active-chat')?.classList.remove('active-chat')
                    chatListItem.chatListItemElement.classList.add('active-chat')
                    emptyChatBox.remove()
                    chatBox.style.display = 'block'
                    chatBox.classList.add("showbox")
                    chatHeader.replaceChild(conversationHeader, chatHeader.firstChild)
                    chatBody.replaceChildren()
                    getConversation(conversation.id).then(messages => {
                        if (!messages?.length) {
                            chatBody.nextElementSibling.style.display = 'block'
                            return;
                        }
                        messages.forEach((message) => {
                            const messageItem = new Message()
                            messageItem.config = message
                            chatBody.appendChild(messageItem)
                        })
                        chatBody.lastChild.scrollIntoView()
                    })
                })
                chatList.appendChild(chatListItem)
            });
        }).catch(error => {
            ////////console.log(error)
        })

    messageInput.onkeyup = function (e) {
        e.preventDefault()
        if (e.key == 'Enter') {
            sendButton.click()
        }
    }

    sendButton.addEventListener('click', function (e) {
        const content = messageInput.value
        if (content) {
            chatSockets[target].send(JSON.stringify({
                'message': content,
            }))
        }
        messageInput.value = ''
    })

    emojiButton.addEventListener('click', () => {
        emojiPicker.classList.toggle('hidden');
    })

    picker.addEventListener('emoji-click', event => {
        messageInput.value += event.detail.unicode;
    });
    return container
}

export default Chat
