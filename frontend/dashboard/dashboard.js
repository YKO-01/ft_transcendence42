const cpu = document.querySelector(".cpu")
const player = document.querySelector(".player")
const ai = document.querySelector(".ai")

const modeCards = [{type: cpu, color: "#CD0024"}, {type: player, color: "#C0C400"}, {type: ai, color: "#091DC5"}]

modeCards.forEach(mode => {
	mode.type.addEventListener("mouseover", e => {
		if (e.target.classList.contains("mode-card"))
		{
			e.target.childNodes[1].style.color = "#fff";
			e.target.childNodes[1].style.background = "#020D14";
		}
	})
	mode.type.addEventListener("mouseleave", e => {
		e.target.childNodes[1].style.color = mode.color;
		e.target.childNodes[1].style.background = "none";
	})
})

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

