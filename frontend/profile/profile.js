const username = document.querySelector(".user-info h1");
const menuBtn = document.querySelector(".menu-btn")
const menu = document.querySelector(".menu")
const sidebarHeader = document.querySelector(".sidebar-header")
const overlay = document.querySelector(".sidebar-overlay")

overlay.style.top = sidebarHeader.clientHeight + 'px';


menuBtn.addEventListener("click", e => {
	e.preventDefault()
	username.style.userSelect = 'none';
	if (menu.style.display == "block")
	{
		menuBtn.style.transform = "rotate(0deg)"
		menu.style.display = "none";
		overlay.style.display = "none";
	}
	else
	{
		menuBtn.style.transform = "rotate(180deg)"
		menu.style.display = "block";
		overlay.style.display = "block";
	}
})


const searchFriendModal = document.querySelector(".add-friend-modal")
const containerOverlay = document.querySelector(".container-overlay")
const closeBtn = document.querySelector(".add-friend-modal svg")
const searchfriendBtn = document.querySelector(".search-friend-btn")

searchfriendBtn.addEventListener("click", e => {
	containerOverlay.style.display = "block";
	searchFriendModal.style.display = "flex";
})

closeBtn.addEventListener("click", e => {
	e.preventDefault()
	searchFriendModal.style.display = "none";
	containerOverlay.style.display = "none";
})

