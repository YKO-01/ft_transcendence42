// import { normalizeDate } from "../../misc/dateUtils.js"
// import { limitText } from "../../misc/textUtils.js"

class Message extends HTMLElement {
    constructor() {
        super()
        this.messageElement = document.createElement('li')
        this.appendChild(this.messageElement)

        this.message = null
        this.maxLength = 200
        this.expanded = false
    }

    create() {
        this.messageElement.className = (window.UserData.id == this.message.sender ? 'sender' : 'reply')
        this.messageElement.innerHTML = `
            <p class="text-white"> ${limitText(this.message.content, this.maxLength)} </p>
            <span class="time">${normalizeDate(this.message.timestamp)}</span>
        `
        this.messageElement.onclick = this.expand
        this.messageElement.addEventListener('click', () => {
            if (!this.expanded) {
                this.messageElement.firstElementChild.textContent = this.message.content
                this.expanded = true
            } else {
                this.messageElement.firstElementChild.textContent = limitText(this.message.content, this.maxLength)
                this.expanded = false
            }
        })
    }

    set config(data) {
        this.message = data
        if (this.message) {
            this.create()
        }
    }
}

customElements.define('message-item', Message)

// export default Message