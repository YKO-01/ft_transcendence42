class SearchFriend extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        const friend = document.createElement('div');
        friend.id = "search-res-friend";
		friend.className = "d-flex justify-content-between align-items-center px-4 mb-2";
        friend.innerHTML = `<div class="d-flex align-items-center">
								<img src="${this.getAttribute("img")}" class="rounded me-2" height='32'></img>
								<p id="friend-name" class="mb-0 fs-5">${this.getAttribute("username")}</p>
                                </div>
                            <button id="${this.getAttribute("idUser")}"  class=" text-light px-2 py-1 round">Send</button>`
		const style = document.createElement('style');
        style.textContent = `
			@import url('https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css');
			.cursor-pointer
			{
				cursor: pointer;
			}
			#search-res-friend button{
                background-color: #4AB1B9; 
                border: 2px solid #4AB1B9;
                border-radius: 2px;
                font-size: 1rem;
            }
            #search-res-friend button:hover {
                background-color: transparent; 
            }
            #friend-name
            {
                color: #D8E1E1;
            }
			
		`;
        this.shadowRoot.append(style, friend);
        this.shadowRoot.querySelector('button').addEventListener('click', (e) => {
            // ////////console.log(e.target.id);
            this.sendRequest(e.target.id);
        });
    }
    async sendRequest(idUser){
        let response = await fetch(`http://127.0.0.1:8000/api/sendRequestFriend/`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                'id': idUser
            })
        })
        response = await handleAuthResponse(response, this.sendRequest);
        let data = await response.json();
        ////////console.log(data['message']);
    }
    
}

customElements.define('search-friend', SearchFriend);