class FriendsList extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
		// this.data = (this.getAttribute("data"))
		this.render()
	}
	render ()
	{
		//console.log((window.UserData.friends));
		// //console.log(this.data);
		const friendsList = document.createElement('div');
		friendsList.className = "mt-4";
		// getFriendOnline().then(result => //console.log(result))
		getFriendOnline().then(result => {
			result.forEach(element => {
				friendsList.innerHTML += `<single-friend name=${element.username} img_url=${element.img_url} id=${element.id} ></single-friend>`
			});
		})
		// window.UserData.friends.forEach(element => {
		// 	friendsList.innerHTML += `<single-friend name=${element.username} img_url=${element.img_url} id=${element.id} ></single-friend>`
		// });
		
		// ///s/df/sd/f/sd/f/s/df/s/df/
		const style = document.createElement('style');
        style.textContent = `
			@import url('https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css');
			.cursor-pointer
			{
				cursor: pointer;
			}
			img:hover {
				background: #fff;
			}
		`;
			
        this.shadowRoot.append(style, friendsList);
	}
        
    
	// update(){
	// 	Array.from(this.friendsList.children).forEach(child => child.remove());

	// 	window.UserData.friends.forEach(friend => {
	// 		const singleFriend = document.createElement('single-friend');
	// 		singleFriend.setAttribute("name", friend.username);
	// 		singleFriend.setAttribute("img_url", friend.img_url);
	// 		singleFriend.setAttribute("id", friend.id);
	// 		this.friendsList.append(singleFriend);
	// 	});
	// }
}

customElements.define('friends-list', FriendsList);