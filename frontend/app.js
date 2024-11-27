function getToken(){
	const urlParams = new URLSearchParams(window.location.search);
	const token = urlParams.get('token');
	if (token) {
		localStorage.setItem("token", token);
	} else {
		//console.log("Token not found in URL.");
	}
}
getToken();
check_auth();
let socket = null;
window.gameSocket = null;

const usersDB = [
	"user1",
	"user2",
	"user3",
	"user4",
	"testuser",
	"NoobMaster69"
]

const isUser = arg => {
	const target = usersDB.find(user => user.toLowerCase() == arg);
	if (target)
		return true;
	return false;
}

if (localStorage.getItem('isUserSignedIn') == 'true') {
	//console.log('User is signed in');
	let roomSocket = new WebSocket(`ws://localhost:8000/ws/rooms/?token=${localStorage.getItem('access_token')}`);
	roomSocket.onopen = () => {
		//console.log('WebSocket connection established');
		window.roomSocket = roomSocket;
	};
	roomSocket.onclose = () => {
		//console.log('WebSocket connection closed');
	};
} else {
	window.roomSocket = null;
}


const app = document.getElementById("app");
const urlRoutes = {
	404: {
		page: "/pages/404.html",
		title: "Not found",
		description: ""
	},
	"/dashboard": {
		page: "/pages/dashboard.html",
		title: "Dashboard",
		description: ""
	}
	,
	"/signin": {
		page: "/pages/signin.html",
		title: "Sign in",
		description: ""
	},
	"/signup": {
		page: "/pages/signup.html",
		title: "Sign up",
		description: ""
	},
	"/messages": {
		page: "/pages/messages.html",
		title: "Messages",
		description: ""
	},
	"/history": {
		page: "/pages/history.html",
		title: "History",
		description: ""
	},
	"/profile": {
		page: "/pages/profile.html",
		title: "Profile",
		description: ""
	},
	"/tournament": {
		page: "/pages/tournament.html",
		title: "Tournament",
		description: ""
	},
	"/online-game": {
		page: "/pages/online-game.html",
		title: "Online Game",
		description: ""
	},
	"/offline-game": {
		page: "/pages/offline-game.html",
		title: "Offline Game",
		description: ""
	},
	"/cpu-game": {
		page: "/pages/cpu-game.html",
		title: "CPU Game",
		description: ""
	},
	"/2fa": {
		page: "/pages/fa.html",
		title: "Two Factor Authentication",
		description: ""
	},
}

if (!JSON.parse(localStorage.getItem("isUserSignedIn")))
	localStorage.setItem("isUserSignedIn", JSON.stringify(false));
	  


const handleLayout = async (route) => {
	html = await fetch(route.page).then(response => response.text());
	if (route.title === "Sign up" || route.title === "Sign in" || route.title === "Two Factor Authentication")
		app.innerHTML = `<auth-layout route="${route.title}">${html}</auth-layout>`
	else if (route.title === "Dashboard" || route.title === "Profile")
		app.innerHTML = `<core-layout showHistory=${true}>${html}</core-layout>`;
	else {
		app.innerHTML = `<core-layout showHistory=${false}>${html}</core-layout>`;
	}
}


const urlLocationHandler = async () => {
	const location = window.location.pathname.toLowerCase();
	let route = urlRoutes[location] || urlRoutes[404];
	const storedUserData = localStorage.getItem('isUserSignedIn')

	if (JSON.parse(storedUserData) == true && (location == "/" || location == "/signin" || location == "/signup" || location == "/2fa")) {
		route = urlRoutes["/dashboard"];
		window.history.replaceState({}, "", "/");
	}
	else if (JSON.parse(storedUserData) == false && location != "/signin" && location != "/signup"  && location != "/2fa") {
		route = urlRoutes["/signin"];
		window.history.replaceState({}, "", "/signin");
	}
	document.title = `PING PONG | ${route.title}`;
	handleLayout(route);
	
}

window.onpopstate = urlLocationHandler;

urlLocationHandler();

const urlRoute = route => {
	window.history.pushState({}, "", route);
	urlLocationHandler();
}

const navigateTo = async (route) => {
	
	urlRoute(route)
};

