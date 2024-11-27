// import { normalizeDate } from "../../misc/dateUtils.js";
// import { limitText } from "../../misc/textUtils.js";

class ChatListItem extends HTMLElement {
    constructor() {
        super()
        this.chatListItemElement = document.createElement('div')
        this.appendChild(this.chatListItemElement);

        this.conversaton = null
        this.maxLength = 15
    }

    create() {
        const target = this.conversaton.target
        const lastMessage = this.conversaton.overview
        let message = null;
        let timestamp = null;

        if (!target.first_name) {
            target.first_name = target.username
        }
        if (lastMessage) {
            message = lastMessage.message
            timestamp = lastMessage.timestamp
        }
        this.chatListItemElement.className = 'd-flex align-items-center'
        this.chatListItemElement.innerHTML = `
            <div class="flex-shrink-0">
                <img class="user-img" src="${target.img_url}"
                    alt="user img">
                <span class="active"></span>
            </div>
            <div class="flex-grow-1 ms-3">
                <h3>${target.first_name} ${target.last_name}</h3>
                <p class="single-line-text">
                    ${limitText(message, this.maxLength)}
                    <span class="right-aligned-item">${normalizeDate(timestamp)}</span>
                </p>
            </div>
        `
        const p = this.chatListItemElement.querySelector('p')
        // if (lastMessage && lastMessage.seen_at) {
        //     p.innerHTML += `<span class="right-aligned-item">${normalizeDate(timestamp)}</span>`
        // } else {
        //     p.innerHTML += `<span class="unread-indicator start-100 badge rounded-pill bg-danger">1</span>`
        // }
        if (lastMessage && (lastMessage.seen_at || lastMessage.sender == window.UserData.id)) {
            p.classList.add('text-white-50')
        }
    }

    mute() {
        const p = this.chatListItemElement.querySelector('p')
        p.classList.add('text-white-50')
    }

    update(message) {
        const p = this.chatListItemElement.querySelector('p')
        p.firstChild.textContent = limitText(message.content, this.maxLength)
        p.lastElementChild.textContent = normalizeDate(message.timestamp)
        if (message.seen_at) {
            p.classList.add('text-white-50')
        } else {
            p.classList.remove('text-white-50')
        }
    }


    set config(data) {
        this.conversaton = data
        if (this.conversaton) {
            this.create()
        }
    }
}

customElements.define('chat-list-element', ChatListItem)

// export default ChatListItem