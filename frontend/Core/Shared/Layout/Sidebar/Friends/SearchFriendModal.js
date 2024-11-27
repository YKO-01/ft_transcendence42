class SearchFriendModal extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.inputValue = "";
        this.result = [];
        this.render();
    }

    render() {
        const searchFriendModal = document.createElement('div');
        searchFriendModal.className = `z-3 position-absolute top-0 start-0 end-0 bottom-0 ${this.getAttribute("class")}`;
        searchFriendModal.id = "overlay";

        // Create results HTML from this.result array
        const resultsHTML = this.result.map(element => `
		<search-friend img=${element.img_url} idUser=${element.id} username=${element.username}></search-friend>
        `).join('');

        searchFriendModal.innerHTML = /*html*/ `
            <div class="h-75 position-absolute pt-4 top-50 start-50 translate-middle w-75 d-flex flex-column justify-content-start align-items-center bg-dark z-3">
                <img id="close-modal" src="./Core/Shared/assets/exit.svg" class="position-absolute top-0 end-0 cursor-pointer" />
                <h1 class="text-light fw-bold">Discover New Friends</h1>
                <input value="${this.inputValue}" class="form-control search-input mb-1 flex" id="search-friend" type="text" placeholder="Search friends">
                <button id="submit-search" class="w-50 fs-5 mb-4 py-2">Search</button>
                <div class="friends-search-results overflow-auto">
                    ${resultsHTML}
                </div>
            </div>
        `;

        const style = document.createElement('style');
        style.textContent = `
            @import url('https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css');
            
            .cursor-pointer {
                cursor: pointer;
            }
            
            #overlay {
                background: rgba(0, 0, 0, 0.7);
            }
            
            .friends-search-results {
                width: 480px;
                max-height: 400px;
            }
            
            #close-modal:hover {
                background: #4AB1B9;
            }
        `;

        this.shadowRoot.innerHTML = "";
        this.shadowRoot.append(style, searchFriendModal);

        // Event Listeners
        this.shadowRoot.querySelector('#close-modal').addEventListener('click', () => {
            this.closeModal();
        });

        const inputField = this.shadowRoot.querySelector('#search-friend');
        inputField.addEventListener('input', (event) => {
            this.handleChange(event.target.value);
            this.render();
        });

        this.shadowRoot.querySelector('#submit-search').addEventListener("click", () => {
            //////console.log(this.inputValue);
            SeachUser(this.inputValue).then(result => {
                this.result = result.results;
                this.render();
            });
        });

        // Focus input and set cursor position
        inputField.focus();
        const valueLength = inputField.value.length;
        inputField.setSelectionRange(valueLength, valueLength);
    }

    closeModal() {
        this.remove();
    }

    handleChange(value) {
        this.inputValue = value;
    }
}

customElements.define('search-friend-modal', SearchFriendModal);