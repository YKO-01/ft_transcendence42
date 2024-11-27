// import { deleteChat } from "../../services/chatService.js"

class ChatHeader extends HTMLElement {
    constructor() {
        super()
        this.chatHeader = document.createElement('div')
        this.appendChild(this.chatHeader)

        this.conversation = null
    }

    create() {
        this.chatHeader.className = "row"
        this.chatHeader.innerHTML = `
            <div class="col-8">
                <div class="d-flex align-items-center">
                    <div class="flex-shrink-0 mt-1">
                        <img class="user-img" src="${this.conversation.target.img_url}"
                            alt="user img">
                    </div>
                    <div class="flex-grow-1 ms-3">
                        <h3>${this.conversation.target.first_name ? this.conversation.target.first_name : this.conversation.target.username} ${this.conversation.target.last_name}</h3>
                        <p>@${this.conversation.target.username}</p>
                    </div>
                </div>
            </div>
            <div class="col-4">
                <ul class="moreoption">
                    <li class="navbar nav-item dropdown">
                        <a class="nav-link dropdown-toggle pt-2" href="#" role="button"
                            data-bs-toggle="dropdown" aria-expanded="false"><i
                                class="fa fa-ellipsis-v" aria-hidden="true"></i></a>
                        <ul class="dropdown-menu">
                            <li><a class="dropdown-item" id="invite-game-btn" href="#">Invite</a></li>
                            <li><a class="dropdown-item" id="delete-chat-btn" href="#">Delete</a></li>
                            <li>
                                <hr class="dropdown-divider">
                            </li>
                            <li><a class="dropdown-item text-danger" id="block-user-btn" href="#">Block</a>
                            </li>
                        </ul>
                    </li>
                </ul>
            </div>
        `
        const deleteButton = this.chatHeader.querySelector("#delete-chat-btn")
        deleteButton.addEventListener('click', async () => {
            await deleteChat(this.conversation);
        })
    }

    set config(data) {
        this.conversation = data
        if (this.conversation) {
            this.create()
        }
    }
}

customElements.define('chat-header-element', ChatHeader)

// export default ChatHeader